let intensityChart;

function startExperiment() {
    const slitWidth = document.getElementById('slitWidth').value;
    const screenDistance = document.getElementById('screenDistance').value;
    const wavelength = document.getElementById('wavelength').value;

    const data = calculateIntensity(slitWidth, screenDistance, wavelength);
    drawInterferencePattern(data);
    drawIntensityChart(data);
}

function calculateIntensity(slitWidth, screenDistance, wavelength) {
    const scale = 10;
    const lambda = wavelength * 1e-9;
    const d = slitWidth * 1e-3;
    const D = screenDistance;
    const k = 2 * Math.PI / lambda;

    const data = [];
    const labels = [];
    let maxIntensity = 0;

    for (let x = 0; x < 800; x++) {
        const X = (x - 800 / 2) * 1e-6 * scale;
        const delta = (d * X) / D;
        const intensity = Math.cos(k * delta) ** 2;
        data.push({ intensity, x });
        labels.push((X * 1e6).toFixed(2));
        if (intensity > maxIntensity) {
            maxIntensity = intensity;
        }
    }

    return { data, labels, maxIntensity };
}

function drawInterferencePattern({ data }) {
    const canvas = document.getElementById('interferenceCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    data.forEach(point => {
        const brightness = Math.floor(point.intensity * 255);
        ctx.fillStyle = `rgb(${brightness}, 0, 0)`;
        ctx.fillRect(point.x, 0, 1, canvas.height);
    });
}

function drawIntensityChart({ data, labels, maxIntensity }) {
    const ctx = document.getElementById('intensityChartCanvas').getContext('2d');

    const chartData = data.map(point => point.intensity);

    const chartConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '强度分布',
                data: chartData,
                borderColor: 'rgba(255, 0, 0, 1)',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                fill: true,
                tension: 0.1,
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '位置 (μm)'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '强度'
                    },
                    beginAtZero: true,
                    suggestedMax: maxIntensity,
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            animation: {
                duration: 0
            },
            responsive: true,
            maintainAspectRatio: false
        }
    };

    if (intensityChart) {
        intensityChart.destroy();
    }

    intensityChart = new Chart(ctx, chartConfig);
}

// 初始实验启动
startExperiment();
