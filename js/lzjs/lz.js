const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

let barrierHeight = 5;
let barrierWidth = 2;
let wavePacketPosition = -5;
let wavePacketWidth = 1;
let wavePacketEnergy = 4.98;
let animationId;
let time = 0;

const hbar = 1.055e-34; // 约化普朗克常数
const electronMass = 9.11e-31; // 电子质量

function getUserInputs() {
    barrierHeight = parseFloat(document.getElementById('barrierHeight').value);
    barrierWidth = parseFloat(document.getElementById('barrierWidth').value); // 直接以纳米为单位
    wavePacketPosition = parseFloat(document.getElementById('wavePacketPosition').value);
    wavePacketWidth = parseFloat(document.getElementById('wavePacketWidth').value);
    wavePacketEnergy = parseFloat(document.getElementById('wavePacketEnergy').value);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawBarrier() {
    if (barrierHeight > 0 && barrierWidth > 0) {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const barrierStartX = (canvasWidth / 2) - (barrierWidth / 2) * 40;
        const barrierEndX = (canvasWidth / 2) + (barrierWidth / 2) * 40;
        const barrierTopY = canvasHeight - (barrierHeight / 20) * canvasHeight;

        ctx.fillRect(barrierStartX, barrierTopY, barrierEndX - barrierStartX, canvasHeight - barrierTopY);

        // 标注势垒区域
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('势垒区', (barrierStartX + barrierEndX) / 2, barrierTopY - 10);
    }
}

function calculateTransmissionCoefficient() {
    if (wavePacketEnergy >= barrierHeight) {
        return 1; // 如果粒子能量高于或等于势垒高度，透射系数为1
    }
    const k = Math.sqrt(2 * electronMass * (barrierHeight - wavePacketEnergy) * 1.60218e-19) / hbar;
    const transmissionCoefficient = Math.exp(-2 * k * (barrierWidth * 1e-9)); // 将宽度转换为米
    return transmissionCoefficient;
}

function drawWavePacket() {
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    const barrierStartX = (canvas.width / 2) - (barrierWidth / 2) * 40;
    const barrierEndX = (canvas.width / 2) + (barrierWidth / 2) * 40;
    const x0 = canvas.width / 2 + wavePacketPosition * 40;
    const y0 = canvas.height * 1; // 波包的基准 y 位置
    const sigma = wavePacketWidth * 40; // 波包的宽度

    let amplitude;
    const transmissionCoefficient = calculateTransmissionCoefficient();
    const transmissionFactor = 5; // 放大因子

    for (let x = -10; x <= 10; x += 0.05) {
        const xPos = canvas.width / 2 + x * 40;
        amplitude = Math.exp(-((x - wavePacketPosition) ** 2) / (2 * (wavePacketWidth ** 2)));

        // 处理势垒中的波函数衰减
        if (xPos >= barrierStartX && xPos <= barrierEndX) {
            const distanceInBarrier = (xPos - barrierStartX) / 40; // 计算在势垒内的距离
            const decayFactor = Math.exp(-2 * Math.sqrt(barrierHeight - wavePacketEnergy) * distanceInBarrier);
            amplitude *= decayFactor;
        } else if (xPos > barrierEndX) {
            // 使用透射系数来模拟透射后的波函数，并放大
            amplitude *= transmissionCoefficient * transmissionFactor;
        }

        const y = y0 - amplitude * canvas.height / 4; // 调整波包的幅度
        if (x === -10) {
            ctx.moveTo(xPos, y);
        } else {
            ctx.lineTo(xPos, y);
        }
    }
    ctx.stroke();

    // 标注波类型
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText('入射波', 30, 30);

    if (wavePacketPosition + 10 >= barrierStartX && wavePacketPosition <= barrierEndX) {
        ctx.textAlign = 'center';
        ctx.fillText('衰减波', (barrierStartX + barrierEndX) / 2, 30);
    }
    if (wavePacketPosition + 10 >= barrierEndX) {  // 确保波包的实际位置已经穿过势垒末端
        ctx.textAlign = 'right';
        ctx.fillText('透射波', canvas.width - 30, 30);
    }
}

function drawEnergyLevel() {
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    const energyLevelY = canvas.height - (barrierHeight / 20) * canvas.height;
    ctx.moveTo(0, energyLevelY);
    ctx.lineTo(canvas.width, energyLevelY);
    ctx.stroke();
}

function animate() {
    time += 0.05; // 增加时间
    wavePacketPosition += 0.01; // 波包位置增加，模拟移动

    clearCanvas();
    drawBarrier();
    drawWavePacket();
    drawEnergyLevel();

    animationId = requestAnimationFrame(animate);
}

function startSimulation() {
    cancelAnimationFrame(animationId); // 停止之前的动画
    getUserInputs(); // 获取用户输入的最新值
    time = 0; // 重置时间
    animate(); // 启动动画
}

// 初始化绘图
clearCanvas();
drawBarrier();
drawEnergyLevel();
