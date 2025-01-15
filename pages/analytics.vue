<template>
  <div class="analytics-page">
    <h1>Аналитика</h1>

    <!-- Сообщение об ошибке -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <!-- Данные и интерпретация -->
    <div v-if="data">
      <div class="block">
        <h2>Общая информация</h2>
        <p>Всего пользователей: {{ data.total_users || 'Нет данных' }}</p>
        <p>Средний возраст: {{ data.age_distribution?.average_age || 'Нет данных' }}</p>
        <p>Среднее количество детей на пользователя: {{ data.children_stats?.average_children_per_user || 'Нет данных' }}</p>
        <p>Общее количество детей: {{ data.children_stats?.total_children || 'Нет данных' }}</p>
      </div>

      <div class="block">
        <h2>Гендерное распределение</h2>
        <p>Мужчины: {{ data.gender_distribution?.male_percentage || 'Нет данных' }}%</p>
        <p>Женщины: {{ data.gender_distribution?.female_percentage || 'Нет данных' }}%</p>
      </div>

      <div class="block">
        <h2>Возрастное распределение</h2>
        <p>Меньше 18 лет: {{ data.age_distribution?.age_groups?.under_18 || 'Нет данных' }}</p>
        <p>18-25 лет: {{ data.age_distribution?.age_groups?.['18_25'] || 'Нет данных' }}</p>
        <p>26-40 лет: {{ data.age_distribution?.age_groups?.['26_40'] || 'Нет данных' }}</p>
        <p>41-60 лет: {{ data.age_distribution?.age_groups?.['41_60'] || 'Нет данных' }}</p>
        <p>61-100 лет: {{ data.age_distribution?.age_groups?.['61_100'] || 'Нет данных' }}</p>
        <p>Больше 100 лет: {{ data.age_distribution?.age_groups?.over_100 || 'Нет данных' }}</p>
      </div>

      <div class="block">
        <h2>Статистика по детям</h2>
        <p>Общее количество детей: {{ data.children_stats?.total_children || 'Нет данных' }}</p>
        <p>Среднее количество детей на пользователя: {{ data.children_stats?.average_children_per_user || 'Нет данных' }}</p>
        <div v-for="(value, key) in data.children_stats?.distribution" :key="key">
          <p>{{ key.replace('_children', ' детей') }}: {{ value }}</p>
        </div>
      </div>

      <div class="block">
        <h2>Статистика по пособиям</h2>
        <p>Получают пособия: {{ data.benefits_stats?.receiving_benefits || 'Нет данных' }}</p>
        <p>Средний возраст получателей пособий: {{ data.benefits_stats?.average_age_benefit_recipients || 'Нет данных' }}</p>
        <p>Процент с детьми: {{ data.benefits_stats?.percentage_with_children || 'Нет данных' }}%</p>
      </div>

      <div class="block">
        <h2>Семейное положение</h2>
        <div v-for="(value, key) in data.marital_status?.distribution" :key="key">
          <p>{{ key }}: {{ value }}</p>
        </div>
      </div>

      <div class="block">
        <h2>Средний возраст по семейному положению</h2>
        <div v-for="(value, key) in data.marital_status?.average_age_by_status" :key="key">
          <p>{{ key }}: {{ value }}</p>
        </div>
      </div>

      <div class="block">
        <h2>Распределение по полу и возрасту</h2>
        <div>
          <h3>Мужчины</h3>
          <div v-for="(value, key) in data.age_gender_distribution?.male" :key="key">
            <p>{{ key }}: {{ value }}</p>
          </div>
        </div>
        <div>
          <h3>Женщины</h3>
          <div v-for="(value, key) in data.age_gender_distribution?.female" :key="key">
            <p>{{ key }}: {{ value }}</p>
          </div>
        </div>
      </div>

      <div class="block">
        <h2>Статистика по баллам</h2>
        <p>Общее количество баллов: {{ data.points_stats?.total_points || 'Нет данных' }}</p>
        <p>Среднее количество баллов: {{ data.points_stats?.average_points || 'Нет данных' }}</p>
      </div>

      <div class="block">
        <h2>Статистика по функциям</h2>
        <div v-for="(value, key) in data.functions_stats" :key="key">
          <p>{{ key }}: {{ value }}</p>
        </div>
      </div>

      <div class="block">
        <h2>Типы пользователей</h2>
        <p>Web пользователи: {{ data.type_stats[1]?.count || 'Нет данных' }}</p>
        <p>Не web пользователи: {{ data.type_stats[0]?.count || 'Нет данных' }}</p>
      </div>

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

export default {
  data() {
    return {
      data: null,
      comments: [],
      error: null,

    };
  },
  methods: {
    async fetchAnalytics() {
      try {
        this.error = null; // сброс ошибки перед новым запросом
        const response = await axios.get('http://127.0.0.1:8000/api/allstats/');
        this.data = response.data;

        // Генерация комментариев на основе данных
        await this.generateComments();
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
    async generateComments() {
      if (!this.data) return;

      const comments = [];

      // Подготовка данных для отправки в OpenAI API
      const dataSummary = `
        Общее количество пользователей: ${this.data.total_users}
        Гендерное распределение: Мужчины - ${this.data.gender_distribution?.male_percentage}%, Женщины - ${this.data.gender_distribution?.female_percentage}%
        Средний возраст: ${this.data.age_distribution?.average_age}
        Основная возрастная группа: ${JSON.stringify(this.data.age_distribution?.age_groups)}
        Общее количество детей: ${this.data.children_stats?.total_children}
        Среднее количество детей на пользователя: ${this.data.children_stats?.average_children_per_user}
      `;

      try {
        console.log("Отправка данных в OpenAI API:", dataSummary);

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
        console.log("Ответ от OpenAI API:", response.data);
      } catch (error) {
        console.error('Ошибка генерации комментариев:', error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        }
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

.error-message {
  color: red;
  font-weight: bold;
}

.block {
  padding: 20px;
  background: #f4f4f4;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
</style>