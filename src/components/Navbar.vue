<template>
  <div class="nav-wrapper">
    <nav class="navbar-floating">
      <div class="nav-brand">Alembro</div>

      <div class="nav-links">
        <RouterLink to="/home" class="nav-link">Início</RouterLink>
        <RouterLink to="/finance" class="nav-link">Financeiro</RouterLink>
        <RouterLink to="/stock" class="nav-link">Estoque</RouterLink>
        <RouterLink to="/expenses" class="nav-link">Gastos</RouterLink>
      </div>

      <div class="nav-user">
        <div class="user-info">
          <img src="/assets/user.png" alt="User" class="user-icon icon-admin" />
          <span class="user-name">{{ nomenclature }}</span>
        </div>
        <button @click="logout" class="logout-minimal">Sair</button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const nomenclature = ref('');

onMounted(() => {
  nomenclature.value = localStorage.getItem('nomenclature') || 'Usuário';
});

const logout = () => {
  localStorage.clear();
  router.push('/login');
};
</script>

<style src="./navbar.css" scoped></style>