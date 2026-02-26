<template>
  <div class="home-container">
    <div class="welcome-section">
      <transition name="fade-up" appear>
        <div class="glass-card">
          <div class="status-badge">Sistema Online</div>
          <h1 class="welcome-text">
            Bem-vindo(a), <span class="user-highlight">{{ nomenclature }}</span>
          </h1>
          <div class="divider"></div>
          <p class="system-brand">Alembro Web ERP</p>

          <div class="quick-stats">
            <div class="stat-item">
              <span class="stat-label">Empresa</span>
              <span class="stat-value">Agro Zecão</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Status</span>
              <span class="stat-value emerald">Administrador</span>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const nomenclature = ref('');

onMounted(() => {
  nomenclature.value = localStorage.getItem('nomenclature') || 'Usuário';
});
</script>

<style src="./home.css" scoped></style>