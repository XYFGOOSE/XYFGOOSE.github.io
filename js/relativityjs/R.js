let animationFrameId;
let paused = true;
const c = 299792458; // 光速，单位 m/s
let velocity;
let gamma;
let timeDilated;

function runExperiment() {
    cancelAnimationFrame(animationFrameId); // 清除之前的动画循环
    let velocityPercent = document.getElementById('velocity').value;
    let time = document.getElementById('time').value;

    velocity = (velocityPercent / 100) * c;

    // 计算相对论效应
    gamma = 1 / Math.sqrt(1 - (velocity * velocity) / (c * c));
    timeDilated = time * gamma;

    // 显示结果
    let resultOutput = document.getElementById('resultOutput');
    resultOutput.innerHTML = `
        <p>速度: ${velocityPercent}% 光速 (${velocity.toFixed(2)} m/s)</p>
        <p>观察时间: ${time} 秒</p>
        <p>相对论效应因子 (γ): ${gamma.toFixed(2)}</p>
        <p>经过的时间 (在静止参考系中): ${timeDilated.toFixed(2)} 秒</p>
    `;

    // 绘制坐标轴
    drawGraph(gamma, time);

    // 初始化飞船动画
    initAnimation();
    paused = false;
    animate();
}

function drawGraph(gamma, time) {
    let x = [];
    let y = [];
    for (let t = 0; t <= time; t++) {
        x.push(t);
        y.push(t * gamma);
    }

    var trace = {
        x: x,
        y: y,
        mode: 'lines',
        type: 'scatter'
    };

    var layout = {
        title: '时间延缓效应',
        xaxis: {
            title: '静止参考系中的时间 (秒)'
        },
        yaxis: {
            title: '移动参考系中的时间 (秒)'
        }
    };

    Plotly.newPlot('graph', [trace], layout);
}

// 飞船动画部分
let canvas, ctx;
let spaceship = {
    x: 0,
    y: 100,
    width: 100,
    height: 50,
    velocityX: 0
};

function initAnimation() {
    canvas = document.getElementById('animationCanvas');
    ctx = canvas.getContext('2d');
    spaceship.x = 0;
    spaceship.velocityX = (velocity / c) * 10; // 动画速度调整因子
    drawSpaceship();
}

function drawSpaceship() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    let contractedWidth = spaceship.width / gamma;
    ctx.fillRect(spaceship.x, spaceship.y - spaceship.height / 2, contractedWidth, spaceship.height);
}

function animate() {
    if (!paused) {
        spaceship.x += spaceship.velocityX;
        if (spaceship.x > canvas.width) {
            spaceship.x = 0; // 循环
        }
        drawSpaceship();
        animationFrameId = requestAnimationFrame(animate);
    }
}
