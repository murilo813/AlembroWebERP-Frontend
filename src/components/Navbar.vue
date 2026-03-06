<template>
  <div class="nav-wrapper">
    <nav class="navbar-floating">
      <div class="nav-brand">Alembro</div>

      <div class="nav-links">
        <RouterLink to="/home" class="nav-link">Início</RouterLink>

        <RouterLink v-for="link in navLinks" :key="link.path" :to="link.path" class="nav-link" :class="{
          'nav-disabled': !hasAccess(link.module),
          'router-link-active': route.path.startsWith(link.path)
        }" @click="!hasAccess(link.module) && deny(link.label)">
          {{ link.label }}
        </RouterLink>
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
import { useRouter, useRoute } from 'vue-router';
import { COMPANIES, USER_TYPES, ROLE_PERMISSIONS } from '@/utils/constants';
import { useToast } from '@/utils/toast';

const router = useRouter();
const route = useRoute();
const { showToast } = useToast();

const navLinks = [
  { path: '/finance', label: 'Financeiro', module: 'finance' },
  { path: '/contracts', label: 'Contratos', module: 'contracts' },
  { path: '/stock', label: 'Estoque', module: 'stock' },
  { path: '/expenses', label: 'Gastos', module: 'expenses' },
  { path: '/management', label: 'Gerenciamento', module: 'management' },
];

const deny = (module) => {
  showToast(`Acesso negado ao setor: ${module}`, "error");
};

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

const hasAccess = (module) => {
  const permissions = ROLE_PERMISSIONS[roleKey] || [];
  return permissions.includes(module);
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
<style src="@/components/navbar.css" scoped></style>