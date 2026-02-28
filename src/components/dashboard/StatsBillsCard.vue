<template>
  <transition name="fade-right" appear>
    <div class="stats-sidebar-card">
      <div class="stats-header">
        <div class="stats-icon-box">
          <i class="fa-solid fa-hand-holding-dollar"></i>
        </div>
        <h2 class="stats-title">Contas a Receber</h2>
      </div>

      <div class="stats-content">
        <div class="stat-group active">
          <span class="stat-num">{{ stats.today }}</span>
          <span class="stat-label-small">Vencem Hoje</span>
        </div>

        <div class="stat-group">
          <span class="stat-num">{{ stats.week }}</span>
          <span class="stat-label-small">Vencem Esta Semana</span>
        </div>

        <div class="stat-group">
          <span class="stat-num danger-text">{{ stats.expired }}</span>
          <span class="stat-label-small">Vencidas</span>
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
import api from '@/api/api';

const stats = ref({ today: 0, week: 0, expired: 0 });
const userId = localStorage.getItem('userId');

const fetchStats = async () => {
  try {
    const response = await api.get(`/stats/bills`, { params: { userId } });
    stats.value = response.data;
  } catch (e) {
    console.error("Erro ao carregar stats financeiro:", e);
  }
};

onMounted(() => {
  if (userId) fetchStats();
});
</script>

<style src="@/components/dashboard/bills.css" scoped></style>