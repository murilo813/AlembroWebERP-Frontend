<template>
  <div class="home-container">
    <transition name="fade-up" appear>
      <div class="welcome-box">
        <h1 class="welcome-title">
          Bem vindo(a), <span class="highlight">{{ nomenclature }}</span>
        </h1>
        <div class="underline"></div>
        <p class="system-status">Alembro Web ERP</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const nomenclature = ref('');

onMounted(() => {
  nomenclature.value = localStorage.getItem('nomenclature');
});
</script>

<style src="./home.css" scoped></style>