<template>
  <div class="analytics-page">
    <h1>Аналитика</h1>

    <!-- Фильтры -->
    <div class="filters">
      <label>
        Уровень аналитики:
        <select v-model="selectedLevel" @change="fetchAnalytics">
          <option value="country">Все регионы</option>
          <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
        </select>
      </label>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <!-- Аналитические блоки -->
    <div class="analytics-blocks" v-if="data">
      <!-- Описательная аналитика -->
      <div class="block">
        <h2>Описательная аналитика</h2>
        <p>Всего пользователей: {{ data.total_users || 'Нет данных' }}</p>
        <p>Средний возраст: {{ data.age_distribution?.average_age || 'Нет данных' }}</p>
        <p>Среднее количество детей на пользователя: {{ data.children_stats?.average_children_per_user || 'Нет данных' }}</p>
        <p>Общее количество детей: {{ data.children_stats?.total_children || 'Нет данных' }}</p>
      </div>

      <!-- Диагностическая аналитика -->
      <div class="block">
        <h2>Диагностическая аналитика</h2>
        <p>Гендерное распределение:</p>
        <p>Мужчины: {{ data.gender_distribution?.male_percentage || 'Нет данных' }}%</p>
        <p>Женщины: {{ data.gender_distribution?.female_percentage || 'Нет данных' }}%</p>
        <p>Соотношение мужчин к женщинам: {{ genderRatio }}</p>
      </div>

      <!-- Визуализация данных -->
      <div class="block">
        <h2>Визуализация данных</h2>
        <bar-chart :data="ageChartData" />
        <bar-chart :data="childrenChartData" />
        <pie-chart :data="maritalStatusChartData" />
        <line-chart :data="ageGenderChartData" />
        <bar-chart :data="functionsChartData" />
      </div>

      <!-- Прогнозная аналитика -->
      <div class="block">
        <h2>Прогнозная аналитика</h2>
        <p>Статистика по пособиям:</p>
        <p>Получают пособия: {{ data.benefits_stats?.receiving_benefits || 'Нет данных' }}</p>
        <p>Средний возраст получателей пособий: {{ data.benefits_stats?.average_age_benefit_recipients || 'Нет данных' }}</p>
        <p>Процент с детьми: {{ data.benefits_stats?.percentage_with_children || 'Нет данных' }}%</p>
      </div>

      <!-- Рекомендательная аналитика -->
      <div class="block">
        <h2>Рекомендательная аналитика</h2>
        <p>Тип пользователя</p>
        <p>Web пользователи: {{ data.type_stats?.[1]?.count || 'Нет данных' }}</p>
        <p>Не web пользователи: {{ data.type_stats?.[0]?.count || 'Нет данных' }}</p>
      </div>

      <!-- Комментарии по аналитике -->
      <div class="block">
        <h2>Комментарии и выводы</h2>
        <ul>
          <li v-for="(comment, index) in comments" :key="index">{{ comment }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import BarChart from '~/components/BarChart.vue';
import LineChart from '~/components/LineChart.vue';
import PieChart from '~/components/PieChart.vue';

export default {
  components: {
    BarChart,
    LineChart,
    PieChart,
  },
  data() {
    return {
      selectedLevel: 'country',
      regions: ['Астана', 'Актобе', 'Алматы', 'Атырау', 'Семей', 'Тараз', 'Жезказган', 'Костанай', 'Кызылорда', 'Актау',
        'Петропавловск', 'Павлодар', 'Туркестан', 'Уральск', 'Караганда', 'Талдыкорган', 'Усть-Каменогорск'],
      data: null,
      ageChartData: null,
      childrenChartData: null,
      maritalStatusChartData: null,
      ageGenderChartData: null,
      functionsChartData: null,
      genderRatio: null,
      largestAgeGroup: null,
      largestChildrenGroup: null,
      largestMaritalStatusGroup: null,
      mostUsedFunction: null,
      comments: [],
      error: null,
      openAIKey:  // Замените на ваш ключ OpenAI API
    };
  },
  methods: {
    async fetchAnalytics() {
      try {
        this.error = null; // сброс ошибки перед новым запросом
        let response;
        if (this.selectedLevel === 'country') {
          response = await axios.get('http://127.0.0.1:8000/api/allstats/');
        } else {
          response = await axios.get(`http://127.0.0.1:8000/api/stats/region/${this.selectedLevel}/`);
        }

        this.data = response.data;

        // Prepare data and perform analysis
        this.prepareData();
        this.performAnalysis();
        await this.generateComments(); // Генерация комментариев на основе данных
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
      if (!this.data) return;

      const data = this.data;

      this.ageChartData = {
        labels: ['Младше 18', '18-25', '26-40', '41-60', '61-100', 'Старше 100'],
        datasets: [
          {
            label: 'Возрастные группы',
            data: [
              data.age_distribution?.age_groups?.under_18 || 0,
              data.age_distribution?.age_groups?.['18_25'] || 0,
              data.age_distribution?.age_groups?.['26_40'] || 0,
              data.age_distribution?.age_groups?.['41_60'] || 0,
              data.age_distribution?.age_groups?.['61_100'] || 0,
              data.age_distribution?.age_groups?.over_100 || 0
            ],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };

      this.childrenChartData = {
        labels: Object.keys(data.children_stats?.distribution || {}).map(key => key.replace('_children', ' детей')),
        datasets: [
          {
            label: 'Количество детей',
            data: Object.values(data.children_stats?.distribution || {}),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          },
        ],
      };

      this.maritalStatusChartData = {
        labels: Object.keys(data.marital_status?.distribution || {}),
        datasets: [
          {
            label: 'Семейное положение',
            data: Object.values(data.marital_status?.distribution || {}),
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
          },
        ],
      };

      this.ageGenderChartData = {
        labels: ['Младше 18', '18-25', '26-40', '41-60', '61-100', 'Старше 100'],
        datasets: [
          {
            label: 'Мужчины',
            data: [
              data.age_gender_distribution?.male?.under_18 || 0,
              data.age_gender_distribution?.male?.['18_25'] || 0,
              data.age_gender_distribution?.male?.['26_40'] || 0,
              data.age_gender_distribution?.male?.['41_60'] || 0,
              data.age_gender_distribution?.male?.['61_100'] || 0,
              data.age_gender_distribution?.male?.over_100 || 0
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'Женщины',
            data: [
              data.age_gender_distribution?.female?.under_18 || 0,
              data.age_gender_distribution?.female?.['18_25'] || 0,
              data.age_gender_distribution?.female?.['26_40'] || 0,
              data.age_gender_distribution?.female?.['41_60'] || 0,
              data.age_gender_distribution?.female?.['61_100'] || 0,
              data.age_gender_distribution?.female?.over_100 || 0
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      };

      this.functionsChartData = {
        labels: Object.keys(data.functions_stats || {}),
        datasets: [
          {
            label: 'Использование функций',
            data: Object.values(data.functions_stats || {}),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
    },
    performAnalysis() {
      if (!this.data) return;

      const data = this.data;

      // Анализ гендерного распределения
      this.genderRatio = data.gender_distribution
          ? (data.gender_distribution.male_percentage / data.gender_distribution.female_percentage).toFixed(2)
          : 'Нет данных';

      // Анализ возрастных групп
      const ageGroups = data.age_distribution ? data.age_distribution.age_groups : {};
      this.largestAgeGroup = Object.keys(ageGroups).reduce((a, b) => ageGroups[a] > ageGroups[b] ? a : b, 'Нет данных');

      // Анализ количества детей
      const childrenGroups = data.children_stats ? data.children_stats.distribution : {};
      this.largestChildrenGroup = Object.keys(childrenGroups).reduce((a, b) => childrenGroups[a] > childrenGroups[b] ? a : b, 'Нет данных');

      // Анализ семейного положения
      const maritalStatusGroups = data.marital_status ? data.marital_status.distribution : {};
      this.largestMaritalStatusGroup = Object.keys(maritalStatusGroups).reduce((a, b) => maritalStatusGroups[a] > maritalStatusGroups[b] ? a : b, 'Нет данных');

      // Анализ использования функций
      const functionsUsage = data.functions_stats || {};
      this.mostUsedFunction = Object.keys(functionsUsage).reduce((a, b) => functionsUsage[a] > functionsUsage[b] ? a : b, 'Нет данных');
    },
    async generateComments() {
      if (!this.data) return;

      const comments = [];

      // Подготовка данных для отправки в OpenAI API
      const dataSummary = `
        Общее количество пользователей: ${this.data.total_users}
        Гендерное распределение: Мужчины - ${this.data.gender_distribution?.male_percentage}%, Женщины - ${this.data.gender_distribution?.female_percentage}%
        Средний возраст: ${this.data.age_distribution?.average_age}
        Основная возрастная группа: ${this.largestAgeGroup}
        Общее количество детей: ${this.data.children_stats?.total_children}
        Среднее количество детей на пользователя: ${this.data.children_stats?.average_children_per_user}
        Самая популярная функция: ${this.mostUsedFunction}
      `;

      try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
          model: 'text-davinci-003',
          prompt: `На основе следующих данных предоставьте анализ и рекомендации: ${dataSummary}`,
          max_tokens: 200,
          temperature: 0.7,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openAIKey}`
          }
        });

        comments.push(response.data.choices[0].text.trim());
      } catch (error) {
        console.error('Ошибка генерации комментариев:', error);
      }

      this.comments = comments;
    }
  },
  mounted() {
    this.fetchAnalytics();
  },
};
</script>

<style>
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
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.block {
  padding: 20px;
  background: #f4f4f4;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}


</style>