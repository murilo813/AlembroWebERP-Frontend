<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <img src="/favicon.png" alt="Logo" class="nav-logo" />
      <span class="brand-name">Alembro</span>
    </div>

    <div class="nav-links">
      <RouterLink to="/home" class="nav-item">Início</RouterLink>
      <RouterLink to="/finance" class="nav-item">Financeiro</RouterLink>
      <RouterLink to="/orders" class="nav-item">Compras</RouterLink>
      <RouterLink to="/management" class="nav-item">Gerência</RouterLink>
      <RouterLink to="/stock" class="nav-item">Estoque</RouterLink>
      <RouterLink to="/expenses" class="nav-item">Gastos</RouterLink>
    </div>

    <div class="nav-actions">
      <span class="user-name">{{ nomenclature }}</span>
      <button @click="handleLogout" class="logout-btn">Sair</button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const nomenclature = ref('');

onMounted(() => {
  // Pegando a nomenclatura que você salvou no login
  nomenclature.value = localStorage.getItem('nomenclature') || 'Usuário';
});

const handleLogout = () => {
  localStorage.clear();
  router.push('/login');
};
</script>

<style src="./navbar.css" scoped></style>