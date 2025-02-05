<template>
  <div>
    <canvas ref="lineChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  props: ['data'],
  mounted() {
    this.renderChart();
  },
  watch: {
    data() {
      this.renderChart();
    },
  },
  methods: {
    renderChart() {
      if (!Array.isArray(this.data)) {
        console.error('Данные, переданные в LineChart, не являются массивом:', this.data);
        return;
      }

      const ctx = this.$refs.lineChart.getContext('2d');
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.data.map(item => item.label),
          datasets: [
            {
              label: 'Активность по дням',
              data: this.data.map(item => item.value),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },
  },
};
</script>

<style scoped>
canvas {
  width: 100%;
  height: 400px;
}
</style>