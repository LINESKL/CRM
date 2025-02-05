<template>
  <div class="analytics-page">
    <h1>Аналитика</h1>

    <!-- Фильтры -->
    <div class="filters">
      <label>
        Уровень аналитики:
        <select v-model="selectedLevel">
          <option value="all">Все регионы</option>
          <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
        </select>
      </label>
      <label>
        Начальная дата:
        <input type="date" v-model="startDate" />
      </label>
      <label>
        Конечная дата:
        <input type="date" v-model="endDate" />
      </label>
      <button @click="applyFilters">Применить</button>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <!-- Аналитические блоки -->
    <div class="analytics-blocks" v-if="data">
      <!-- Активность -->
      <div class="block">
        <h2>Активность</h2>
        <line-chart :data="filteredActivityChartData" />
      </div>

      <!-- Аномалии -->
      <div class="block">
        <h2>Аномалии</h2>
        <div v-for="(value, key) in anomaliesData" :key="key">
          <p>{{ key }}: {{ value }}</p>
        </div>
      </div>

      <!-- Топ использованных функции -->
      <div class="block">
        <h2>Топ использованных функции</h2>
        <bar-chart :data="filteredTopFunctionsChartData" />
      </div>

      <!-- Статус пользователей -->
      <div class="block">
        <h2>Семейное положение</h2>
        <pie-chart :data="filteredUserStatusChartData" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import BarChart from '~/components/BarChart.vue';
import LineChart from '~/components/LineChart.vue';
import PieChart from '~/components/PieChart.vue';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default {
  components: {
    BarChart,
    LineChart,
    PieChart,
  },
  data() {
    return {
      selectedLevel: 'all',
      startDate: null,
      endDate: null,
      regions: [
        'Астана', 'Алматы', 'Шымкент', 'Акмолинская', 'Актюбинская', 'Алматинская',
        'Жамбылская', 'Абайская', 'Атырауская', 'Улытауская', 'Костанайская', 'Кызылординская',
        'Павлодарская', 'Северо-Казахстанская', 'Мангистауская', 'Туркестанская',
        'Западно-Казахстанская', 'Карагандинская', 'Жетысуская', 'Восточно-Казахстанская'
      ],
      data: null,
      activityChartData: [],
      anomaliesData: {},
      topFunctionsChartData: [],
      userStatusChartData: [],
      filteredActivityChartData: [],
      filteredTopFunctionsChartData: [],
      filteredUserStatusChartData: [],
      error: null,
    };
  },
  methods: {
    async fetchAnalytics() {
      try {
        this.error = null;
        let response;
        if (this.selectedLevel === 'all') {
          response = await axios.get('http://127.0.0.1:8000/api/allstats/');
        } else {
          response = await axios.get(`http://127.0.0.1:8000/api/stats/region/${this.selectedLevel}/`);
        }

        console.log("Fetched data:", response.data);

        if (!response.data || typeof response.data !== 'object') {
          console.error('Response data structure:', response.data);
          throw new Error('Данные пользователей отсутствуют или имеют неверный формат');
        }

        this.data = response.data;
        this.prepareData();
        this.applyFilters();
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        this.error = "Ошибка загрузки данных. Пожалуйста, попробуйте позже.";
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        }
      }
    },
    prepareData() {
      if (!this.data || typeof this.data !== 'object') {
        console.error("Данные пользователей отсутствуют или имеют неверный формат");
        this.error = "Данные пользователей отсутствуют или имеют неверный формат";
        return;
      }

      const data = this.data;
      console.log("Preparing data with:", data);

      const functionsUsage = data.functions_stats || {};
      const maritalStatus = data.marital_status?.distribution || {};

      this.topFunctionsChartData = Object.keys(functionsUsage).map(func => ({
        label: func,
        value: functionsUsage[func]
      })).sort((a, b) => b.value - a.value);

      this.userStatusChartData = Object.keys(maritalStatus).map(key => ({
        label: key,
        value: maritalStatus[key]
      }));

      // Расчет аномалий (значения, которые выбиваются из средних)
      const avgAge = data.age_distribution?.average_age ?? 'N/A';
      const avgChildren = data.children_stats?.average_children_per_user ?? 'N/A';
      const avgPoints = data.points_stats?.average_points ?? 'N/A';

      this.anomaliesData = {
        'Средний возраст пользователей': avgAge,
        'Среднее количество детей на пользователя': avgChildren,
        'Среднее количество баллов': avgPoints,
      };
    },
    applyFilters() {
      if (!this.startDate || !this.endDate) {
        this.filteredTopFunctionsChartData = this.topFunctionsChartData;
        this.filteredUserStatusChartData = this.userStatusChartData;
        return;
      }

      const isWithinDateRange = date => {
        const parsedDate = dayjs(date);
        return parsedDate.isSameOrAfter(this.startDate) && parsedDate.isSameOrBefore(this.endDate);
      };

      // Получаем пользователей в пределах указанного диапазона дат
      const filteredUsers = this.data.last_activities?.filter(user => {
        return isWithinDateRange(dayjs(user.last_activity));
      }) || [];

      // Подготовка данных для фильтрованных графиков
      const functionsUsage = {};
      const maritalStatus = {};

      filteredUsers.forEach(user => {
        if (Array.isArray(user.used_functions)) {
          user.used_functions.forEach(func => {
            if (!functionsUsage[func]) {
              functionsUsage[func] = 0;
            }
            functionsUsage[func]++;
          });
        }

        const status = user.marital_status;
        if (status) {
          if (!maritalStatus[status]) {
            maritalStatus[status] = 0;
          }
          maritalStatus[status]++;
        }
      });

      this.filteredTopFunctionsChartData = Object.keys(functionsUsage).map(func => ({
        label: func,
        value: functionsUsage[func]
      })).sort((a, b) => b.value - a.value);

      this.filteredUserStatusChartData = Object.keys(maritalStatus).map(key => ({
        label: key,
        value: maritalStatus[key]
      }));

      console.log('Filtered Functions Data:', this.filteredTopFunctionsChartData); // Логирование отфильтрованных данных функций
      console.log('Filtered User Status Data:', this.filteredUserStatusChartData); // Логирование отфильтрованных данных статуса пользователей
    }
  },
  mounted() {
    this.fetchAnalytics();
  },
};
</script>

<style scoped>
.analytics-page {
  padding: 20px;
}

.filters {
  margin-bottom: 20px;
}

.error-message {
  color: red;
  font-weight: bold;
}

.analytics-blocks {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.block {
  padding: 20px;
  background: #f4f4f4;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>