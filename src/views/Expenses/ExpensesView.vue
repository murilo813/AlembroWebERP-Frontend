<template>
  <div class="gastos-container">
    <div class="gastos-wrapper">

      <header class="gastos-header">
        <div class="title-section">
          <h1 class="main-title">Módulo de Gastos</h1>
          <p class="subtitle">Análise e inserção de gastos, e gerenciamento de frota.</p>
        </div>
      </header>

      <main class="gastos-content">
        <Transition name="fade-slide" mode="out-in">

          <LoadingSpinner v-if="isLoading" key="loading" title="Carregando estatísticas..."
            subtitle="Calculando resumo de gastos" />

          <div v-else class="gastos-hub-grid" key="content">

            <div class="hub-card">
              <div class="card-glow"></div>
              <div class="icon-wrapper">
                <i class="fa-solid fa-chart-pie"></i>
              </div>
              <h2 class="card-title">Consulta de Gastos</h2>
              <p class="card-description">
                Visão gerencial de todos os gastos já inseridos. Com filtros avançados, acesse resumos mensais e
                relatórios consolidados.
              </p>
              <div class="card-stat">
                <span class="stat-label">Gasto no Mês:</span>
                <span class="stat-value emerald">{{ formatCurrency(statsData.totalMonthExpenses || 0) }}</span>
              </div>
            </div>

            <div class="hub-card" :class="{ 'alert-card': statsData.pendingEntries > 0 }" @click="irParaVinculo">
              <div class="card-glow"></div>
              <div class="icon-wrapper" :class="{ 'alert-icon': statsData.pendingEntries > 0 }">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                <span v-if="statsData.pendingEntries > 0" class="notification-badge">{{ statsData.pendingEntries
                }}</span>
              </div>
              <h2 class="card-title">Entradas Pendentes</h2>
              <p class="card-description">
                Fila de conciliação. Vincule placas, quilometragem, responsável e tipo de gasto às notas brutas
                importadas automaticamente.
              </p>
              <div class="card-stat" :class="{ 'alert-stat': statsData.pendingEntries > 0 }">
                <template v-if="statsData.pendingEntries > 0">
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
              'alert-card': statsData.expiredCnh > 0,
              'warning-card': statsData.expiredCnh === 0 && statsData.expiringCnh > 0
            }">
              <div class="card-glow"></div>

              <div class="icon-wrapper" :class="{
                'alert-icon': statsData.expiredCnh > 0,
                'warning-icon': statsData.expiredCnh === 0 && statsData.expiringCnh > 0
              }">
                <i class="fa-solid fa-car"></i>
                <span v-if="statsData.expiredCnh > 0" class="notification-badge">{{ statsData.expiredCnh }}</span>
                <span v-else-if="statsData.expiringCnh > 0" class="notification-badge warning-badge">{{
                  statsData.expiringCnh
                }}</span>
              </div>

              <h2 class="card-title">Gestão de Frota</h2>
              <p class="card-description">
                Painel de controle dos veículos. Gerencie cadastros, visualize o histórico de saúde, manutenção e médias
                de consumo
                por placa.
              </p>

              <div class="card-stat" :class="{
                'alert-stat': statsData.expiredCnh > 0,
                'warning-stat': statsData.expiredCnh === 0 && statsData.expiringCnh > 0
              }">

                <template v-if="statsData.expiredCnh > 0">
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

const router = useRouter();
const isLoading = ref(true);

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

const irParaVinculo = () => {
  router.push('/expenses/bind');
};

onMounted(() => {
  loadStats();
});
</script>

<style src="@/views/Expenses/expenses.css" scoped></style>