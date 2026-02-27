<template>
  <div class="nav-wrapper">
    <nav class="navbar-floating">
      <div class="nav-brand">Alembro</div>

      <div class="nav-links">
        <RouterLink to="/home" class="nav-link">Início</RouterLink>

        <RouterLink 
          to="/finance" 
          class="nav-link" 
          :class="{ 'nav-disabled': !hasAccess('finance') }"
          @click="!hasAccess('finance') && deny('Financeiro')"
        >Financeiro</RouterLink>

        <RouterLink 
          to="/stock" 
          class="nav-link" 
          :class="{ 'nav-disabled': !hasAccess('stock') }"
          @click="!hasAccess('stock') && deny('Estoque')"
        >Estoque</RouterLink>

        <RouterLink 
          to="/expenses" 
          class="nav-link" 
          :class="{ 'nav-disabled': !hasAccess('expenses') }"
          @click="!hasAccess('expenses') && deny('Gastos')"
        >Gastos</RouterLink>

        <RouterLink 
          to="/management" 
          class="nav-link" 
          :class="{ 'nav-disabled': !hasAccess('management') }"
          @click="!hasAccess('management') && deny('Gerenciamento')"
        >Gerenciamento</RouterLink>
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

    <Toast :show="toast.show" :message="toast.message" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { COMPANIES, USER_TYPES, ROLE_PERMISSIONS } from '@/utils/constants';
import Toast from '@/components/common/Toast.vue';

const router = useRouter();

const toast = ref({ show: false, message: '' });
const deny = (module) => {
  toast.value.show = false;
  
  setTimeout(() => {
    toast.value.message = `Acesso negado ao setor: ${module}`;
    toast.value.show = true;

    setTimeout(() => {
      toast.value.show = false;
    }, 3000);
  }, 10);
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