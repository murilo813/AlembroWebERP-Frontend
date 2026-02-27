<template>
  <div class="home-container">
    <div class="dashboard-box">
      
      <component 
        v-if="activeCards && activeCards[0]"
        :is="getComponent(activeCards[0])" 
      />
      <div v-else class="placeholder-sidebar"></div>

      <div class="welcome-section">
        <transition name="fade-up" appear>
          <div class="glass-card">
            <div class="status-badge">Agropecuária Zecão</div>
            <h1 class="welcome-text">
              Bem-vindo(a), <span class="user-highlight">{{ nomenclature }}</span>
            </h1>
            <div class="divider"></div>
            <p class="system-brand">Alembro Web ERP</p>

            <div class="quick-stats">
              <div class="stat-item">
                <span class="stat-label">Empresa</span>
                <span class="stat-value">{{ companyName }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Status</span>
                <span class="stat-value emerald">{{ userType }}</span>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <component 
        v-if="activeCards && activeCards[1]"
        :is="getComponent(activeCards[1])" 
      />
      <div v-else class="placeholder-sidebar"></div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { COMPANIES, USER_TYPES, DASHBOARD_CARDS } from '@/utils/constants';

import StatsCollectionsCard from '@/components/dashboard/StatsCollectionsCard.vue';
import StatsExpensesCard from '@/components/dashboard/StatsExpensesCard.vue';
import StatsBillsCard from '@/components/dashboard/StatsBillsCard.vue';

const companyId = localStorage.getItem('companyId');
const companyName = ref(COMPANIES[Number(companyId)] || 'Indefinido');
const nomenclature = ref(localStorage.getItem('nomenclature') || 'Usuário');
const roleKey = localStorage.getItem('userType');
const userType = USER_TYPES[roleKey] || 'Indefinido';
const activeCards = computed(() => DASHBOARD_CARDS[roleKey] || []);

const getComponent = (cardName) => {
  const map = {
    collections: StatsCollectionsCard,
    expenses: StatsExpensesCard,
    bills: StatsBillsCard
  };
  return map[cardName];
};
</script>

<style src="./home.css" scoped></style>