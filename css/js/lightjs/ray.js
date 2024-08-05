class Ray {
	constructor(pos, dir, fill) {
		this.pos = pos;
		this.dir = typeof dir === 'number' ? p5.Vector.fromAngle(dir) : dir;
		this.children = [];
		this.color = fill || color(255, 255, 255);
	}

	render() {
		stroke(...this.color.levels);
		strokeWeight(1);

		const endPos = this.end || this.pos.copy().add(this.dir.copy().mult(2 * screen.w));
		line(this.pos.x, this.pos.y, endPos.x, endPos.y);

		this.children.forEach(child => child.render());
	}

	handle(objects) {
		this.children = [];
		this.end = null;

		let closest = null;
		let recordDistSq = Infinity;
		let closestObj = null;

		objects.forEach(object => {
			const points = this.doesCollide(object);
			if (points) {
				(points instanceof Array ? points : [points]).forEach(pt => {
					const distSq = p5.Vector.sub(this.pos, pt).magSq();
					if (distSq < recordDistSq && distSq > 1e-6) {
						recordDistSq = distSq;
						closest = pt;
						closestObj = object;
					}
				});
			}
		});

		if (closest) {
			const rays = closestObj.returnRay(this, closest);
			if (rays) {
				(Array.isArray(rays) ? rays : [rays]).forEach(ray => {
					this.children.push(ray);
					try {
						if (!calcWarning) ray.handle(objects);
					} catch (err) {
						calcWarning = true;
					}
				});
			}
		}
	}

	doesCollide(obj) {
		if (obj instanceof PolygonalBlock) {
			return obj.segments.map(l => this.collWithLine(l)).filter(p => p);
		} else if (obj instanceof CircularBlock || obj instanceof Arc) {
			const normal = getNormal(obj.pos, this.pos, this.dir.copy());
			const dSq = p5.Vector.sub(normal, obj.pos).magSq();

			if (dSq <= obj.r ** 2) {
				let pts = this.getCircleIntersectPts(obj, dSq, normal);
				if (obj instanceof Arc) {
					pts = pts.filter(pt => obj.withinArc(p5.Vector.sub(pt, obj.pos).heading()));
				}
				return pts.filter(pt => this.withinSegment(pt));
			}
		} else if (obj instanceof Line) {
			return this.collWithLine(obj);
		}
	}

	getCircleIntersectPts(obj, dSq, normal) {
		if (dSq <= 1e-5) {
			const v = this.dir.copy().mult(obj.r);
			return [v.add(obj.pos), v.mult(-1).add(obj.pos)];
		} else {
			const d = sqrt(dSq);
			const a = acos(d / obj.r);
			const baseDir = p5.Vector.sub(normal, obj.pos).normalize().mult(obj.r);
			return [baseDir.copy().rotate(a).add(obj.pos), baseDir.copy().rotate(-a).add(obj.pos)];
		}
	}

	collWithLine(obj) {
		const { x: x1, y: y1 } = obj.pos;
		const { x: x2, y: y2 } = obj.pos.copy().add(obj.displacement);
		const { x: x3, y: y3 } = this.pos;
		const { x: x4, y: y4 } = this.pos.copy().add(this.dir);

		const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (den === 0) return;

		const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
		const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

		if (t > 0 && t < 1 && u > 0) {
			return createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
		}
	}

	withinSegment(pt) {
		return ((this.dir.x === 0 || (this.dir.x > 0 ? pt.x >= this.pos.x : pt.x <= this.pos.x)) &&
			(this.dir.y === 0 || (this.dir.y > 0 ? pt.y >= this.pos.y : pt.y <= this.pos.y)));
	}

	static reflect(ray, surface) {
		const dd = 2 * (ray.dir.x * surface.x + ray.dir.y * surface.y);
		const ref = createVector(surface.x * dd - ray.dir.x, surface.y * dd - ray.dir.y);
		return new Ray(ray.end, ref, color(...ray.color.levels));
	}

	static refract(func, ray, surface, i, object) {
		let r, refractDir;
		if (func === "into") {
			r = HALF_PI - asin(sin(i) / object.n);
			refractDir = surface.copy().rotate(r);
		} else {
			r = HALF_PI - asin(sin(i) * object.n);
			if (isNaN(r)) return Ray.reflect(ray, surface);
			refractDir = surface.copy().rotate(-r);
		}

		const R0 = ((1 - object.n) / (1 + object.n)) ** 2;
		const reflection = R0 + (1 - R0) * (1 - cos(i)) ** 5;

		const refractedRay = new Ray(ray.end, refractDir, color(...ray.color.levels));
		const reflectedRay = Ray.reflect(ray, surface);

		const rays = [];
		if (refractedRay.setIntensity((1 - reflection) * ray.color.levels[3])) rays.push(refractedRay);
		if (reflectedRay.setIntensity(reflection * ray.color.levels[3])) rays.push(reflectedRay);

		return rays;
	}

	setIntensity(intensity) {
		this.color.levels[3] = intensity;
		return intensity >= 1;
	}
}

function getNormal(p, a, ab) {
	const ap = p5.Vector.sub(p, a);
	return ab.mult(ap.dot(ab)).add(a);
}
