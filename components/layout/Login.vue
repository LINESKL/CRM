<template>
    <div class="relative">
      <div
        @click="toggleMenu"
        class="flex justify-center items-center cursor-pointer profile-button text-[var(--nav-text-color)] hover:text-[var(--hover-nav-color)]"
      >
        <Icon name="line-md:account" class="mr-2 text-[24px]" />
        <span class="text-lg underline tracking-wider">Nurkanat Aliar</span>
      </div>
  
      <transition name="fade">
        <div
          v-if="menuVisible"
          ref="menu"
          class="absolute -right-7 top-full mt-2 bg-[var(--bg-nav-color)] border-2 border-[var(--bg-color)] rounded-xl shadow-2xl shadow-white z-50 w-52"
        >
          <div class="flex flex-col space-y-2 pb-2">
            <button
              class="flex justify-center items-center w-auto space-x-2 mx-2 py-2 px-4 text-[var(--nav-text-color)] hover:text-[var(--hover-nav-color)]"
            >
              <NuxtImg src="/avatar.png" width="100px" class="rounded-full border-[3px]" alt="avatar" />
            </button>
            <button
              @click="openProfile"
              class="flex justify-left items-center space-x-2 mx-2 pt-4 px-4 text-[var(--nav-text-color)] border-t-2 border-[var(--bg-color)] hover:text-[var(--hover-nav-color)] transition"
            >
              <Icon name="line-md:person" size="1.2em" />
              <span>Профиль</span>
            </button>
            <button
              @click="openSettings"
              class="flex justify-left items-center space-x-2 mx-2 pb-4 px-4 text-[var(--nav-text-color)] border-b-2 border-[var(--bg-color)] hover:text-[var(--hover-nav-color)] transition"
            >
              <Icon name="line-md:cog-loop" size="1.2em" />
              <span>Настройки</span>
            </button>
            <button
              @click="logout"
              class="flex justify-center items-center space-x-2 m-4 py-2 px-4 rounded-lg bg-red-500 text-[var(--nav-text-color)] hover:bg-red-700 transition"
            >
                <span>Выход</span>
                <Icon name="line-md:log-in" size="1.2em" />
            </button>
          </div>
        </div>
      </transition>
    </div>
</template>
  
<script>
  export default {
    data() {
      return {
        menuVisible: false,
      };
    },
    methods: {
      toggleMenu() {
        this.menuVisible = !this.menuVisible;
        if (this.menuVisible) {
          document.addEventListener("click", this.handleClickOutside);
        } else {
          document.removeEventListener("click", this.handleClickOutside);
        }
      },
      handleClickOutside(event) {
        if (
          !this.$refs.menu.contains(event.target) &&
          !event.target.closest(".profile-button")
        ) {
          this.menuVisible = false;
          document.removeEventListener("click", this.handleClickOutside);
        }
      },
      openProfile() {
        this.menuVisible = false;
        alert("Opening profile");
      },
      openSettings() {
        this.menuVisible = false;
        alert("Opening settings");
      },
      logout() {
        this.menuVisible = false;
        alert("Logging out");
      },
    },
    beforeDestroy() {
      document.removeEventListener("click", this.handleClickOutside);
    },
  };
</script>
  
<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .fade-enter {
    opacity: 0;
    transform: translateY(20px);
  }
  .fade-enter-to {
    opacity: 1;
    transform: translateY(0);
  }
  .fade-leave {
    opacity: 1;
    transform: translateY(0);
  }
  .fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
</style>
  