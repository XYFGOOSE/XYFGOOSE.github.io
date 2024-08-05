class PolygonalBlock {
	constructor(vertices, n = 1.5) {
	  this.vertices = vertices;
	  this.segments = this.createSegments(vertices);
	  this.pos = this.calculateCentroid(vertices);
	  this.color = color(255, n / 10 * 255);
	  this.n = n;
	  this.buildMorph = false;
	  this.className = PolygonalBlock;
  
	  this.properties = [
		{
		  onchange: v => { this.n = parseFloat(v); updateFlag = true; },
		  name: '折射率',
		  type: 'range',
		  tags: el => { el.min = 1; el.max = 3.5; el.step = 0.05; },
		  default: () => this.n,
		}
	  ];
	}
  
	createSegments(vertices) {
	  return vertices.map((v, i) => {
		let nextV = vertices[(i + 1) % vertices.length];
		return new Mirror(v[0], v[1], nextV[0] - v[0], nextV[1] - v[1]);
	  });
	}
  
	calculateCentroid(vertices) {
	  let sumX = vertices.reduce((sum, v) => sum + v[0], 0);
	  let sumY = vertices.reduce((sum, v) => sum + v[1], 0);
	  return createVector(sumX / vertices.length, sumY / vertices.length);
	}
  
	render() {
	  fill(255, map(this.n ** 2, 1, 9, 50, 255));
	  stroke(255, 0, 0);
	  strokeWeight(3);
	  beginShape();
	  for (let v of this.vertices) {
		vertex(...v);
		if (mouse.isHolding(this)) point(...v);
	  }
	  endShape();
	}
  
	updateLines() {
	  this.segments.forEach((seg, i) => {
		let v1 = this.vertices[i];
		let v2 = this.vertices[(i + 1) % this.vertices.length];
		seg.pos.set(v1[0], v1[1]);
		seg.displacement.set(v2[0] - v1[0], v2[1] - v1[1]);
		seg.dir = seg.displacement.copy().normalize();
	  });
	}
  
	contains(pt, isMouse) {
	  let p = pt.pos || pt;
	  if (isMouse !== false) {
		return this.vertices.findIndex(v => Circle.contains(v[0], v[1], 8, p.x, p.y));
	  }
	  const ray = new Ray(p, createVector(1, 0));
	  return ray.doesCollide(this).length % 2 !== 0;
	}
  
	returnRay(ray, pt) {
	  ray.end = pt;
	  let i = HALF_PI - ray.dir.angleBetween(pt.line.dir);
	  return Ray.refract(this.contains(mid(ray.pos, pt), false) ? 'outof' : 'into', ray, pt.line.dir, i, this);
	}
  
	setPos(x, y) {
	  let diff = createVector(x, y).sub(this.pos);
	  this.pos.set(x, y);
	  this.vertices.forEach(v => {
		v[0] += diff.x;
		v[1] += diff.y;
	  });
	  this.updateLines();
	}
  
	morph(target, prop) {
	  if (prop == 'none') return;
	  if (!isNaN(prop)) {
		this.vertices[prop] = [target.pos.x, target.pos.y];
		this.updateLines();
	  } else {
		this.setPos(target.pos.x - target.dis.x, target.pos.y - target.dis.y);
	  }
	}
  
	static build(holder) {
	  if (holder.buildHistory.length > 2) {
		let first = holder.buildHistory[0];
		if (!Circle.contains(first.x, first.y, 10, holder.pos.x, holder.pos.y)) return false;
	  } else {
		return false;
	  }
	  let vertices = mouse.buildHistory.map(v => [v.x, v.y]);
	  let block = new PolygonalBlock(vertices);
	  objects.push(block);
	  return block;
	}
  
	duplicate() {
	  let newVertices = this.vertices.map(v => [...v]);
	  let block = new PolygonalBlock(newVertices, this.n);
	  objects.push(block);
	  return block;
	}
  }
  
  class RectBlock extends PolygonalBlock {
	constructor(x, y, w, h, n) {
	  let vertices = Array.isArray(x) ? x : [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
	  super(vertices, n);
	  this.buildMorph = true;
	  this.className = RectBlock;
	}
  
	morph(target, prop) {
	  if (prop === 'resize') {
		let [mM, m, mP] = [1, 2, 3];
		this.vertices[mM] = [target.pos.x, this.vertices[mM][1]];
		this.vertices[m] = [target.pos.x, target.pos.y];
		this.vertices[mP] = [this.vertices[mP][0], target.pos.y];
		this.updateLines();
	  } else {
		super.morph(target, prop);
	  }
	}
  
	static build(holder) {
	  let block = new RectBlock(holder.pos.x, holder.pos.y, 5, 5, 1.5);
	  objects.push(block);
	  return block;
	}
  }
  
  class CircularBlock extends Circle {
	constructor(x, y, r, n = 1.5) {
	  super(x, y, r);
	  this.n = n;
	  this.resizer = new p5.Vector(this.r, 0);
	  this.className = CircularBlock;
  
	  this.properties = [
		{
		  onchange: v => { this.n = parseFloat(v); updateFlag = true; },
		  name: '折射率',
		  type: 'range',
		  tags: el => { el.min = 1; el.max = 3.5; el.step = 0.1; },
		  default: () => this.n,
		}
	  ];
	}
  
	render() {
	  noStroke();
	  fill(255, map(this.n ** 2, 1, 20, 50, 255));
	  ellipse(this.pos.x, this.pos.y, this.r * 2);
	  if (mouse.isHolding(this)) {
		fill(255, 0, 0);
		rectMode(CENTER);
		rect(this.pos.x + this.resizer.x, this.pos.y + this.resizer.y, 5, 5);
		rect(this.pos.x, this.pos.y, 5, 5);
	  }
	}
  
	contains(pt, isMouse) {
	  let p = pt.pos || pt;
	  if (isMouse !== false && Circle.contains(this.pos.x + this.resizer.x, this.pos.y + this.resizer.y, 5, p.x, p.y)) {
		return 'resize';
	  }
	  return Circle.contains(this.pos.x, this.pos.y, this.r, p.x, p.y);
	}
  
	morph(target, tag) {
	  if (tag === 'resize') {
		let OP = p5.Vector.sub(target.pos, this.pos);
		this.resizer = OP;
		this.r = OP.mag();
	  } else {
		this.pos.set(target.pos.x - target.dis.x, target.pos.y - target.dis.y);
	  }
	}
  
	returnRay(ray, pt) {
	  let dir = p5.Vector.sub(pt, this.pos);
	  dir.set(-dir.y, dir.x).div(this.r);
	  ray.end = pt;
	  let i = HALF_PI - ray.dir.angleBetween(dir);
	  return Ray.refract(this.contains(mid(ray.pos, pt), false) ? 'outof' : 'into', ray, dir, i, this);
	}
  
	static build(holder) {
	  let block = new CircularBlock(holder.pos.x, holder.pos.y, 10, 1.5);
	  objects.push(block);
	  return block;
	}
  
	duplicate() {
	  let block = new CircularBlock(this.pos.x, this.pos.y, this.r, this.n);
	  objects.push(block);
	  return block;
	}
	
  }
  