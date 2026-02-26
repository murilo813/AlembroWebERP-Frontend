<template>
  <div class="nav-wrapper">
    <nav class="navbar-floating">
      <div class="nav-brand">Alembro</div>

      <div class="nav-links">
        <RouterLink to="/home" class="nav-link">Início</RouterLink>
        <RouterLink to="/finance" class="nav-link">Financeiro</RouterLink>
        <RouterLink to="/stock" class="nav-link">Estoque</RouterLink>
        <RouterLink to="/expenses" class="nav-link">Gastos</RouterLink>
        <RouterLink to="/management" class="nav-link">Gerenciamento</RouterLink>
      </div>

      <div class="nav-user">
        <div class="user-menu-container" :class="{ 'active': isDropdownOpen }">
          <div class="user-info" @click="toggleDropdown">
            <img src="/assets/user.png" alt="User" class="user-icon icon-admin" />
            <span class="user-name">{{ nomenclature }}</span>
          </div>

          <Transition name="glass-pop">
            <div v-if="isDropdownOpen" class="user-dropdown">
              <div class="dropdown-header">
                <p class="name">{{ nomenclature }}</p>
                <p class="role">{{ userType }}</p>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-body">
                <p class="company-label">Empresa</p>
                <p class="company-name">{{ companyName }}</p>
              </div>
            </div>
          </Transition>
        </div>

        <button @click="logout" class="logout-minimal">Sair</button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { COMPANIES, USER_TYPES } from '@/utils/constants';

const router = useRouter();
const companyId = localStorage.getItem('companyId');
const companyName = ref(COMPANIES[Number(companyId)] || 'Indefinido');
const nomenclature = ref(localStorage.getItem('nomenclature') || 'Indefinido');
const roleKey = localStorage.getItem('userType');
const userType = USER_TYPES[roleKey] || 'Indefinido'; 

const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (e) => {
  if (!e.target.closest('.user-menu-container')) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown);
});

const logout = () => {
  localStorage.clear();
  router.push('/login');
};
</script>

<style src="./navbar.css" scoped></style>