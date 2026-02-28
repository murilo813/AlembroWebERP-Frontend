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
          <span class="stat-num">{{ stats.today }}</span>
          <span class="stat-label-small">Notas Hoje</span>
        </div>

        <div class="stat-group">
          <span class="stat-num money-text">{{ formatCurrency(stats.week) }}</span>
          <span class="stat-label-small">Total na Semana</span>
        </div>

        <div class="stat-group">
          <span class="stat-num">{{ stats.month }}</span>
          <span class="stat-label-small">Notas no Mês</span>
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
import api from '@/api/api';

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

const fetchStats = async () => {
  try {
    const response = await api.get(`/stats/expenses`, { params: { userId } });
    stats.value = response.data;
  } catch (e) {
    console.error("Erro ao buscar stats de gastos:", e);
  }
};

onMounted(() => {
  if (userId) fetchStats();
});
</script>

<style src="@/components/dashboard/expenses.css" scoped></style>