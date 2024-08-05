let objects = [];
let sources = [];
let tools = [];
let updateFlag = true;
let fr = 0;
let screen;
let gScale = 1;
const gridSize = 20;
const menuHeight = 40;

let calcWarning = false;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight - menuHeight);
  buildInterface();
  screen = new Rectangle(0, 0, width / 2, height / 2);
  screen.a = createVector(0, 0);
  strokeCap(PROJECT);
}

function draw() {
  if (frameCount % 10 === 0) fr = int(frameRate());

  const x = map(mouseX, 0, width, 0, screen.w * 2) - screen.w + screen.pos.x;
  const y = map(mouseY, 0, height, 0, screen.h * 2) - screen.h + screen.pos.y;
  mouse.pos.set(x, y);

  if (updateFlag || mouse.deleteFlag) {
    background(0);

    if (grid) {
      drawGrid();
    }

    noStroke();
    fill(255);
    text(fr, 50, 40);
    text(int(gScale * 100) + '%', 100, 40);

    if (calcWarning) {
      showWarning();
    }

    push();
    translate(width / 2, height / 2);
    scale(gScale);
    translate(screen.pos.x, screen.pos.y);

    drawBuildHistory();

    renderObjects();
    handleSources();
    renderTools();

    pop();

    if (mouse.buildHistory.length === 0) updateFlag = false;
  }

  handleMouseMovement();
}

function drawGrid() {
  stroke(30);
  strokeWeight(1);
  for (let i = 0; i < width; i += gridSize) {
    line(i, 0, i, height);
  }
  for (let i = 0; i < height; i += gridSize) {
    line(0, i, width, i);
  }
}

function showWarning() {
  rectMode(CENTER);
  fill(255, 0, 0, 50);
  rect(width / 2, 10, width, 20);
  fill(255);
  text('Warning! Processing...', 20, 14);
  calcWarning = false;
}

function drawBuildHistory() {
  if (mouse.buildHistory.length > 0) {
    fill(255, 0, 0);
    rectMode(CENTER);
    mouse.buildHistory.forEach(p => rect(p.x, p.y, 5, 5));

    let lastPoint = mouse.buildHistory[mouse.buildHistory.length - 1];
    stroke(100);
    strokeWeight(2);
    line(mouse.pos.x, mouse.pos.y, lastPoint.x, lastPoint.y);

    if (mouse.buildHistory.length > 1) {
      noFill();
      beginShape();
      mouse.buildHistory.forEach(p => vertex(p.x, p.y));
      endShape();
    }
  }
}

function renderObjects() {
  for (let i = objects.length - 1; i >= 0; i--) {
    if (mouse.deleteFlag && mouse.isHolding(objects[i])) {
      objects.splice(i, 1);
      mouse.deleteFlag = false;
      mouse.drop();
      updateFlag = true;
    } else {
      objects[i].render();
    }
  }
}

function handleSources() {
  for (let i = sources.length - 1; i >= 0; i--) {
    if (!calcWarning) {
      sources[i].handle(objects);
    }
    if (mouse.deleteFlag && mouse.isHolding(sources[i])) {
      sources.splice(i, 1);
      mouse.deleteFlag = false;
      mouse.drop();
    } else {
      sources[i].render();
    }
  }
}

function renderTools() {
  for (let i = tools.length - 1; i >= 0; i--) {
    if (mouse.deleteFlag && mouse.isHolding(tools[i])) {
      tools.splice(i, 1);
      mouse.deleteFlag = false;
      mouse.drop();
      updateFlag = true;
    } else {
      tools[i].render();
    }
  }
}

function handleMouseMovement() {
  if (mouse.holding && frameCount % 2 === 0) {
    let moved = false;
    if (keyIsDown(UP_ARROW)) {
      mouse.holding.setPos(mouse.holding.pos.x, mouse.holding.pos.y - 1);
      moved = true;
    }
    if (keyIsDown(DOWN_ARROW)) {
      mouse.holding.setPos(mouse.holding.pos.x, mouse.holding.pos.y + 1);
      moved = true;
    }
    if (keyIsDown(LEFT_ARROW)) {
      mouse.holding.setPos(mouse.holding.pos.x - 1, mouse.holding.pos.y);
      moved = true;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      mouse.holding.setPos(mouse.holding.pos.x + 1, mouse.holding.pos.y);
      moved = true;
    }
    if (moved) updateFlag = true;
  }
}

function keyPressed(e) {
  if (mouse.holding) {
    if (e.key === "Delete") {
      mouse.delete();
    } else if (e.key === "D") {
      let n = mouse.holding.duplicate();
      if (mouse.holding.dir) {
        n.setPos(n.pos.x + mouse.holding.dir.x * gridSize / gScale, n.pos.y + mouse.holding.dir.y * gridSize / gScale);
      } else {
        n.setPos(n.pos.x + gridSize / gScale, n.pos.y + gridSize / gScale);
      }

      n.name = mouse.holding.name.includes("Duplicate") ? `${mouse.holding.name}*` : `${mouse.holding.name} Duplicate`;
      mouse.hold(n);
    }
  }
}
