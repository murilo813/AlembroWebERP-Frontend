<template>
  <div class="empty-search-state">
    <i class="fa-solid fa-circle-notch fa-spin empty-icon" style="color: #10b981; opacity: 1;"></i>
    <h2 style="color: #10b981;">{{ title }}</h2>
    <p>{{ subtitle }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Carregando dados...'
  },
  subtitle: {
    type: String,
    default: 'Sincronizando com o banco de dados'
  }
});
</script>

<style src="./LoadingSpinner.css" scoped></style>