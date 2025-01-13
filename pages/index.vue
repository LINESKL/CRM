<template>
  <div class="dashboard">
    <h1>Добро пожаловать в CRM-систему</h1>
    <p>Управляйте своими клиентами, сделками и задачами с легкостью.</p>

    <!-- Основная статистика -->
    <div class="stats">
      <div class="stat-item">
        <h2>{{ totalClients }}</h2>
        <p>Клиентов</p>
      </div>
      <div class="stat-item">
        <h2>{{ totalDeals }}</h2>
        <p>Сделок</p>
      </div>
      <div class="stat-item">
        <h2>{{ totalTasks }}</h2>
        <p>Задач</p>
      </div>
    </div>

    <!-- Графики -->
    <div class="charts">
      <bar-chart :data="dealsChartData" />
      <line-chart :data="tasksChartData" />
    </div>

    <!-- Список задач и событий -->
    <div class="tasks">
      <h2>Предстоящие задачи</h2>
      <ul>
        <li v-for="task in tasks" :key="task.id">
          {{ task.title }} - {{ task.dueDate }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import BarChart from '~/components/BarChart.vue';
import LineChart from '~/components/LineChart.vue';

export default {
  components: {
    BarChart,
    LineChart,
  },
  data() {
    return {
      totalClients: 150,
      totalDeals: 75,
      totalTasks: 20,
      dealsChartData: {
        labels: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май'],
        datasets: [
          {
            label: 'Сделки',
            data: [12, 19, 3, 5, 2],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      tasksChartData: {
        labels: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'],
        datasets: [
          {
            label: 'Задачи',
            data: [3, 2, 2, 5, 4],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          },
        ],
      },
      tasks: [
        { id: 1, title: 'Позвонить клиенту', dueDate: '2025-01-14' },
        { id: 2, title: 'Отправить предложение', dueDate: '2025-01-15' },
        { id: 3, title: 'Согласовать договор', dueDate: '2025-01-16' },
      ],
    };
  },
};
</script>

<style>
.dashboard {
  padding: 20px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.charts {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.tasks {
  margin-top: 20px;
}
</style>