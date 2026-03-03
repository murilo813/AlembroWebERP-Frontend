<template>
  <div class="app-container">
    <Navbar v-if="isLogged" />

    <main :class="['main-content', { 'system-bg': isLogged }]">
      <RouterView />
    </main>

    <Toast 
      :show="toast.show" 
      :message="toast.message" 
      :type="toast.type" 
    />
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import Toast from '@/components/common/Toast.vue';
import { useToast } from '@/utils/toast';

const route = useRoute();
const isLogged = ref(false);

const { toast } = useToast();

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
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden; 
  scrollbar-gutter: stable;
}

.system-bg {
  padding: 0;
}
</style>