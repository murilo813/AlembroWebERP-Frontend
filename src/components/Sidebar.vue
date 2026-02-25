<template>
  <nav class="sidebar">
    <div class="sidebar-header">
      <img src="/favicon.png" alt="Logo" class="sidebar-logo" />
      <h2 class="sidebar-title">Alembro</h2>
    </div>

    <div class="sidebar-menu">
      <RouterLink to="/home" class="menu-item">
        <span class="icon">🏠</span> Home
      </RouterLink>
      
      <RouterLink to="/management" class="menu-item">
        <span class="icon">📊</span> Gerenciamento
      </RouterLink>

      <RouterLink to="/finance" class="menu-item">
        <span class="icon">💰</span> Financeiro
      </RouterLink>

      <RouterLink to="/expenses" class="menu-item">
        <span class="icon">📉</span> Gastos
      </RouterLink>
    </div>

    <div class="sidebar-footer">
      <button @click="handleLogout" class="logout-button">
        <span class="icon">🚪</span> Sair
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  localStorage.clear(); 
  router.push('/login');
};
</script>

<style src="./sidebar.css" scoped></style>