let grid = false;

function fixAngles(...angles) {
	return angles.map(a => (a + TWO_PI) % TWO_PI);
}

function dupProp(obj) {
	if (Array.isArray(obj)) return obj.map(x => dupProp(x) || x);
	if (obj instanceof p5.Vector) return obj.copy();
	if (obj instanceof p5.Color) return color(obj.levels);
	return obj;
}

function mid(a, b) {
	return createVector((a.x + b.x) / 2, (a.y + b.y) / 2);
}

function sign(n) {
	return Math.sign(n);
}

function setScale(n) {
	updateFlag = true;
	gScale = n ? gScale * n : parseFloat(document.getElementById('scale').value);
	if (n) document.getElementById('scale').value = gScale;
	screen.w = (width / 2) / gScale;
	screen.h = (height / 2) / gScale;
}

function toggleGrid() {
	updateFlag = true;
	grid = !grid;
	document.getElementById('grid').className = grid ? 'green clicked' : 'green';
}

document.onselectstart = () => false;

function drawArrow(base, vec, color) {
	push();
	stroke(color);
	strokeWeight(3);
	fill(color);
	translate(base.x, base.y);
	line(0, 0, vec.x, vec.y);
	rotate(vec.heading());
	const arrowSize = 7;
	translate(vec.mag() - arrowSize, 0);
	triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
	pop();
}
