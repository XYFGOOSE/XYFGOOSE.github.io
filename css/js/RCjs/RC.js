  // 示例数据
  const stagesData = [
    { frequency: [20, 100, 500, 1000, 5000, 10000], gain: [-20, 0, 0, -3, -20, -40], phase: [0, -45, -90, -135, -180, -225] },
    { frequency: [20, 100, 500, 1000, 5000, 10000], gain: [-40, 0, 0, -6, -40, -80], phase: [0, -90, -180, -270, -360, -450] },
    { frequency: [20, 100, 500, 1000, 5000, 10000], gain: [-60, 0, 0, -9, -60, -120], phase: [0, -135, -270, -405, -540, -675] }
  ];

  const colors = ['blue', 'green', 'red'];

  // 固定增益和相位图范围
  const gainRangeMin = -140; // dB
  const gainRangeMax = 50; // dB
  const phaseRangeMin = -700; // 度
  const phaseRangeMax = 200; // 度

  // 图表实例
  let gainChart;
  let phaseChart;

  // 根据级数更新电路图
  function updateCircuit() {
    const stageCount = parseInt(document.getElementById('stageCount').value, 10);
    renderCircuit(stageCount);
    renderBodePlots(stageCount);
  }

  // 渲染电路图
  function renderCircuit(stageCount) {
    const circuitDiagram = document.getElementById('circuitDiagram');
    circuitDiagram.innerHTML = ''; // 清空之前的电路图

    const img = document.createElement('img');
    img.src = `../img/RCimg/stage${stageCount}.png`; // 使用相应的级数图片
    circuitDiagram.appendChild(img);
  }

  // 渲染波特图
  function renderBodePlots(stageCount) {
    const gainCanvas = document.getElementById('gainPlot').getContext('2d');
    const phaseCanvas = document.getElementById('phasePlot').getContext('2d');

    const gainDatasets = [];
    const phaseDatasets = [];

    for (let i = 0; i < stageCount; i++) {
      const frequencies = stagesData[i].frequency;
      const gains = stagesData[i].gain;
      const phases = stagesData[i].phase;

      gainDatasets.push({
        label: `第 ${i + 1} 级增益`,
        data: gains,
        borderColor: colors[i],
        backgroundColor: colors[i],
        fill: false,
        borderWidth: 2,
        pointRadius: 3
      });

      phaseDatasets.push({
        label: `第 ${i + 1} 级相位`,
        data: phases,
        borderColor: colors[i],
        backgroundColor: colors[i],
        fill: false,
        borderWidth: 2,
        pointRadius: 3
      });
    }

    // 如果之前有图表实例，先销毁
    if (gainChart) {
      gainChart.destroy();
    }
    if (phaseChart) {
      phaseChart.destroy();
    }

    // 初始化增益图
    gainChart = new Chart(gainCanvas, {
      type: 'line',
      data: {
        labels: stagesData[0].frequency,
        datasets: gainDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'logarithmic',
            title: {
              display: true,
              text: '频率 (Hz)'
            },
            grid: {
              display: true
            }
          },
          y: {
            title: {
              display: true,
              text: '增益 (dB)'
            },
            min: gainRangeMin,
            max: gainRangeMax,
            grid: {
              display: true
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            enabled: true
          }
        }
      }
    });

    // 初始化相位图
    phaseChart = new Chart(phaseCanvas, {
      type: 'line',
      data: {
        labels: stagesData[0].frequency,
        datasets: phaseDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'logarithmic',
            title: {
              display: true,
              text: '频率 (Hz)'
            },
            grid: {
              display: true
            }
          },
          y: {
            title: {
              display: true,
              text: '相位 (度)'
            },
            min: phaseRangeMin,
            max: phaseRangeMax,
            grid: {
              display: true
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            enabled: true
          }
        }
      }
    });
  }

  // 页面加载时初始渲染
  updateCircuit();