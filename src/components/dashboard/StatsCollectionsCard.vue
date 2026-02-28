<template>
  <transition name="fade-left" appear>
    <div class="stats-sidebar-card">
      <div class="stats-header">
        <div class="stats-icon-box">
          <i class="fa-solid fa-chart-line"></i>
        </div>
        <h2 class="stats-title">Atendimentos</h2>
      </div>

      <div class="stats-content">
        <div class="stat-group active">
          <span class="stat-num">{{ stats.today }}</span>
          <span class="stat-label-small">Hoje</span>
        </div>
        <div class="stat-group">
          <span class="stat-num">{{ stats.week }}</span>
          <span class="stat-label-small">Esta Semana</span>
        </div>
        <div class="stat-group">
          <span class="stat-num">{{ stats.month }}</span>
          <span class="stat-label-small">Este Mês</span>
        </div>
      </div>

      <div class="stats-footer">
        <span class="pulse-light"></span>
        Setor Financeiro
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import statsService from '@/services/statsService';

const stats = ref({ today: 0, week: 0, month: 0 });
const userId = localStorage.getItem('userId');

const fetchStats = async () => {
  try {
    stats.value = await statsService.getCollectionsStats(userId);
  } catch (e) {
    console.error("Erro ao carregar stats de atendimentos:", e);
  }
};

onMounted(() => {
  if (userId) fetchStats();
});
</script>

<style src="@/components/dashboard/collections.css" scoped></style>