let mouse;

function buildInterface() {
  mouse = {
    pos: createVector(mouseX, mouseY),
    a: createVector(mouseX, mouseY),
    dis: createVector(0, 0),
    mode: 'hand',
    handMode: 'single',
    c: createVector(width / 2, height / 2),
    buildHistory: [],
  };

  mouse.hold = function(obj, prop) {
    document.getElementById('delete').disabled = false;
    this.holding = obj;
    document.getElementById('output').value = obj.name || 'Untitled';
    mouse.dis.set(this.pos.x - obj.pos.x, this.pos.y - obj.pos.y);
    mouse.currProperty = prop;

    if (mouse.holding.properties) {
      const propHolder = document.getElementById('menu-sub');
      propHolder.innerHTML = '';

      mouse.holding.properties.forEach((property, i) => {
        const label = document.createTextNode(`${property.name} `);
        propHolder.appendChild(label);
        const input = document.createElement('input');
        property.tags(input);
        input.type = property.type;
        input.value = property.default();
        input.id = i;
        input.addEventListener("input", function(e) {
          property.onchange(e.target.value);
        });
        propHolder.appendChild(input);
      });
    }
    updateFlag = true;
  }

  mouse.drop = function() {
    document.getElementById('menu-sub').innerHTML = '';
    document.getElementById('delete').disabled = true;
    document.getElementById('output').value = '';
    this.holding = false;
    updateFlag = true;
  }

  mouse.delete = function() {
    this.deleteFlag = true;
  }

  mouse.isHolding = function(obj) {
    return obj === mouse.holding;
  }

  document.getElementById('color').addEventListener("change", function(e) {
    mouse.color = color(e.target.value);
    if (mouse.mode === 'hand' && mouse.holding && mouse.holding.color) {
      updateFlag = true;
      mouse.holding.color.levels = mouse.color.levels;
    }
  });

  const mainSelect = document.getElementById('main-select');
  mainSelect.addEventListener("change", function(e) {
    const selectedValue = e.target.value;

    if (selectedValue !== 'hand') {
      document.body.style.cursor = "crosshair";
      mouse.mode = 'build';
      mouse.building = options[selectedValue][0];
      mouse.buildingName = selectedValue;
      mouse.drop();
    } else {
      document.body.style.cursor = "move";
      mouse.currProperty = '';
      mouse.mode = 'hand';
    }
    mouse.buildHistory = [];
  });
  mainSelect.dispatchEvent(new Event('change'));
  document.getElementById('color').dispatchEvent(new Event('change'));
}

function mousePressed() {
  mouse.a.set(mouseX, mouseY);
  screen.a.set(screen.pos.x, screen.pos.y);

  if (screen.contains(mouse)) {
    if (mouse.mode === 'build') {
      const newObj = mouse.building.build(mouse);
      updateFlag = true;
      mouse.drop();

      if (!newObj) {
        mouse.buildHistory.push(mouse.pos.copy());
        return;
      } else {
        mouse.buildHistory = [];
      }

      options[mouse.buildingName][2] += 1;
      newObj.name = `${options[mouse.buildingName][1]} ${options[mouse.buildingName][2]}`;

      if (newObj.morph) {
        mouse.holding = newObj;
        mouse.currProperty = newObj.buildMorph === false ? 'none' : 'resize';
        mouse.isBuilding = true;
      }
    } else if (mouse.mode === 'hand') {
      mouse.drop();

      let closestObj = null;
      let closestDistSq = Infinity;
      let closestProp = null;

      [...sources, ...tools, ...objects].forEach((item) => {
        const distSq = p5.Vector.sub(mouse.pos, item.pos).magSq();
        const prop = item.contains(mouse);
        if (distSq < closestDistSq && prop) {
          closestDistSq = distSq;
          closestObj = item;
          closestProp = prop;
        }
      });

      if (closestObj) {
        mouse.hold(closestObj, closestProp);
      }
    }
  }
}

function mouseDragged() {
  if (mouse.holding && screen.contains(mouse) && mouse.handMode === 'single') {
    mouse.holding.morph(mouse, mouse.currProperty);
    updateFlag = true;
  }
}

function mouseReleased() {
  if (mouse.mode === 'build' && mouse.isBuilding) {
    mouse.hold(mouse.holding);
    mouse.isBuilding = false;
  }
}

const options = {
  'hand': 'hand',

  'ray': [RaySource, '激光', 0],
  'pointLight': [PointLight, '点光源', 0],
  'beam': [Beam, '光束', 0],

  'mirror': [Mirror, '镜子', 0],
  'void': [Void, '虚空', 0],
  'filter': [Filter, '滤镜', 0],
  'arc': [Arc, '圆弧', 0],
  'lens': [Lens, '透镜', 0],

  'circle': [CircularBlock, '圆形块', 0],
  'polygon': [PolygonalBlock, '多边形', 0],
  'rectblock': [RectBlock, '矩形块', 0],

  'ruler': [Ruler, '尺子', 0],
  'd': [Protractor, '量角器', 0],
};
