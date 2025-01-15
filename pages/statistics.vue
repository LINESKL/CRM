<template>
  <div>
    <div class="filters">
      <label>
        Выберите данные:
        <select v-model="selectedView" @change="updateView">
          <option value="countryStats">Страна</option>
          <option value="statsMap">Регионы</option>
        </select>
      </label>
    </div>
    <component :is="currentComponent" />
  </div>
</template>

<script>
import StatsMap from '/components/layout/StatsMap.vue';
import CountryStats from '/components/layout/CountryStats.vue';

export default {
  data() {
    return {
      selectedView: 'countryStats',
      currentComponent: CountryStats
    };
  },
  methods: {
    updateView() {
      if (this.selectedView === 'countryStats') {
        this.currentComponent = CountryStats;
      } else {
        this.currentComponent = StatsMap;
      }
    }
  }
};
</script>

<style scoped>
.filters {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.filters label {
  display: flex;
  flex-direction: column;
}
label {
  margin-right: 20px;
}
</style>