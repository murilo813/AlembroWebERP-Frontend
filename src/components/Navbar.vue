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

        <div class="notif-menu-container" :class="{ 'active': isNotifOpen }">
          <div class="notif-trigger" :class="{ 'has-notifs': notifications.length > 0 }" @click="toggleNotif">
            <i class="fa-solid fa-bell"></i>
            <span v-if="notifications.length > 0" class="notif-number">{{ notifications.length }}</span>
          </div>

          <Transition name="glass-pop">
            <div v-if="isNotifOpen" class="user-dropdown notif-dropdown">
              <div class="dropdown-header">
                <p class="name">Notificações</p>
                <p class="role" v-if="notifications.length > 0">{{ notifications.length }} PENDENTES</p>
                <p class="role" v-else>TUDO LIMPO</p>
              </div>
              <div class="dropdown-divider"></div>

              <div class="dropdown-body notif-body">
                <div v-if="notifications.length === 0" class="notif-empty">
                  <i class="fa-solid fa-check-double" style="font-size: 2rem; margin-bottom: 1rem; color: #10b981;"></i>
                  <p>Nenhuma notificação no momento.</p>
                </div>

                <div v-else class="notif-list">
                  <div v-for="notif in notifications" :key="notif.id" class="notif-item">
                    <div class="notif-content" @click="goToClient(notif.clientId)">
                      <p class="notif-client">{{ notif.clientName }}</p>
                      <p class="notif-text">{{ notif.content }}</p>
                      <p class="notif-date">
                        <i class="fa-regular fa-calendar"></i> Agendado para: {{ formatDate(notif.scheduleDate) }}
                      </p>
                    </div>
                    <button class="btn-remove-notif" @click.stop="markAsRead(notif.id)" title="Remover notificação">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

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
import authService from '@/services/authService';
import notificationService from '@/services/notificationService';

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

const deny = (module) => { showToast(`Acesso negado ao setor: ${module}`, "error"); };

const companyId = localStorage.getItem('companyId');
const companyName = ref(COMPANIES[Number(companyId)] || 'Indefinido');
const nomenclature = ref(localStorage.getItem('nomenclature') || 'Indefinido');
const roleKey = localStorage.getItem('userType');
const userType = USER_TYPES[roleKey] || 'Indefinido';

const isDropdownOpen = ref(false);
const isNotifOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) isNotifOpen.value = false;
};

const toggleNotif = () => {
  isNotifOpen.value = !isNotifOpen.value;
  if (isNotifOpen.value) isDropdownOpen.value = false;
};

const closeDropdowns = (e) => {
  if (!e.target.closest('.user-menu-container') && !e.target.closest('.notif-menu-container')) {
    isDropdownOpen.value = false;
    isNotifOpen.value = false;
  }
};

const hasAccess = (module) => {
  const permissions = ROLE_PERMISSIONS[roleKey] || [];
  return permissions.includes(module);
};

const notifications = ref([]);
let pollingInterval = null;

const fetchNotifications = async () => {
  notifications.value = await notificationService.getNotifications();
};

const markAsRead = async (id) => {
  try {
    await notificationService.markAsRead(id);
    notifications.value = notifications.value.filter(n => n.id !== id);
    showToast("Notificação removida", "success");

    if (notifications.value.length === 0) {
      isNotifOpen.value = false;
    }
  } catch (error) {
    showToast("Erro ao remover notificação", "error");
  }
};

const goToClient = (clientId) => {
  isNotifOpen.value = false;
  router.push({
    path: '/finance',
    query: { client: clientId }
  });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

onMounted(() => {
  window.addEventListener('click', closeDropdowns);
  fetchNotifications();
  pollingInterval = setInterval(fetchNotifications, 120000);
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns);
  if (pollingInterval) clearInterval(pollingInterval);
});

const logout = async () => {
  await authService.logout();
  router.push('/login');
};
</script>

<style src="@/components/navbar.css" scoped></style>