<template>
  <div class="expenses-container">
    <div class="expenses-wrapper">

      <header class="expenses-header">
        <div class="title-section">
          <h1 class="main-title">Módulo de Gastos</h1>
          <p class="subtitle">Análise e inserção de gastos, e gerenciamento de frota.</p>
        </div>
      </header>

      <main class="expenses-content">
        <Transition name="fade-slide" mode="out-in">

          <LoadingSpinner v-if="isLoading" key="loading" title="Carregando estatísticas..."
            subtitle="Calculando resumo de gastos" />

          <div v-else class="expenses-hub-grid" key="content">
            <div class="hub-card" :class="{ 'card-disabled': !canAccess('data') }" @click="goToData">
              <div class="card-glow"></div>
              <div class="icon-wrapper">
                <i class="fa-solid fa-chart-pie"></i>
              </div>
              <h2 class="card-title">Consulta de Gastos</h2>
              <p class="card-description">
                Visão gerencial de todos os gastos já inseridos. Com filtros avançados, acesse resumos mensais e
                relatórios consolidados.
              </p>

              <div v-if="canAccess('data')" class="card-stat">
                <span class="stat-label">Gasto no Mês:</span>
                <span class="stat-value emerald">{{ formatCurrency(statsData.totalMonthExpenses || 0) }}</span>
              </div>
            </div>

            <div class="hub-card" :class="{
              'alert-card': statsData.pendingEntries > 0 && canAccess('bind'),
              'card-disabled': !canAccess('bind')
            }" @click="goToBind">
              <div class="card-glow"></div>
              <div class="icon-wrapper" :class="{ 'alert-icon': statsData.pendingEntries > 0 && canAccess('bind') }">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                <span v-if="statsData.pendingEntries > 0 && canAccess('bind')" class="notification-badge">{{
                  statsData.pendingEntries }}</span>
              </div>
              <h2 class="card-title">Entradas Pendentes</h2>
              <p class="card-description">
                Fila de conciliação. Vincule placas, quilometragem, responsável e tipo de gasto às notas brutas
                importadas automaticamente.
              </p>

              <div class="card-stat" :class="{ 'alert-stat': statsData.pendingEntries > 0 && canAccess('bind') }">
                <template v-if="!canAccess('bind')">
                  <span class="stat-label">Módulo de Vínculo</span>
                </template>
                <template v-else-if="statsData.pendingEntries > 0">
                  <i class="fa-solid fa-triangle-exclamation text-red"></i>
                  <span class="stat-value text-red">{{ statsData.pendingEntries }} notas aguardando vínculo</span>
                </template>
                <template v-else>
                  <i class="fa-solid fa-check-circle emerald"></i>
                  <span class="stat-value emerald">Tudo atualizado</span>
                </template>
              </div>
            </div>

            <div class="hub-card" :class="{
              'alert-card': statsData.expiredCnh > 0 && canAccess('fleet'),
              'warning-card': statsData.expiredCnh === 0 && statsData.expiringCnh > 0 && canAccess('fleet'),
              'card-disabled': !canAccess('fleet')
            }" @click="goToFleet">
              <div class="card-glow"></div>

              <div class="icon-wrapper" :class="{
                'alert-icon': statsData.expiredCnh > 0 && canAccess('fleet'),
                'warning-icon': statsData.expiredCnh === 0 && statsData.expiringCnh > 0 && canAccess('fleet')
              }">
                <i class="fa-solid fa-car"></i>
                <template v-if="canAccess('fleet')">
                  <span v-if="statsData.expiredCnh > 0" class="notification-badge">{{ statsData.expiredCnh }}</span>
                  <span v-else-if="statsData.expiringCnh > 0" class="notification-badge warning-badge">{{
                    statsData.expiringCnh }}</span>
                </template>
              </div>

              <h2 class="card-title">Gestão de Frota</h2>
              <p class="card-description">
                Painel de controle dos veículos. Gerencie cadastros, visualize o histórico de saúde, manutenção e médias
                de consumo por placa.
              </p>

              <div class="card-stat" :class="{
                'alert-stat': statsData.expiredCnh > 0 && canAccess('fleet'),
                'warning-stat': statsData.expiredCnh === 0 && statsData.expiringCnh > 0 && canAccess('fleet')
              }">
                <template v-if="!canAccess('fleet')">
                  <span class="stat-label">Módulo de Frota</span>
                </template>
                <template v-else-if="statsData.expiredCnh > 0">
                  <i class="fa-solid fa-triangle-exclamation text-red"></i>
                  <span class="stat-value text-red">
                    {{ statsData.expiredCnh }} {{ statsData.expiredCnh > 1 ? 'CNHs vencidas' : 'CNH vencida' }}
                  </span>
                </template>
                <template v-else-if="statsData.expiringCnh > 0">
                  <i class="fa-solid fa-triangle-exclamation text-warning"></i>
                  <span class="stat-value text-warning">
                    {{ statsData.expiringCnh }} {{ statsData.expiringCnh > 1 ? 'CNHs vencem' : 'CNH vence' }} este mês
                  </span>
                </template>
                <template v-else>
                  <span class="stat-label">Frota Ativa:</span>
                  <span class="stat-value">{{ statsData.activeVehicles }} veículos cadastrados</span>
                </template>
              </div>
            </div>

          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import expensesService from '@/services/expensesService';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { EXPENSES_SUB_PERMISSIONS } from '@/utils/constants';

const router = useRouter();
const isLoading = ref(true);

const currentUserType = localStorage.getItem('userType');

const canAccess = (action) => {
  const permissions = EXPENSES_SUB_PERMISSIONS[currentUserType] || [];
  return permissions.includes(action);
};

const statsData = ref({
  totalMonthExpenses: 0,
  pendingEntries: 0,
  expiredCnh: 0,
  expiringCnh: 0,
  activeVehicles: 0
});

const loadStats = async () => {
  isLoading.value = true;
  try {
    const data = await expensesService.getStats();
    statsData.value = { ...statsData.value, ...data };
  } catch (error) {
    console.error("Falha ao carregar as estatísticas do hub:", error);
  } finally {
    isLoading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const goToData = () => {
  if (canAccess('data')) router.push('/expenses/data');
};

const goToBind = () => {
  if (canAccess('bind')) router.push('/expenses/bind');
};

const goToFleet = () => {
  if (canAccess('fleet')) router.push('/expenses/fleet');
};

onMounted(() => {
  loadStats();
});
</script>

<style src="@/views/Expenses/expenses.css" scoped></style>