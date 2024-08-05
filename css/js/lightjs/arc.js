class Arc {
	constructor(x, y, r, angleS, angleD) {
		this.pos = createVector(x, y);
		this.r = r;
		this.angleS = angleS;
		this.angleD = angleD;
		this.rStart = p5.Vector.fromAngle(angleS).mult(r);
		this.rEnd = p5.Vector.fromAngle(angleS + angleD).mult(r);
		this.strokeWeight = 2;
		this.color = color(255, 255, 255, 150);
		this.className = Arc;
	}

	setPos(x, y) {
		this.pos.set(x, y);
	}

	render() {
		noFill();
		stroke(this.color);
		strokeWeight(this.strokeWeight);
		arc(this.pos.x, this.pos.y, this.r * 2, this.r * 2, this.angleS, this.angleD + this.angleS);

		if (mouse.isHolding(this)) {
			rectMode(CENTER);
			noStroke();
			fill(255, 0, 0);
			rect(this.pos.x + this.rStart.x, this.pos.y + this.rStart.y, 5, 5);
			fill(0, 255, 0);
			rect(this.pos.x + this.rEnd.x, this.pos.y + this.rEnd.y, 5, 5);
		}
	}

	contains(pt) {
		const p = pt.pos || pt;
		if (Circle.contains(this.rStart.x + this.pos.x, this.rStart.y + this.pos.y, 5, p.x, p.y)) return 'rotate';
		if (Circle.contains(this.rEnd.x + this.pos.x, this.rEnd.y + this.pos.y, 5, p.x, p.y)) return 'resize';

		const OP = p5.Vector.sub(p, this.pos);
		const d = OP.magSq();
		const withinRadius = d >= (this.r - this.strokeWeight) ** 2 && d <= (this.r + this.strokeWeight) ** 2;

		return withinRadius && this.withinArc(OP.heading());
	}

	withinArc(angle) {
		angle = (angle + TWO_PI) % TWO_PI;
		const start = this.angleS;
		const end = this.angleS + this.angleD;
		return end > TWO_PI ? angle >= start || angle <= end - TWO_PI : angle >= start && angle <= end;
	}

	morph(target, tag) {
		const OP = p5.Vector.sub(target.pos, this.pos);
		switch (tag) {
			case 'rotate':
				this.angleS = fixAngles(OP.heading())[0];
				this.rStart = OP.setMag(this.r);
				this.rEnd = this.rStart.copy().rotate(this.angleD);
				break;

			case 'resize':
				this.angleD = fixAngles(OP.heading() - this.angleS)[0];
				this.r = OP.mag();
				this.rStart.setMag(this.r);
				this.rEnd = p5.Vector.fromAngle(this.angleS + this.angleD).mult(this.r);
				break;

			default:
				this.pos.set(target.pos.x - target.dis.x, target.pos.y - target.dis.y);
		}
	}

	returnRay(ray, pt) {
		const dir = p5.Vector.sub(pt, this.pos).rotate(HALF_PI).normalize();
		ray.end = pt;
		return Ray.reflect(ray, dir);
	}

	static build(holder) {
		if (holder.buildHistory.length < 1) return false;
		const startPos = holder.buildHistory[0];
		const radius = p5.Vector.sub(startPos, holder.pos).mag();
		const startAngle = fixAngles(p5.Vector.sub(startPos, holder.pos).heading() - PI)[0];
		const arc = new Arc(startPos.x, startPos.y, radius, startAngle, 0.1);
		objects.push(arc);
		return arc;
	}

	duplicate() {
		const copy = new Arc(this.pos.x, this.pos.y, this.r, this.angleS, this.angleD);
		objects.push(copy);
		return copy;
	}
}
