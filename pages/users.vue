<template>
  <div>
    <h1>Список пользователей Telegram</h1>
    <table>
      <thead>
      <tr>
        <!-- Динамически создаём заголовки таблицы -->
        <th v-for="(value, key) in users[0]" :key="key">{{ key }}</th>
      </tr>
      </thead>
      <tbody>
      <!-- Динамически создаём строки и столбцы -->
      <tr v-for="user in users" :key="user.user_id">
        <td v-for="(value, key) in user" :key="key">
          {{ value || 'Отсутствует' }}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import {ref} from 'vue';

// Храним список пользователей
const users = ref([]);
// Для обработки ошибок
const error = ref(null);

// Функция для получения всех данных с API
const fetchAllPages = async () => {
  try {
    let page = 1; // Номер страницы
    let hasNextPage = true; // Есть ли следующая страница

    while (hasNextPage) {
      // Запрашиваем данные текущей страницы
      const {data} = await useFetch(`http://127.0.0.1:8000/api/api/users/?page=${page}`);

      // Если есть результаты, добавляем их в массив
      if (data.value?.results) {
        users.value.push(...data.value.results);
      }

      // Проверяем, есть ли ссылка на следующую страницу
      hasNextPage = !!data.value?.next;
      page += 1; // Переход к следующей странице
    }
  } catch (err) {
    console.error('Ошибка загрузки данных:', err);
    error.value = err;
  }
};

// Загружаем данные при открытии страницы
await fetchAllPages();
</script>
