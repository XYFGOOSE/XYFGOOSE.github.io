document.addEventListener('DOMContentLoaded', () => {
  // 初始化Chart.js图表
  const ctx = document.getElementById('particleChart').getContext('2d');
  const particleChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [], // 速度区间标签
      datasets: [{
        label: '粒子数量',
        data: [], // 各速度区间的粒子数量
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: '速度 (m/s)'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: '数量'
          },
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });

  // 更新图表数据
  function updateParticleChartData(data) {
    particleChart.data.labels = data.labels;
    particleChart.data.datasets[0].data = data.counts;
    particleChart.update();
  }

  // 计算速度分布
  function calculateSpeedDistribution(speeds) {
    const bins = [0, 100, 200, 300, 400]; // 定义速度区间
    let distribution = Array(bins.length - 1).fill(0);

    speeds.forEach(speed => {
      for (let i = 0; i < bins.length - 1; i++) {
        if (speed >= bins[i] && speed < bins[i + 1]) {
          distribution[i]++;
          break;
        }
      }
    });

    const labels = bins.slice(0, -1).map((bin, index) => `${bin}-${bins[index + 1]}`);
    return { labels, counts: distribution };
  }

  // 定义全局变量共享粒子速度数据
  window.sharedParticleSpeeds = [];

  // 监听共享粒子速度数据的变化
  function listenForSpeedUpdates() {
    setInterval(() => {
      if (window.sharedParticleSpeeds.length > 0) {
        const distributionData = calculateSpeedDistribution(window.sharedParticleSpeeds);
        updateParticleChartData(distributionData);
        // 清除已处理的速度数据
        window.sharedParticleSpeeds = [];
      }
    }, 100); // 每100ms更新一次图表
  }

  // 启动监听
  listenForSpeedUpdates();
});
