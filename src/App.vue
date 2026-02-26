<template>
  <div class="app-container">
    <Navbar v-if="isLogged" />

    <main :class="['main-content', { 'system-bg': isLogged }]">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';

const route = useRoute();
const isLogged = ref(false);

watchEffect(() => {
  isLogged.value = route.path !== '/login';
});
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #0f172a;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.system-bg {
  padding: 0;
}
</style>