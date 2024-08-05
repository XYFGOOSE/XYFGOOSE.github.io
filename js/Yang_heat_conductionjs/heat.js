const temperatureSlider = document.getElementById('temperature');
const tempInput = document.getElementById('tempInput');
const tempValue = document.getElementById('tempValue');
const chartDom = document.getElementById('chart');
const myChart = echarts.init(chartDom);

const h = 6.626e-34;
const c = 3e8;
const k = 1.381e-23;

function planck(wavelength, temperature) {
    const l = wavelength * 1e-9;
    const a = 2 * h * c ** 2;
    const b = h * c / (l * k * temperature);
    return a / (l ** 5 * (Math.exp(b) - 1));
}

function getSeriesData(temperature) {
    const maxWavelength = 3000; // in nm
    const numPoints = 500;
    const seriesData = [];

    for (let i = 0; i <= numPoints; i++) {
        const wavelength = i * maxWavelength / numPoints;
        const intensity = planck(wavelength, temperature);
        seriesData.push([wavelength, intensity]);
    }

    return seriesData;
}

function drawGraph(temperature) {
    const seriesData = getSeriesData(temperature);
    const option = {
        xAxis: {
            type: 'value',
            name: '波长 (nm)',
            min: 0,
            max: 3000,
            axisLabel: {
                formatter: function (value) {
                    return value;
                }
            }
        },
        yAxis: {
            type: 'value',
            name: '辐射强度',
            axisLabel: {
                formatter: function (value) {
                    return value.toExponential(1);
                }
            }
        },
        visualMap: [{
            show: true,
            dimension: 0,
            seriesIndex: 0,
            pieces: [
                {lte: 400, color: 'rgba(75, 0, 130, 0.1)', label: '紫外光区'},
                {gte: 400, lte: 700, color: 'rgba(0, 255, 0, 0.1)', label: '可见光区'},
                {gte: 700, color: 'rgba(255, 0, 0, 0.1)', label: '红外光区'}
            ],
            orient: 'horizontal',
            left: 'center',
            bottom: '10px'
        }],
        series: [{
            data: seriesData,
            type: 'line',
            smooth: true,
            areaStyle: {}
        }]
    };
    myChart.setOption(option);
}

function updateTemperature(value) {
    tempValue.textContent = `${value} K`;
    temperatureSlider.value = value;
    tempInput.value = value;
    drawGraph(value);
}

temperatureSlider.addEventListener('input', () => {
    updateTemperature(temperatureSlider.value);
});

tempInput.addEventListener('input', () => {
    if (tempInput.value >= 100 && tempInput.value <= 10000) {
        updateTemperature(tempInput.value);
    }
});

updateTemperature(temperatureSlider.value);