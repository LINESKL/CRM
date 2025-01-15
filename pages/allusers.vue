<template>
  <div>
    <h3>Все пользователи</h3>

    <!-- Фильтры -->
    <div class="filters">
      <label>
        Пол:
        <select v-model="filters.gender">
          <option value="">Все</option>
          <option value="Мужской">Мужской</option>
          <option value="Женский">Женский</option>
        </select>
      </label>
      <label>
        Возраст:
        <select v-model="filters.age">
          <option value="">Все</option>
          <option value="0-18">0-18</option>
          <option value="19-25">19-25</option>
          <option value="26-40">26-40</option>
          <option value="41-60">41-60</option>
          <option value="61-100">61-100</option>
          <option value="100+">100+</option>
        </select>
      </label>
      <label>
        Дети:
        <select v-model="filters.children">
          <option value="">Все</option>
          <option value="0">Нет детей</option>
          <option value="1">1 ребенок</option>
          <option value="2">2 ребенка</option>
          <option value="3">3 ребенка</option>
          <option value="4+">4 и более</option>
        </select>
      </label>
      <label>
        Последняя активность:
        <select v-model="filters.lastActivity">
          <option value="">Все</option>
          <option value="1">Последний день</option>
          <option value="7">Последняя неделя</option>
          <option value="30">Последний месяц</option>
          <option value="365">Последний год</option>
        </select>
      </label>
      <label>
        Выберите день активности:
        <input type="date" v-model="filters.specificActivityDate" />
      </label>
      <label>
        Баллы за викторину:
        <input type="number" v-model="filters.quizPointsMin" placeholder="Минимум" min="0" max="100" />
        <input type="number" v-model="filters.quizPointsMax" placeholder="Максимум" min="0" max="100" />
      </label>
      <label>
        Использованные функции:
        <select v-model="filters.usedFunction">
          <option value="">Все</option>
          <option value="Кибербезопасность">Кибербезопасность</option>
          <option value="Образование">Образование</option>
          <option value="ИИ">ИИ</option>
          <option value="Стартапы">Стартапы</option>
          <option value="Маркетинг">Маркетинг</option>
          <option value="Финансы">Финансы</option>
          <option value="Проверить себя">Проверить себя</option>
          <option value="Криптовалюты">Криптовалюты</option>
          <option value="Поиск пользователя">Поиск пользователя</option>
          <option value="Технологии">Технологии</option>
          <option value="Инвестиции">Инвестиции</option>
          <option value="Личный кабинет">Личный кабинет</option>
          <option value="Бизнес">Бизнес</option>
        </select>
      </label>
      <button @click="applyFilters">Применить</button>
      <button @click="exportToExcel">Экспорт в Excel</button>
    </div>

    <div class="user-cards">
      <div
          class="user-card"
          v-for="user in filteredUsers"
          :key="user.user_id"
          :class="{'male': user.gender === 'Мужской', 'female': user.gender === 'Женский'}"
      >
        <img
            v-if="user.gender === 'Мужской'"
            src="@/assets/images/male.jpg"
            alt="Male Avatar"
            class="avatar"
        />
        <img
            v-else
            src="@/assets/images/female.jpg"
            alt="Female Avatar"
            class="avatar"
        />
        <h5>{{ user.full_name }}</h5>
        <p>Пол: {{ user.gender }}</p>
        <p>Возраст: {{ user.age }}</p>
        <p>Дети: {{ user.children }}</p>
        <p>Последняя активность: {{ new Date(user.last_activity).toLocaleString() }}</p>
        <p>Использованные функции: {{ user.used_functions.join(', ') }}</p>
        <p>Баллы за викторину: {{ user.quiz_points }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  data() {
    return {
      users: [],
      filters: {
        gender: '',
        age: '',
        children: '',
        lastActivity: '',
        specificActivityDate: '',
        quizPointsMin: '',
        quizPointsMax: '',
        usedFunction: ''
      },
      filteredUsers: []
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/allstats/');
        const data = await response.json();
        this.users = data.all_users;
        this.filteredUsers = this.users; // Изначально показываем всех пользователей
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    },
    applyFilters() {
      this.filteredUsers = this.users.filter(user => {
        let matches = true;

        if (this.filters.gender && user.gender !== this.filters.gender) {
          matches = false;
        }

        if (this.filters.age) {
          const age = parseInt(user.age, 10);
          switch (this.filters.age) {
            case '0-18':
              if (age > 18) matches = false;
              break;
            case '19-25':
              if (age < 19 || age > 25) matches = false;
              break;
            case '26-40':
              if (age < 26 || age > 40) matches = false;
              break;
            case '41-60':
              if (age < 41 || age > 60) matches = false;
              break;
            case '61-100':
              if (age < 61 || age > 100) matches = false;
              break;
            case '100+':
              if (age <= 100) matches = false;
              break;
          }
        }

        if (this.filters.children) {
          const children = parseInt(user.children, 10);
          switch (this.filters.children) {
            case '0':
              if (children !== 0) matches = false;
              break;
            case '1':
              if (children !== 1) matches = false;
              break;
            case '2':
              if (children !== 2) matches = false;
              break;
            case '3':
              if (children !== 3) matches = false;
              break;
            case '4+':
              if (children < 4) matches = false;
              break;
          }
        }

        if (this.filters.lastActivity) {
          const lastActivityDate = new Date(user.last_activity);
          const now = new Date();
          const diffDays = Math.floor((now - lastActivityDate) / (1000 * 60 * 60 * 24));
          switch (this.filters.lastActivity) {
            case '1':
              if (diffDays > 1) matches = false;
              break;
            case '7':
              if (diffDays > 7) matches = false;
              break;
            case '30':
              if (diffDays > 30) matches = false;
              break;
            case '365':
              if (diffDays > 365) matches = false;
              break;
          }
        }

        if (this.filters.specificActivityDate) {
          const specificActivityDate = new Date(this.filters.specificActivityDate);
          const userActivityDate = new Date(user.last_activity);
          if (specificActivityDate.toDateString() !== userActivityDate.toDateString()) {
            matches = false;
          }
        }

        if (this.filters.quizPointsMin || this.filters.quizPointsMax) {
          const quizPoints = parseInt(user.quiz_points, 10);
          if ((this.filters.quizPointsMin && quizPoints < this.filters.quizPointsMin) ||
              (this.filters.quizPointsMax && quizPoints > this.filters.quizPointsMax)) {
            matches = false;
          }
        }

        if (this.filters.usedFunction && !user.used_functions.includes(this.filters.usedFunction)) {
          matches = false;
        }

        return matches;
      });
    },
    exportToExcel() {
      const ws = XLSX.utils.json_to_sheet(this.filteredUsers);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, "all_users.xlsx");
    }
  }
};
</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  align-items: flex-end;
}

.filters label {
  display: flex;
  flex-direction: column;
  font-weight: bold;
}

.filters select,
.filters input {
  padding: 5px;
  margin-top: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  padding: 5px 10px;
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

.user-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.user-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: calc(33.333% - 20px);
  box-sizing: border-box;
}

.user-card.male {
  border: 2px solid #36A2EB;
}

.user-card.female {
  border: 2px solid #FF6384;
}

.avatar {
  width: 100%;
  height: auto;
  border-radius: 50%;
  margin-bottom: 10px;
}
</style>