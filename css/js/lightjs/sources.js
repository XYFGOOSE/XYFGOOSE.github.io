class PointSource extends Circle {
	constructor(x, y) {
	  super(x, y, 5);
	  this.rays = [];
	  this.updateFlag = true;
	}
  
	setPos(x, y) {
	  this.pos.set(x, y);
	}
  
	render() {
	  this.rays.forEach(ray => ray.render());
  
	  fill(255, 0, 0);
	  noStroke();
	  rectMode(CENTER);
	  rect(this.pos.x, this.pos.y, this.r * 1.5, this.r * 1.5);
  
	  if (mouse.isHolding(this) && this.dir) {
		rect(this.pos.x + this.dir.x * 20, this.pos.y + this.dir.y * 20, this.r, this.r);
	  }
	}
  
	handle(objects) {
	  this.rays.forEach(ray => ray.handle(objects));
	}
  }
  
  class RaySource extends PointSource {
	constructor(x, y, angle, fill) {
	  super(x, y);
	  this.color = fill;
	  this.dir = p5.Vector.fromAngle(angle);
	  this.rays.push(new Ray(this.pos, this.dir, this.color));
  
	  this.properties = [
		{
		  onchange: v => { this.color.levels[3] = parseInt(v); updateFlag = true; },
		  name: '强度',
		  type: 'range',
		  tags: el => { el.min = 30; el.max = 255; },
		  default: () => this.color.levels[3],
		}
	  ];
	  this.className = RaySource;
	}
  
	static build(holder) {
	  const colorLevels = holder.color.levels || [255, 255, 255, 255];
	  const n = new RaySource(holder.pos.x, holder.pos.y, 0, color(...colorLevels));
	  sources.push(n);
	  return n;
	}
  
	duplicate() {
	  const n = new RaySource(this.pos.x, this.pos.y, this.dir.heading(), color(...this.color.levels));
	  sources.push(n);
	  return n;
	}
  
	contains(pt) {
	  if (Circle.contains(this.pos.x + this.dir.x * 20, this.pos.y + this.dir.y * 20, this.r, pt.pos.x, pt.pos.y)) {
		return "rotate";
	  }
	  return Circle.contains(this.pos.x, this.pos.y, this.r, pt.pos.x, pt.pos.y);
	}
  
	setDir(target) {
	  const dir = p5.Vector.sub(target.pos, this.pos).normalize();
	  if (dir.mag() > 0) this.dir.set(dir);
	}
  
	morph(target, tag) {
	  if (tag === 'rotate' || tag === 'resize') {
		this.setDir(target);
	  } else {
		this.pos.set(target.pos.x - target.dis.x, target.pos.y - target.dis.y);
	  }
	}
  }
  
  class PointLight extends PointSource {
	constructor(x, y, freq = 10, fill) {
	  super(x, y);
	  this.r = 4;
	  this.color = fill;
	  this.freq = freq;
	  this.resetRays();
  
	  this.properties = [
		{
		  onchange: v => { this.freq = parseInt(v); updateFlag = true; this.resetRays(); },
		  name: '强度',
		  type: 'number',
		  tags: el => { el.min = 1; },
		  default: () => this.freq,
		},
		{
		  onchange: v => { this.color.levels[3] = parseInt(v); updateFlag = true; },
		  name: '强度',
		  type: 'range',
		  tags: el => { el.min = 30; el.max = 255; },
		  default: () => this.color.levels[3],
		}
	  ];
	  this.className = PointLight;
	}
  
	resetRays() {
	  this.rays = [];
	  const inc = TWO_PI / this.freq;
	  for (let i = 0; i <= TWO_PI; i += inc) {
		this.rays.push(new Ray(this.pos, p5.Vector.fromAngle(i), this.color));
	  }
	}
  
	morph(target, tag) {
	  if (tag === 'rotate' || tag === 'resize') {
		this.freq = int(p5.Vector.sub(this.pos, target.pos).magSq() / 100);
		this.resetRays();
	  } else {
		this.pos.set(target.pos.x - target.dis.x, target.pos.y - target.dis.y);
	  }
	}
  
	static build(holder) {
	  const colorLevels = holder.color.levels || [255, 255, 255, 255];
	  const n = new PointLight(holder.pos.x, holder.pos.y, 50, color(...colorLevels));
	  sources.push(n);
	  return n;
	}
  
	duplicate() {
	  const n = new PointLight(this.pos.x, this.pos.y, this.freq, color(...this.color.levels));
	  sources.push(n);
	  return n;
	}
  }
  
  class Beam {
	constructor(x1, y1, angle, length, freq = 10, fill) {
	  this.pos = createVector(x1, y1);
	  this.strokeWeight = 4;
	  this.length = length;
	  this.freq = freq;
	  this.color = fill;
  
	  this.dir = p5.Vector.fromAngle(angle);
	  this.displacement = p5.Vector.fromAngle(angle + HALF_PI).mult(length);
  
	  this.rays = [];
	  this.className = Beam;
  
	  this.properties = [
		{
		  onchange: v => { this.freq = parseInt(v); updateFlag = true; this.resetRays(); },
		  name: '强度',
		  type: 'number',
		  tags: el => { el.min = 1; },
		  default: () => this.freq,
		},
		{
		  onchange: v => { this.color.levels[3] = parseInt(v); updateFlag = true; },
		  name: '强度',
		  type: 'range',
		  tags: el => { el.min = 30; el.max = 255; },
		  default: () => this.color.levels[3],
		}
	  ];
	}
  
	render() {
	  this.rays.forEach(ray => ray.render());
  
	  stroke(255);
	  strokeWeight(this.strokeWeight);
	  line(this.pos.x, this.pos.y, this.pos.x + this.displacement.x, this.pos.y + this.displacement.y);
  
	  if (mouse.isHolding(this)) {
		fill(255, 0, 0);
		rectMode(CENTER);
		noStroke();
		rect(this.pos.x, this.pos.y, 5, 5);
		fill(0, 0, 255);
		rect(this.pos.x + this.displacement.x, this.pos.y + this.displacement.y, 5, 5);
	  }
	}
  
	setPos(x, y) {
	  this.pos.set(x, y);
	}
  
	handle(objects) {
	  this.rays.forEach(ray => ray.handle(objects));
	}
  
	contains(pt) {
	  const d1 = dist(pt.pos.x, pt.pos.y, this.pos.x, this.pos.y);
	  const d2 = dist(pt.pos.x, pt.pos.y, this.pos.x + this.displacement.x, this.pos.y + this.displacement.y);
	  const lineLen = this.displacement.mag();
  
	  if (d1 <= 6) return 'rotate';
	  if (d2 <= 6) return 'resize';
  
	  return (d1 + d2 >= lineLen - this.strokeWeight / 2 && d1 + d2 <= lineLen + this.strokeWeight / 2);
	}
  
	setPos(target, off) {
	  this.pos.set(target.x - off.x, target.y - off.y);
	  this.reposRays();
	}
  
	setDir(target, morph, snapAngle) {
	  let displacement = p5.Vector.sub(target, this.pos);
	  if (snapAngle) {
		displacement = displacement.heading() % QUARTER_PI === 0 ? displacement : p5.Vector.fromAngle(0);
	  }
	  if (displacement.mag() > 0) {
		if (!morph) {
		  displacement.setMag(this.length);
		} else {
		  this.length = displacement.mag();
		  const adjustedLength = this.length - this.length % this.freq;
		  if (adjustedLength > 0) this.length = adjustedLength;
		}
		this.displacement.set(displacement);
  
		const dir = this.displacement.copy().rotate(-HALF_PI).normalize();
		this.dir.set(dir);
  
		morph ? this.resetRays() : this.reposRays();
	  }
	}
  
	reposRays() {
	  const inc = 100 / this.freq;
	  this.rays.forEach((ray, i) => {
		const v = p5.Vector.add(this.pos, p5.Vector.mult(this.displacement, (i * inc) / this.length));
		ray.pos.set(v.x, v.y);
	  });
	}
  
	resetRays() {
	  this.rays = [];
	  const inc = 100 / this.freq;
	  for (let i = 0; i <= this.length; i += inc) {
		const r = new Ray(p5.Vector.add(this.pos, p5.Vector.mult(this.displacement, i / this.length)), this.dir, this.color);
		this.rays.push(r);
	  }
	}
  
	static build(holder) {
	  const colorLevels = holder.color.levels || [255, 255, 255, 255];
	  const n = new Beam(holder.pos.x, holder.pos.y, 0, 10, 10, color(...colorLevels));
	  sources.push(n);
	  return n;
	}
  
	duplicate() {
	  const n = new Beam(this.pos.x, this.pos.y, this.dir.heading(), this.length, this.freq, color(...this.color.levels));
	  n.resetRays();
	  sources.push(n);
	  return n;
	}
  
	morph(target, tag) {
	  switch (tag) {
		case 'rotate':
		  this.setDir(target.pos, false, keyIsDown(16));
		  break;
		case 'resize':
		  this.setDir(target.pos, true, keyIsDown(16));
		  break;
		default:
		  this.setPos(target.pos, target.dis);
	  }
	}
  }
  