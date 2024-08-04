// 定义 PointCharge 类
class PointCharge {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
    }

    draw() {
        strokeWeight(1);
        if (this.strength > 0) {
            fill(255, 0, 0); // 正电荷：红色
        } else {
            fill(0, 0, 255); // 负电荷：蓝色
        }
        ellipse(this.x, this.y, 10, 10);
    }

    contains(mx, my) {
        // 检查给定的 (mx, my) 是否在电荷范围内
        let d = dist(mx, my, this.x, this.y);
        return d < 10;
    }

    setPosition(mx, my) {
        this.x = mx;
        this.y = my;
    }
}

// 电荷数组和相关函数
let charges = [];
let selectedCharge = null;
let offsetX, offsetY;

function addCharge(charge) {
    charges.push(charge);
    drawCharges();
}

function removeCharge(index) {
    charges.splice(index, 1);
    drawCharges();
}

function getCharges() {
    return charges;
}

function drawCharges() {
    charges.forEach(charge => charge.draw());
}

function resetCharges() {
    charges = [];
    drawCharges();
}

// 绘制电场线和计算电场强度的函数
function drawFieldLines() {
    const fieldDensity = 16;
    const stepSize = 4;

    for (let x = 0; x < width; x += fieldDensity) {
        for (let y = 0; y < height; y += fieldDensity) {
            let field = calculateElectricField(x, y);
            let magnitude = Math.sqrt(field.x * field.x + field.y * field.y);

            let colorIntensity = map(magnitude, 0, 500000, 0, 255);
            let colorValue = constrain(colorIntensity, 0, 255);

            if (magnitude > 0) {
                let dx = field.x / magnitude;
                let dy = field.y / magnitude;

                stroke(colorValue, 0, 255 - colorValue, 100); // 红蓝渐变

                line(x, y, x + dx * stepSize, y + dy * stepSize);
            }
        }
    }
}

function calculateElectricField(x, y) {
    let ex = 0;
    let ey = 0;
    const k = 8.99e9; // 库仑常数
    let charges = getCharges();
    charges.forEach(charge => {
        let dx = x - charge.x;
        let dy = y - charge.y;
        let rSquared = dx * dx + dy * dy;
        if (rSquared === 0) return;
        let forceMagnitude = k * charge.strength / rSquared;
        ex += forceMagnitude * dx / Math.sqrt(rSquared);
        ey += forceMagnitude * dy / Math.sqrt(rSquared);
    });
    return { x: ex, y: ey };
}

// 用户界面和控制逻辑
function initUI() {
    document.getElementById('addChargeButton').addEventListener('click', () => {
        let x = parseFloat(document.getElementById('chargeX').value) + width / 2;
        let y = height / 2 - parseFloat(document.getElementById('chargeY').value);
        let strength = parseFloat(document.getElementById('chargeStrength').value);

        const chargeType = document.querySelector('input[name="chargeType"]:checked').value;
        if (chargeType === 'negative') {
            strength = -Math.abs(strength);
        } else {
            strength = Math.abs(strength);
        }

        let charge = new PointCharge(x, y, strength);
        addCharge(charge);
        drawFieldLines(); // 更新电场线显示
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        resetCharges();
        drawFieldLines();
    });
}

// p5.js 的 setup 和 draw 函数
function setup() {
    createCanvas(800, 600).parent('canvas-container');
    drawAxes();
    initUI();

    // 直接分配事件处理函数
    mousePressed = mousePressedHandler;
    mouseDragged = mouseDraggedHandler;
    mouseReleased = mouseReleasedHandler;
}

function draw() {
    background(255);
    drawAxes();
    drawCharges();
    drawFieldLines();
}

// 绘制坐标轴
function drawAxes() {
    stroke(0);
    line(width / 2, 0, width / 2, height); // Y轴
    line(0, height / 2, width, height / 2); // X轴
}

// 鼠标事件处理
function mousePressedHandler() {
    for (let charge of charges) {
        if (charge.contains(mouseX, mouseY)) {
            selectedCharge = charge;
            offsetX = charge.x - mouseX;
            offsetY = charge.y - mouseY;
            break;
        }
    }
}

function mouseDraggedHandler() {
    if (selectedCharge) {
        selectedCharge.setPosition(mouseX + offsetX, mouseY + offsetY);
        draw();
    }
}

function mouseReleasedHandler() {
    selectedCharge = null;
}

// 将必要的函数和类暴露到全局作用域
window.PointCharge = PointCharge;
window.addCharge = addCharge;
window.removeCharge = removeCharge;
window.getCharges = getCharges;
window.drawCharges = drawCharges;
window.resetCharges = resetCharges;
window.drawFieldLines = drawFieldLines;
window.calculateElectricField = calculateElectricField;
window.initUI = initUI;
window.setup = setup;
window.draw = draw;
window.drawAxes = drawAxes;
