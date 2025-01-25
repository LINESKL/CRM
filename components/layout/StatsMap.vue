<template>
  <div class="dashboard-container">
    <div class="content">

      <!-- Карта -->
      <div class="card">
        <div class="card-body map-container">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              :viewBox="viewBox"
              class="map-svg"
              @mousemove="handleMouseMove"
              @mouseleave="handleMouseLeave"
          >
            <g id="kz">
              <path
                  v-for="region in regions"
                  :key="region.id"
                  :d="region.path"
                  :data-name="region.region"
                  :fill="region.fill"
                  :class="{ active: selectedRegion === region.id }"
                  @click="handleRegionClick(region)"
                  @mouseover="showTooltip(region.region)"
              />
            </g>
          </svg>
          <div v-if="tooltipVisible" :style="tooltipStyle" class="tooltip">{{ tooltipText }}</div>
        </div>
      </div>

      <!-- Кнопка для перехода на страницу пользователей -->
      <div v-if="selectedRegionName" class="button-container">
        <button @click="goToUsersPage">Посмотреть пользователей региона {{ selectedRegionName }}</button>
      </div>

      <!-- Данные -->
      <div class="data-cards">
        <div class="data-card" v-if="analyticsData">
          <h3>Данные для региона: {{ selectedRegionName }}</h3>

          <!-- Общая информация -->
          <p>Общее количество пользователей: {{ analyticsData.total_users }}</p>
          <p v-if="analyticsData.age_distribution">Средний возраст пользователей: {{ analyticsData.age_distribution.average_age.toFixed(1) }}</p>
          <p v-else>Средний возраст пользователей: Данные отсутствуют</p>

          <!-- Распределение по полу -->
          <div class="chart">
            <canvas id="genderChart"></canvas>
          </div>

          <!-- Возрастное распределение -->
          <div class="chart">
            <canvas id="ageChart"></canvas>
          </div>

          <!-- Гистограмма количества детей -->
          <div class="chart">
            <canvas id="childrenChart"></canvas>
          </div>

          <!-- Пособия -->
          <h4>Статистика по пособиям</h4>
          <p v-if="analyticsData.benefits_stats">Получают пособия: {{ analyticsData.benefits_stats.receiving_benefits }}</p>
          <p v-if="analyticsData.benefits_stats">Средний возраст получателей пособий: {{ analyticsData.benefits_stats.average_age_benefit_recipients.toFixed(1) }}</p>
          <p v-if="analyticsData.benefits_stats">Процент с детьми: {{ analyticsData.benefits_stats.percentage_with_children }}%</p>
          <p v-else>Статистика по пособиям: Данные отсутствуют</p>

          <!-- Семейное положение -->
          <h4>Семейное положение</h4>
          <div class="chart">
            <canvas id="maritalStatusChart"></canvas>
          </div>

          <!-- Кнопка для экспорта данных в Excel -->
          <button @click="exportToExcel">Экспорт в Excel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import {
  Chart,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  BarController,
  BarElement,
} from 'chart.js';
import * as XLSX from 'xlsx';

Chart.register(PieController, ArcElement, Tooltip, Legend, BarController, BarElement);

export default defineComponent({
  data() {
    return {
      regions: [
        { id: 1,
          region: "Акмолинская",
          path: "M2140.64 429.237L2117.5 620.525L1746.47 787.641L1665.49 729.001L1603.42 756.978L1463.78 617.466L1507.93 448.485L1659.76 469.972L1757.55 258.988L1944.66 305.84L2140.64 429.237Z",
          fill: "#213e60", },
        { id: 2,
          region: "Актюбинская",
          path: "M775.05 1533.77L758.435 1399.63L640.468 1235.05L629.51 998.848L536.467 931.33L603.045 730.792L756.734 652.381L921.498 650.815L1023.17 724.226L1169.14 622.539L1267.48 812.932L1234.1 959.755L1350.08 1083L1264.48 1228.04L1142.08 1135.6L958.605 1409.85L959.752 1503.11L775.05 1533.77Z",
          fill: "#213e60", },
        { id: 3,
          region: "Алматинская",
          path: "M2288.47 1865.54L2247.57 1685.89L2156.07 1576.96L2144.44 1408.13L2204.25 1329.2L2320.6 1313.91L2317.31 1465.65L2409.68 1682.46L2478.04 1722.15L2661.95 1733.34L2682.49 1829.73L2615.39 1941.04L2499.88 1870.69L2288.47 1865.54Z",
          fill: "#213e60", },
        { id: 5,
          region: "Атырауская",
          path: "M536.467 931.331L629.51 998.849L640.468 1235.05L758.435 1399.63L662.424 1358.74L471.866 1444.76L481.479 1307.04L340.766 1257.65L178.098 1353L135.097 1197.07L21.6804 1145.37L2.9292 1062.79L203.06 1125.45L331.628 1013.69L447.023 1044.13L536.467 931.331Z",
          fill: "#213e60", },
        { id: 6,
          region: "Абайская",
          path: "M2799.66 1476.55L2768.84 1394.26L2557.36 1245.87L2419.02 1234.38L2371.39 927.749L2439.08 777.793L2563.02 557.036L2616.74 678.269L2745.62 698.786L2724.02 816.96L2905.44 1051.59L2871.97 1227.36L2799.66 1476.55Z",
          fill: "#213e60", },
        { id: 7,
          region: "Жамбылская",
          path: "M2144.44 1408.13L2156.07 1576.96L2247.57 1685.89L2288.47 1865.54L2168.85 1823.61L2100.37 1930.22L1975.36 1880.83L1896.87 1957.75L1833.78 1831.74L1751.69 1408.13L1933.03 1408.06L2144.44 1408.13Z",
          fill: "#213e60", },
        { id: 8,
          region: "Улытауская",
          path: "M1264.48 1228.04L1350.09 1083L1408.75 969.305L1516.31 955.652L1623.16 825.391L1668.1 934.166L1782.35 1013.62L1957.72 925.362L1993.24 1139.48L1937.19 1160.89L1933.03 1408.06L1751.69 1408.13L1604.18 1408.43L1468.01 1357.18L1264.48 1228.04Z",
          fill: "#213e60", },
        { id: 9,
          region: "Костанайская",
          path: "M1507.93 448.485L1463.78 617.466L1603.42 756.978L1665.49 729.001L1623.16 825.391L1516.31 955.652L1408.75 969.305L1350.09 1083L1234.1 959.755L1267.49 812.932L1169.14 622.539L1109.05 271.522L1517.38 120.148L1507.93 448.485Z",
          fill: "#213e60", },
        { id: 10,
          region: "Кызылординская",
          path: "M959.753 1503.1L958.605 1409.85L1142.08 1135.6L1264.48 1228.04L1468.01 1357.18L1604.18 1408.43L1658.97 1829.2L1519.83 1945.07L1433.04 1741.47L1197.11 1783.25L1126.1 1667.83L959.753 1503.1Z",
          fill: "#213e60", },
        { id: 11,
          region: "Мангистауская",
          path: "M758.435 1399.63L775.05 1533.77L720.022 1557.34L720.102 2105.92L576.738 1954.17L479.462 1989.68L395.121 1879.56L269.678 1610.46L356.669 1504L471.866 1444.76L662.424 1358.74L758.435 1399.63Z" ,
          fill: "#213e60", },
        { id: 12,
          region: "Северо-Казахстанская",
          path: "M2140.64 429.237L1944.66 305.84L1757.55 258.988L1659.76 469.972L1507.93 448.485L1517.38 120.148L1685.59 71.3557L1745.36 0.629883L1887.74 20.8479L1919.78 199.08L2099.89 297.783L2140.64 429.237Z",
          fill: "#213e60", },
        { id: 14,
          region: "Павлодарская",
          path: "M2117.5 620.525L2140.64 429.237L2099.89 297.782L2274.23 199.527L2450.43 322.85L2563.02 557.036L2439.08 777.793L2248.56 783.985L2145.66 722.212L2117.5 620.525Z",
          fill: "#213e60", },
        { id: 16,
          region: "Туркестанская",
          path: "M1751.69 1408.13L1833.78 1831.74L1896.88 1957.75L1714.59 2175L1559.35 2116.81L1519.83 1945.07L1658.96 1829.2L1604.18 1408.43L1751.69 1408.13Z",
          fill: "#213e60", },
        { id: 17,
          region: "Западно-Казахстанская",
          path: "M603.045 730.792L536.467 931.33L447.023 1044.13L331.628 1013.69L203.06 1125.45L2.92931 1062.78L0.160156 831.583L137.352 730.269L285.937 572.255L512.652 585.311L603.045 730.792Z",
          fill: "#213e60", },
        { id: 18,
          region: "Карагандинская",
          path: "M1665.49 729.001L1746.47 787.641L2117.5 620.525L2145.66 722.212L2248.56 783.985L2439.08 777.793L2371.39 927.75L2419.02 1234.38L2320.6 1313.91L2204.25 1329.2L2144.44 1408.13L1933.03 1408.06L1937.19 1160.89L1993.24 1139.48L1957.72 925.362L1782.35 1013.62L1668.1 934.166L1623.16 825.391L1665.49 729.001Z",
          fill: "#213e60", },
        { id: 19,
          region: "Жетысуская",
          path: "M2661.95 1733.34L2478.04 1722.15L2409.68 1682.46L2317.31 1465.65L2320.6 1313.91L2419.02 1234.38L2557.36 1245.87L2768.84 1394.26L2799.66 1476.55L2651.07 1549.51L2661.95 1733.34Z",
          fill: "#213e60", },
        { id: 20,
          region: "Восточно-Казахстанская",
          path: "M2871.97 1227.36L2905.44 1051.59L2724.02 816.961L2745.62 698.786L2922.49 680.657L3031.68 866.946L3157 878.734L3140.27 1028.91L3073.06 1054.35L3069.53 1226.39L3001.18 1283.99L2871.97 1227.36Z",
          fill: "#213e60", },
        {
          id: 21,
          region: "Алматы",
          path: "M2338.81 1707.22L2346.94 1698.8C2362.29 1682.9 2387.63 1682.46 2403.52 1697.81L2412.23 1706.24C2428.51 1721.96 2428.51 1748.04 2412.23 1763.76L2403.52 1772.19C2387.63 1787.54 2362.29 1787.1 2346.94 1771.2L2338.81 1762.78C2323.85 1747.28 2323.85 1722.72 2338.81 1707.22Z",
          fill: "#FBFF00",
        },
        {
          id: 22,
          region: "Шымкент",
          path: "M1643.81 1979.22L1651.94 1970.8C1667.29 1954.9 1692.63 1954.46 1708.52 1969.81L1717.23 1978.24C1733.51 1993.96 1733.51 2020.04 1717.23 2035.76L1708.52 2044.19C1692.63 2059.54 1667.29 2059.1 1651.94 2043.2L1643.81 2034.78C1628.85 2019.28 1628.85 1994.72 1643.81 1979.22Z",
          fill: "#FBFF00",
        },
        {
          id: 23,
          region: "Астана",
          path: "M1822.81 611.221L1830.94 602.798C1846.29 586.896 1871.63 586.455 1887.52 601.813L1896.23 610.236C1912.51 625.96 1912.51 652.04 1896.23 667.764L1887.52 676.187C1871.63 691.545 1846.29 691.104 1830.94 675.202L1822.81 666.779C1807.85 651.28 1807.85 626.72 1822.81 611.221Z",
          fill: "#FBFF00",
        }
      ],
      selectedRegion: null,
      selectedRegionName: null,
      viewBox: "0 0 3157 2175",
      analyticsData: null,
      genderChartInstance: null,
      ageChartInstance: null,
      childrenChartInstance: null,
      maritalStatusChartInstance: null,
      tooltipVisible: false,
      tooltipText: '',
      tooltipStyle: {
        top: '0px',
        left: '0px'
      },
    };
  },
  methods: {
    resetCharts() {
      if (this.genderChartInstance) {
        this.genderChartInstance.destroy();
        this.genderChartInstance = null;
      }
      if (this.ageChartInstance) {
        this.ageChartInstance.destroy();
        this.ageChartInstance = null;
      }
      if (this.childrenChartInstance) {
        this.childrenChartInstance.destroy();
        this.childrenChartInstance = null;
      }
      if (this.maritalStatusChartInstance) {
        this.maritalStatusChartInstance.destroy();
        this.maritalStatusChartInstance = null;
      }
    },
    async handleRegionClick(region) {
      const encodedRegionName = encodeURIComponent(region.region);

      if (this.selectedRegion === region.id) {
        return;
      }

      this.selectedRegion = region.id;
      this.selectedRegionName = region.region;

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/stats/region/${encodedRegionName}/`);
        const data = await response.json();

        this.analyticsData = data;

        this.$nextTick(() => {
          this.resetCharts();
          this.renderGenderChart(data.gender_distribution);
          this.renderAgeChart(data.age_distribution);
          this.renderChildrenChart(data.children_stats.distribution);
          this.renderMaritalStatusChart(data.marital_status);
        });
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    },
    showTooltip(text) {
      this.tooltipText = text;
      this.tooltipVisible = true;
    },
    handleMouseMove(event) {
      if (this.tooltipVisible) {
        this.tooltipStyle.top = `${event.clientY - 10}px`;
        this.tooltipStyle.left = `${event.clientX + 10}px`;
      }
    },
    handleMouseLeave() {
      this.tooltipVisible = false;
    },
    goToUsersPage() {
      if (this.selectedRegionName) {
        this.$router.push({path: '/users', query: {region: this.selectedRegionName}});
      }
    },
    renderGenderChart(data) {
      const ctx = document.getElementById("genderChart").getContext("2d");
      this.genderChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Мужчины", "Женщины"],
          datasets: [
            {
              data: [data.male_percentage, data.female_percentage],
              backgroundColor: ["#36A2EB", "#FF6384"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },
    renderAgeChart(data) {
      const ctx = document.getElementById("ageChart").getContext("2d");
      this.ageChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Меньше 18 лет", "18-25 лет", "26-40 лет", "41-60 лет", "61-100 лет", "Больше 100 лет"],
          datasets: [
            {
              label: "Возрастное распределение",
              data: Object.values(data.age_groups),
              backgroundColor: "rgba(54,162,235,0.6)",
              borderColor: "rgb(54,162,235)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: ""
              },
            },
          },
        },
      });
    },
    renderChildrenChart(data) {
      const ctx = document.getElementById("childrenChart").getContext("2d");

      if (!data || typeof data !== "object") {
        console.error("Invalid children data:", data);
        return;
      }

      this.childrenChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(data).map((key) => key.replace("_children", " детей")),
          datasets: [
            {
              label: "Гистограмма количества людей по числу детей",
              data: Object.values(data),
              backgroundColor: "rgba(79,75,192,0.6)",
              borderColor: "rgb(79,75,192)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "",
              },
            },
          },
        },
      });
    },
    renderMaritalStatusChart(data) {
      const ctx = document.getElementById("maritalStatusChart").getContext("2d");

      this.maritalStatusChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(data.distribution),
          datasets: [
            {
              label: "Распределение по семейному положению",
              data: Object.values(data.distribution),
              backgroundColor: "rgba(255,159,64,0.6)",
              borderColor: "rgb(255,159,64)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "",
              },
            },
          },
        },
      });
    },
    exportToExcel() {
      if (!this.analyticsData) {
        return;
      }

      const workbook = XLSX.utils.book_new();

      // Общая информация
      const generalData = [
        ["Показатель", "Значение"],
        ["Общее количество пользователей", this.analyticsData.total_users],
        ["Средний возраст пользователей", this.analyticsData.age_distribution ? this.analyticsData.age_distribution.average_age.toFixed(1) : "Данные отсутствуют"],
      ];

      const generalSheet = XLSX.utils.aoa_to_sheet(generalData);
      XLSX.utils.book_append_sheet(workbook, generalSheet, "Общая информация");

      // Распределение по полу
      const genderData = [
        ["Пол", "Процент"],
        ["Мужчины", this.analyticsData.gender_distribution ? this.analyticsData.gender_distribution.male_percentage : "Данные отсутствуют"],
        ["Женщины", this.analyticsData.gender_distribution ? this.analyticsData.gender_distribution.female_percentage : "Данные отсутствуют"],
      ];

      const genderSheet = XLSX.utils.aoa_to_sheet(genderData);
      XLSX.utils.book_append_sheet(workbook, genderSheet, "Распределение по полу");

      // Возрастное распределение
      const ageData = [
        ["Возрастная группа", "Количество"],
        ...Object.entries(this.analyticsData.age_distribution ? this.analyticsData.age_distribution.age_groups : {}).map(([key, value]) => [key, value])
      ];

      const ageSheet = XLSX.utils.aoa_to_sheet(ageData);
      XLSX.utils.book_append_sheet(workbook, ageSheet, "Возрастное распределение");

      // Гистограмма количества детей
      const childrenData = [
        ["Количество детей", "Количество людей"],
        ...Object.entries(this.analyticsData.children_stats ? this.analyticsData.children_stats.distribution : {}).map(([key, value]) => [key.replace("_children", " детей"), value])
      ];

      const childrenSheet = XLSX.utils.aoa_to_sheet(childrenData);
      XLSX.utils.book_append_sheet(workbook, childrenSheet, "Гистограмма количества детей");

      // Статистика по пособиям
      const benefitsData = [
        ["Показатель", "Значение"],
        ["Получают пособия", this.analyticsData.benefits_stats ? this.analyticsData.benefits_stats.receiving_benefits : "Данные отсутствуют"],
        ["Средний возраст получателей пособий", this.analyticsData.benefits_stats ? this.analyticsData.benefits_stats.average_age_benefit_recipients.toFixed(1) : "Данные отсутствуют"],
        ["Процент с детьми", this.analyticsData.benefits_stats ? this.analyticsData.benefits_stats.percentage_with_children : "Данные отсутствуют"],
      ];

      const benefitsSheet = XLSX.utils.aoa_to_sheet(benefitsData);
      XLSX.utils.book_append_sheet(workbook, benefitsSheet, "Статистика по пособиям");

      // Семейное положение
      const maritalStatusData = [
        ["Семейное положение", "Количество"],
        ...Object.entries(this.analyticsData.marital_status ? this.analyticsData.marital_status.distribution : {}).map(([key, value]) => [key, value])
      ];

      const maritalStatusSheet = XLSX.utils.aoa_to_sheet(maritalStatusData);
      XLSX.utils.book_append_sheet(workbook, maritalStatusSheet, "Семейное положение");

      XLSX.writeFile(workbook, `Данные_региона_${this.selectedRegionName}.xlsx`);
    }
  },
});
</script>

<style scoped>
.filters label {
  display: flex;
  flex-direction: column;
}
.dashboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f5f5f5;
}

.content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.card-body {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;
}

.map-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 600px;
}

.map-svg {
  width: 100%;
  height: 100%;
  max-height: 600px;
}

path {
  stroke: #ffffff;
  stroke-width: 5px;
  cursor: pointer;
  transition: fill 0.3s ease;
}

path:hover {
  fill: #4071b4;
}

path.active {
  fill: #e14d4d;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

button {
  background-color: #213e60;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 17px;
}

button:hover {
  background-color: #4071b4;
}

.data-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h3 {
  margin-bottom: 15px;
  color: #213e60;
  font-weight: 600;
}

.data-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.tooltip {
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  pointer-events: none;
  white-space: nowrap;
  transform: translate(-50%, -100%);
  z-index: 10;
}
</style>