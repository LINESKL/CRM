<template>
  <div>
    <canvas ref="barChart"></canvas>
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
        console.error('Данные, переданные в BarChart, не являются массивом:', this.data);
        return;
      }

      const ctx = this.$refs.barChart.getContext('2d');
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.data.map(item => item.label),
          datasets: [
            {
              label: 'Топ использованных функций',
              data: this.data.map(item => item.value),
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
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