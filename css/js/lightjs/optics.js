class Line {
	constructor(x1, y1, dx, dy) {
		this.pos = createVector(x1, y1);
		this.displacement = createVector(dx, dy);
		this.dir = this.displacement.copy().normalize();
		this.length = this.displacement.mag();
		this.strokeWeight = 2;
		this.color = color(255, 150);
	}

	render() {
		stroke(...this.color.levels);
		strokeWeight(this.strokeWeight);
		line(this.pos.x, this.pos.y, this.pos.x + this.displacement.x, this.pos.y + this.displacement.y);

		if (mouse.isHolding(this)) {
			this.drawHandles();
		}
	}

	drawHandles() {
		fill(0, 255, 0);
		noStroke();
		rectMode(CENTER);
		rect(this.pos.x, this.pos.y, this.strokeWeight * 2, this.strokeWeight * 2);
		rect(this.pos.x + this.displacement.x, this.pos.y + this.displacement.y, this.strokeWeight * 2, this.strokeWeight * 2);
	}

	setPos(x, y) {
		this.pos.set(x, y);
	}

	contains(pt) {
		const d1 = dist(pt.pos.x, pt.pos.y, this.pos.x, this.pos.y);
		const d2 = dist(pt.pos.x, pt.pos.y, this.pos.x + this.displacement.x, this.pos.y + this.displacement.y);
		if (d1 <= (this.resizer || 6)) return 'resizeB';
		if (d2 <= (this.resizer || 6)) return 'resize';
		return (d1 + d2 >= this.length - this.strokeWeight / 2 && d1 + d2 <= this.length + this.strokeWeight / 2);
	}

	setDir(target, morph = false, snapAngle = false) {
		const dir = p5.Vector.sub(target, this.pos).normalize();
		if (dir.mag() === 0) return;
		this.dir.set(dir);
		const displacement = morph ? p5.Vector.sub(target, this.pos) : this.dir.copy().mult(this.length);
		this.displacement.set(displacement);
		if (morph) this.length = this.displacement.mag();
	}

	morph(target, tag) {
		switch (tag) {
			case 'rotate':
				this.setDir(target.pos, false, keyIsDown(16));
				break;
			case 'resizeB':
				const end = p5.Vector.add(this.pos, this.displacement);
				this.pos.set(target.pos.x - target.dis.x, target.pos.y - target.dis.y);
				this.setDir(end, true, keyIsDown(16));
				break;
			case 'resize':
				this.setDir(target.pos, true, keyIsDown(16));
				break;
			default:
				this.pos.set(target.pos.x - target.dis.x, target.pos.y - target.dis.y);
		}
	}

	duplicate() {
		const duplicate = new this.constructor(this.pos.x, this.pos.y, this.displacement.x, this.displacement.y);
		objects.push(duplicate);
		return duplicate;
	}
}

class Lens extends Line {
	constructor(x1, y1, dx, dy, fLength = 200) {
		super(x1, y1, dx, dy);
		this.color = color(255, 255, 255, 50);
		this.fLength = fLength;
		this.className = Lens;
		this.properties = [{
			onchange: v => { this.fLength = parseInt(v); updateFlag = true; },
			name: '焦距',
			type: 'number',
			tags: el => { el.step = 2; },
			default: () => this.fLength,
		}];
	}

	returnRay(ray, pt) {
		const O = p5.Vector.add(this.pos, p5.Vector.mult(this.displacement, 0.5));
		const angleOfIncidence = this.dir.angleBetween(ray.dir) - HALF_PI;
		const OP = ray.dir.copy().mult(this.fLength / cos(angleOfIncidence));

		ray.end = pt;
		const newDir = OP.sub(p5.Vector.sub(pt, O)).normalize().mult(sign(this.fLength));
		return new Ray(ray.end, newDir, ray.color);
	}

	static build(holder) {
		const lens = new Lens(holder.pos.x, holder.pos.y, 5, 5);
		objects.push(lens);
		return lens;
	}

	duplicate() {
		const duplicate = new Lens(this.pos.x, this.pos.y, this.displacement.x, this.displacement.y, this.fLength);
		objects.push(duplicate);
		return duplicate;
	}
}

class Mirror extends Line {
	constructor(x1, y1, dx, dy) {
		super(x1, y1, dx, dy);
		this.color = color(255, 255, 255, 100);
		this.className = Mirror;
	}

	returnRay(ray, pt) {
		ray.end = pt;
		return Ray.reflect(ray, this.dir);
	}

	static build(holder) {
		const mirror = new Mirror(holder.pos.x, holder.pos.y, 5, 5);
		objects.push(mirror);
		return mirror;
	}
}

class Void extends Line {
	constructor(x1, y1, dx, dy) {
		super(x1, y1, dx, dy);
		this.color = color(255, 0, 0, 100);
		this.className = Void;
	}

	returnRay(ray, pt) {
		ray.end = pt;
	}

	static build(holder) {
		const voidObj = new Void(holder.pos.x, holder.pos.y, 5, 5);
		objects.push(voidObj);
		return voidObj;
	}
}

class Filter extends Line {
	constructor(x1, y1, dx, dy, fill) {
		super(x1, y1, dx, dy);
		fill.levels[3] = 100;
		this.color = fill;
		this.className = Filter;
	}

	returnRay(ray, pt) {
		ray.end = pt;

		const reflectedColor = ray.color.levels.map((level, i) => level - this.color.levels[i]);
		const transmittedColor = this.color.levels.map((level, i) => Math.max(level + reflectedColor[i], 0));
		const reflectedIntensity = reflectedColor.reduce((sum, l) => sum + Math.max(l, 0), 0);
		const transmittedIntensity = transmittedColor.reduce((sum, l) => sum + Math.max(l, 0), 0);

		const rays = [];
		if (reflectedIntensity > 0) {
			const reflectedRay = Ray.reflect(ray, this.dir);
			reflectedRay.color = color(...reflectedColor, ray.color.levels[3]);
			rays.push(reflectedRay);
		}
		if (transmittedIntensity > 0) {
			const transmittedRay = new Ray(ray.end, ray.dir.copy(), color(...transmittedColor, ray.color.levels[3]));
			rays.push(transmittedRay);
		}

		return rays;
	}

	static build(holder) {
		const filter = new Filter(holder.pos.x, holder.pos.y, 5, 5, holder.color);
		objects.push(filter);
		return filter;
	}

	duplicate() {
		const duplicate = new Filter(this.pos.x, this.pos.y, this.displacement.x, this.displacement.y, color(...this.color.levels));
		objects.push(duplicate);
		return duplicate;
	}
}
