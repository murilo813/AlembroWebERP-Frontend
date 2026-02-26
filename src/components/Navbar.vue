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
                <p class="role">Administrador</p>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-body">
                <p class="company-label">Empresa</p>
                <p class="company-name">Vila Nova</p>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const nomenclature = ref('');
const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

onMounted(() => {
  nomenclature.value = localStorage.getItem('nomenclature') || 'Usuário';

  window.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu-container')) {
      isDropdownOpen.value = false;
    }
  });
});

const logout = () => {
  localStorage.clear();
  router.push('/login');
};
</script>

<style src="./navbar.css" scoped></style>