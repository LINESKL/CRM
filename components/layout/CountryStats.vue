<template>
  <div class="stats-container">
    <h3>Данные со всей страны</h3>
    <div v-if="data">
      <div class="general-info">
        <h4>Общая информация</h4>
        <p>Всего пользователей: {{ data.total_users }}</p>
        <p>Средний возраст: {{ data.age_distribution.average_age }}</p>
        <p>Среднее количество детей на пользователя: {{ data.children_stats.average_children_per_user }}</p>
      </div>

      <div class="gender-info">
        <h4>Гендерное распределение</h4>
        <p>Мужчины: {{ data.gender_distribution.male_percentage }}%</p>
        <p>Женщины: {{ data.gender_distribution.female_percentage }}%</p>
      </div>

      <div class="chart-container">
        <h4>Распределение по возрастным группам</h4>
        <canvas id="ageDistributionChart"></canvas>
      </div>

      <div class="chart-container">
        <h4>Распределение по количеству детей</h4>
        <canvas id="childrenDistributionChart"></canvas>
      </div>

      <div class="benefits-info">
        <h4>Статистика по пособиям</h4>
        <p>Получают пособия: {{ data.benefits_stats.receiving_benefits }}</p>
        <p>Средний возраст получателей пособий: {{ data.benefits_stats.average_age_benefit_recipients }}</p>
        <p>Процент с детьми: {{ data.benefits_stats.percentage_with_children }}%</p>
      </div>

      <div class="chart-container">
        <h4>Семейное положение</h4>
        <canvas id="maritalStatusChart"></canvas>
      </div>

      <div class="chart-container">
        <h4>Распределение по полу и возрасту</h4>
        <canvas id="ageGenderDistributionChart"></canvas>
      </div>

      <div class="chart-container">
        <h4>Статистика по функциям</h4>
        <canvas id="functionsChart"></canvas>
      </div>

      <div class="points-info">
        <h4>Статистика по баллам</h4>
        <p>Общее количество баллов: {{ data.points_stats.total_points }}</p>
        <p>Среднее количество баллов: {{ data.points_stats.average_points }}</p>
      </div>

      <div class="type-info">
        <h4>Тип пользователя</h4>
        <p>Web пользователи: {{ data.type_stats[1].count }}</p>
        <p>Не web пользователи: {{ data.type_stats[0].count }}</p>
      </div>

      <button @click="exportToExcel">Экспорт в Excel</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Chart } from 'chart.js';

export default {
  data() {
    return {
      selectedRegion: 'country',
      data: null,
      charts: {
        ageDistributionChart: null,
        childrenDistributionChart: null,
        maritalStatusChart: null,
        ageGenderDistributionChart: null,
        functionsChart: null,
      }
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      let url = 'http://127.0.0.1:8000/api/allstats/';
      try {
        const response = await axios.get(url);
        this.data = response.data;
        this.$nextTick(() => {
          this.createCharts();
        });
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    },
    createCharts() {
      this.resetCharts();

      if (!this.data) {
        return;
      }

      this.renderAgeDistributionChart();
      this.renderChildrenDistributionChart();
      this.renderMaritalStatusChart();
      this.renderAgeGenderDistributionChart();
      this.renderFunctionsChart();
    },
    resetCharts() {
      Object.values(this.charts).forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
    },
    renderAgeDistributionChart() {
      const ctx = document.getElementById('ageDistributionChart').getContext('2d');
      this.charts.ageDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Меньше 18 лет', '18-25 лет', '26-40 лет', '41-60 лет', '61-100 лет', 'Больше 100 лет'],
          datasets: [{
            label: 'Возрастное распределение',
            data: Object.values(this.data.age_distribution.age_groups),
            backgroundColor: 'rgba(54,162,235,0.6)',
            borderColor: 'rgb(54,162,235)',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Возрастная группа',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Количество пользователей',
              },
            },
          },
        },
      });
    },
    renderChildrenDistributionChart() {
      const ctx = document.getElementById('childrenDistributionChart').getContext('2d');
      this.charts.childrenDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(this.data.children_stats.distribution).map(key => key.replace('_children', ' детей')),
          datasets: [{
            label: 'Гистограмма количества людей по числу детей',
            data: Object.values(this.data.children_stats.distribution),
            backgroundColor: 'rgba(79,75,192,0.6)',
            borderColor: 'rgb(79,75,192)',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Количество детей',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Количество пользователей',
              },
            },
          },
        },
      });
    },
    renderMaritalStatusChart() {
      const ctx = document.getElementById('maritalStatusChart').getContext('2d');
      this.charts.maritalStatusChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(this.data.marital_status.distribution),
          datasets: [{
            label: 'Распределение по семейному положению',
            data: Object.values(this.data.marital_status.distribution),
            backgroundColor: 'rgba(255,159,64,0.6)',
            borderColor: 'rgb(255,159,64)',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Семейное положение',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Количество пользователей',
              },
            },
          },
        },
      });
    },
    renderAgeGenderDistributionChart() {
      const ctx = document.getElementById('ageGenderDistributionChart').getContext('2d');
      this.charts.ageGenderDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Меньше 18 лет', '18-25 лет', '26-40 лет', '41-60 лет', '61-100 лет', 'Больше 100 лет'],
          datasets: [
            {
              label: 'Мужчины',
              data: Object.values(this.data.age_gender_distribution.male),
              backgroundColor: 'rgba(54,162,235,0.6)',
              borderColor: 'rgb(54,162,235)',
              borderWidth: 1,
            },
            {
              label: 'Женщины',
              data: Object.values(this.data.age_gender_distribution.female),
              backgroundColor: 'rgba(255,99,132,0.6)',
              borderColor: 'rgb(255,99,132)',
              borderWidth: 1,
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Возрастная группа',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Количество пользователей',
              },
            },
          },
        },
      });
    },
    renderFunctionsChart() {
      const ctx = document.getElementById('functionsChart').getContext('2d');
      this.charts.functionsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(this.data.functions_stats),
          datasets: [{
            label: 'Использование функций',
            data: Object.values(this.data.functions_stats),
            backgroundColor: 'rgba(153,102,255,0.6)',
            borderColor: 'rgb(153,102,255)',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Функции',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Количество пользователей',
              },
            },
          },
        },
      });
    },
    exportToExcel() {
      if (!this.data) {
        return;
      }

      const workbook = XLSX.utils.book_new();

      // Общая информация
      const generalData = [
        ["Показатель", "Значение"],
        ["Общее количество пользователей", this.data.total_users],
        ["Средний возраст пользователей", this.data.age_distribution ? this.data.age_distribution.average_age : "Данные отсутствуют"],
        ["Среднее количество детей на пользователя", this.data.children_stats ? this.data.children_stats.average_children_per_user : "Данные отсутствуют"],
      ];

      const generalSheet = XLSX.utils.aoa_to_sheet(generalData);
      XLSX.utils.book_append_sheet(workbook, generalSheet, "Общая информация");

      // Распределение по полу
      const genderData = [
        ["Пол", "Процент"],
        ["Мужчины", this.data.gender_distribution ? this.data.gender_distribution.male_percentage : "Данные отсутствуют"],
        ["Женщины", this.data.gender_distribution ? this.data.gender_distribution.female_percentage : "Данные отсутствуют"],
      ];

      const genderSheet = XLSX.utils.aoa_to_sheet(genderData);
      XLSX.utils.book_append_sheet(workbook, genderSheet, "Гендерное распред.");

      // Возрастное распределение
      const ageData = [
        ["Возрастная группа", "Количество"],
        ...Object.entries(this.data.age_distribution ? this.data.age_distribution.age_groups : {}).map(([key, value]) => [key, value])
      ];

      const ageSheet = XLSX.utils.aoa_to_sheet(ageData);
      XLSX.utils.book_append_sheet(workbook, ageSheet, "Возрастное распред.");

      // Гистограмма количества детей
      const childrenData = [
        ["Количество детей", "Количество людей"],
        ...Object.entries(this.data.children_stats ? this.data.children_stats.distribution : {}).map(([key, value]) => [key.replace("_children", " детей"), value])
      ];

      const childrenSheet = XLSX.utils.aoa_to_sheet(childrenData);
      XLSX.utils.book_append_sheet(workbook, childrenSheet, "Распред. детей");

      // Статистика по пособиям
      const benefitsData = [
        ["Показатель", "Значение"],
        ["Получают пособия", this.data.benefits_stats ? this.data.benefits_stats.receiving_benefits : "Данные отсутствуют"],
        ["Средний возраст получателей пособий", this.data.benefits_stats ? this.data.benefits_stats.average_age_benefit_recipients : "Данные отсутствуют"],
        ["Процент с детьми", this.data.benefits_stats ? this.data.benefits_stats.percentage_with_children : "Данные отсутствуют"],
      ];

      const benefitsSheet = XLSX.utils.aoa_to_sheet(benefitsData);
      XLSX.utils.book_append_sheet(workbook, benefitsSheet, "Пособия");

      // Семейное положение
      const maritalStatusData = [
        ["Семейное положение", "Количество"],
        ...Object.entries(this.data.marital_status ? this.data.marital_status.distribution : {}).map(([key, value]) => [key, value])
      ];

      const maritalStatusSheet = XLSX.utils.aoa_to_sheet(maritalStatusData);
      XLSX.utils.book_append_sheet(workbook, maritalStatusSheet, "Семейное полож.");

      // Распределение по полу и возрасту
      const ageGenderData = [
        ["Возрастная группа", "Мужчины", "Женщины"],
        ...Object.keys(this.data.age_gender_distribution.male).map(key => [
          key,
          this.data.age_gender_distribution.male[key],
          this.data.age_gender_distribution.female[key],
        ]),
      ];

      const ageGenderSheet = XLSX.utils.aoa_to_sheet(ageGenderData);
      XLSX.utils.book_append_sheet(workbook, ageGenderSheet, "Пол и возраст");

      // Статистика по функциям
      const functionsData = [
        ["Функция", "Количество"],
        ...Object.entries(this.data.functions_stats).map(([key, value]) => [key, value]),
      ];

      const functionsSheet = XLSX.utils.aoa_to_sheet(functionsData);
      XLSX.utils.book_append_sheet(workbook, functionsSheet, "Функции");

      // Статистика по типу пользователя
      const typeStatsData = [
        ["Тип пользователя", "Количество"],
        ["Web пользователи", this.data.type_stats[1].count],
        ["Не web пользователи", this.data.type_stats[0].count],
      ];

      const typeStatsSheet = XLSX.utils.aoa_to_sheet(typeStatsData);
      XLSX.utils.book_append_sheet(workbook, typeStatsSheet, "Типы польз.");

      XLSX.writeFile(workbook, `Данные_страны.xlsx`);
    }
  }
};
</script>

<style scoped>
.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.filters label {
  display: flex;
  flex-direction: column;
}

.general-info, .gender-info, .benefits-info, .points-info, .type-info {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

.chart-container {
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
}

button {
  display: block;
  width: 200px;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #213e60;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #4071b4;
}
</style>