<template>
  <transition name="fade-right" appear>
    <div class="stats-sidebar-card">
      <div class="stats-header">
        <div class="stats-icon-box orange">
          <i class="fa-solid fa-file-invoice-dollar"></i>
        </div>
        <h2 class="stats-title">Lançamentos</h2>
      </div>

      <div class="stats-content">
        <div class="stat-group active-orange">
          <span class="stat-num money-text" :style="{ fontSize: getFontSize(stats.today) }">
            {{ formatCurrency(stats.today) }}
          </span>
          <span class="stat-label-small">Gasto Hoje</span>
        </div>

        <div class="stat-group">
          <span class="stat-num money-text" :style="{ fontSize: getFontSize(stats.week) }">
            {{ formatCurrency(stats.week) }}
          </span>
          <span class="stat-label-small">Total na Semana</span>
        </div>

        <div class="stat-group">
          <span class="stat-num money-text" :style="{ fontSize: getFontSize(stats.month) }">
            {{ formatCurrency(stats.month) }}
          </span>
          <span class="stat-label-small">Total no Mês</span>
        </div>
      </div>

      <div class="stats-footer">
        <span class="pulse-light orange-pulse"></span>
        Setor de Gastos
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import statsService from '@/services/statsService';

const stats = ref({ today: 0, week: 0, month: 0 });
const userId = localStorage.getItem('userId');

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(value);
};

const getFontSize = (value) => {
  const text = formatCurrency(value);
  const length = text.length;

  if (length > 14) return '1.8rem';
  if (length > 11) return '2.2rem';
  if (length > 9) return '3.0rem';
  return '4rem';
};

const fetchStats = async () => {
  try {
    stats.value = await statsService.getExpensesStats(userId);
  } catch (e) {
    console.error("Erro ao buscar stats de gastos:", e);
  }
};

onMounted(() => {
  if (userId) fetchStats();
});
</script>

<style scoped>
@import "@/components/dashboard/expenses.css";
</style>