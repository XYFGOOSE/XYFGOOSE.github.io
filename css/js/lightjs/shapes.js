var Vector = p5.Vector;

class Shape {
	constructor(x, y) {
		this.pos = new Vector(x, y);
	}

	intersects(shape) {
		return Shape.doIntersect(this, shape);
	}

	static doIntersect(shapeA, shapeB) {
		if (shapeB instanceof Rectangle) return shapeA.intersectsRect(shapeB.pos.x, shapeB.pos.y, shapeB.w, shapeB.h);
		if (shapeB instanceof Circle) return shapeA.intersectsCircle(shapeB.pos.x, shapeB.pos.y, shapeB.r);
	}
}

class Rectangle extends Shape {
	constructor(x, y, w, h = w, color) {
		super(x, y);
		this.w = w;
		this.h = h;
		this.color = color;
	}

	contains(point) {
		return Rectangle.contains(this.pos.x, this.pos.y, this.w, this.h, point.pos.x, point.pos.y);
	}

	static contains(x, y, w, h, px, py) {
		return px >= x - w && px <= x + w && py >= y - h && py <= y + h;
	}

	intersectsCircle(x, y, r) {
		const xDist = abs(this.pos.x - x);
		const yDist = abs(this.pos.y - y);
		return (xDist <= this.w || yDist <= this.h) ||
			(xDist > (r + this.w) || yDist > (r + this.h)) ? false :
			(xDist - this.w)**2 + (yDist - this.h)**2 <= r**2;
	}

	intersectsRect(x, y, w, h) {
		return !(x - w > this.pos.x + this.w || x + w < this.pos.x - this.w ||
			y - h > this.pos.y + this.h || y + h < this.pos.y - this.h);
	}

	render() {
		fill(this.color);
		rectMode(CENTER);
		rect(this.pos.x, this.pos.y, this.w * 2, this.h * 2);
	}

	get area() {
		return this.w * this.h * 4;
	}
}

class Circle extends Shape {
	constructor(x, y, r, color) {
		super(x, y);
		this.r = r;
		this.color = color;
	}

	contains(point) {
		return Circle.contains(this.pos.x, this.pos.y, this.r, point.pos.x, point.pos.y);
	}

	static contains(x, y, r, px, py) {
		return distSq(x, y, px, py) <= r**2;
	}

	intersectsCircle(x, y, r) {
		return distSq(this.pos.x, this.pos.y, x, y) <= (this.r + r)**2;
	}

	intersectsRect(x, y, w, h) {
		const xDist = abs(this.pos.x - x);
		const yDist = abs(this.pos.y - y);
		return (xDist <= w || yDist <= h) ||
			(xDist > (this.r + w) || yDist > (this.r + h)) ? false :
			(xDist - w)**2 + (yDist - h)**2 <= this.r**2;
	}

	render() {
		noStroke();
		fill(this.color || 150);
		ellipse(this.pos.x, this.pos.y, this.r * 2);
	}

	stroke() {
		stroke(255);
		noFill();
		ellipse(this.pos.x, this.pos.y, this.r * 2);
	}

	get area() {
		return PI * this.r**2;
	}
}

function distSq(x, y, x2, y2) {
	return (x2 - x)**2 + (y2 - y)**2;
}
