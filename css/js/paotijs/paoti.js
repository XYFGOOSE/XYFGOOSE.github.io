document.addEventListener("DOMContentLoaded", () => {
    let chart;
    let simulationStopped = false;
    let engine, render, runner;

    function startSimulation() {
        if (engine) {
            Matter.Engine.clear(engine);
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }

        const initialVelocity = parseFloat(document.getElementById('initialVelocity').value);
        const angle = parseFloat(document.getElementById('angle').value) * Math.PI / 180;
        const canvas = document.getElementById('simulationCanvas');
        const ctx = canvas.getContext('2d');

        const { Engine, Render, Runner, Bodies, World, Body, Events } = Matter;

        engine = Engine.create();
        const world = engine.world;

        render = Render.create({
            canvas: canvas,
            engine: engine,
            options: {
                width: 800,
                height: 400,
                wireframes: false,
                background: 'white',
            }
        });

        Render.run(render);
        runner = Runner.create();
        Runner.run(runner, engine);

        const ground = Bodies.rectangle(100000, 410, 200000, 20, { isStatic: true });
        World.add(world, ground);

        const projectile = Bodies.circle(0, 380, 20, { frictionAir: 0, restitution: 0 });
        World.add(world, projectile);

        const velocityX = initialVelocity * Math.cos(angle);
        const velocityY = -initialVelocity * Math.sin(angle);

        Body.setVelocity(projectile, { x: velocityX, y: velocityY });

        const dataPoints = [{ x: 0, y: 0 }];
        simulationStopped = false;

        const chartCtx = document.getElementById('trajectoryChart').getContext('2d');
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(chartCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: '弹道轨迹',
                    data: dataPoints,
                    borderColor: 'rgba(0, 0, 0, 1)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    showLine: true,
                }],
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `(${context.raw.x.toFixed(2)}, ${context.raw.y.toFixed(2)})`;
                            },
                            labelTextColor: function() {
                                return '#000000';
                            }
                        },
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: '#000000',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: '水平距离 (m)',
                        },
                        min: 0,
                        max: 1500,
                    },
                    y: {
                        title: {
                            display: true,
                            text: '垂直距离 (m)',
                        },
                        min: 0,
                        max: 500,
                    },
                },
            },
        });

        Events.on(engine, 'afterUpdate', function() {
            if (simulationStopped) return;

            const xPos = projectile.position.x;
            const yPos = 400 - projectile.position.y;

            if (projectile.position.y < 380 || projectile.velocity.y < 0) {
                dataPoints.push({ x: xPos, y: yPos });
            }

            chart.options.scales.x.max = Math.max(chart.options.scales.x.max, xPos + 100);
            chart.options.scales.y.max = Math.max(chart.options.scales.y.max, yPos + 100);

            chart.update();

            const viewWidth = 800;
            const viewHeight = 400;
            const centerX = xPos + viewWidth / 4;
            const centerY = 400 - yPos - viewHeight / 4;

            Render.lookAt(render, {
                min: { x: centerX - viewWidth / 2, y: centerY - viewHeight / 2 },
                max: { x: centerX + viewWidth / 2, y: centerY + viewHeight / 2 }
            });

            if (projectile.position.y >= 380 && projectile.velocity.y >= 0 && !simulationStopped) {
                simulationStopped = true;
                updateResults(projectile.position.x);
            }
        });
    }

    function updateResults(x) {
        const landingPoint = {
            x: x.toFixed(2),
            y: 0
        };

        document.getElementById('landingPoint').innerText = `第一次落地点：(${landingPoint.x}, ${landingPoint.y})`;

        chart.data.datasets[0].data.push({
            x: parseFloat(landingPoint.x),
            y: 0,
            radius: 5,
            backgroundColor: 'red'
        });
        chart.update();
    }

    document.querySelector('.control-group button').addEventListener('click', startSimulation);
});
function isMobile() {
    return window.matchMedia("(max-width: 767px)").matches;
}

function checkOrientation() {
    const warningElement = document.getElementById('orientation-warning');
    if (isMobile() && window.innerHeight > window.innerWidth) {
        // 在移动设备上且为竖屏状态
        warningElement.style.display = 'flex';
    } else {
        // 其他情况，隐藏提示
        warningElement.style.display = 'none';
    }
}

// 在页面加载时和窗口大小变化时检查方向
window.addEventListener('load', checkOrientation);
window.addEventListener('resize', checkOrientation);
