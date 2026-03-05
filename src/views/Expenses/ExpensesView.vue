<template>
  <div class="gastos-container">
    <div class="gastos-wrapper">

      <header class="gastos-header">
        <div class="title-section">
          <h1 class="main-title">Módulo de Gastos</h1>
          <p class="subtitle">Análise e inserção de gastos, e gerenciamento de frota.</p>
        </div>
      </header>

      <main class="gastos-hub-grid">
        
        <div class="hub-card">
          <div class="card-glow"></div>
          <div class="icon-wrapper">
            <i class="fa-solid fa-chart-pie"></i>
          </div>
          <h2 class="card-title">Consulta de Gastos</h2>
          <p class="card-description">
            Visão gerencial de todos os gastos já inseridos. Com filtros avançados, acesse resumos mensais e relatórios consolidados.
          </p>
          <div class="card-stat">
            <span class="stat-label">Gasto no Mês:</span>
            <span class="stat-value emerald">{{ formatCurrency(mockData.monthlySpent) }}</span>
          </div>
        </div>

        <div class="hub-card" :class="{ 'alert-card': mockData.pendingNotes > 0 }">
          <div class="card-glow"></div>
          <div class="icon-wrapper" :class="{ 'alert-icon': mockData.pendingNotes > 0 }">
            <i class="fa-solid fa-file-invoice-dollar"></i>
            <span v-if="mockData.pendingNotes > 0" class="notification-badge">{{ mockData.pendingNotes }}</span>
          </div>
          <h2 class="card-title">Entradas Pendentes</h2>
          <p class="card-description">
            Fila de conciliação. Vincule placas, quilometragem, responsável e tipo de gasto às notas brutas importadas automaticamente.
          </p>
          <div class="card-stat" :class="{ 'alert-stat': mockData.pendingNotes > 0 }">
            <template v-if="mockData.pendingNotes > 0">
              <i class="fa-solid fa-triangle-exclamation text-red"></i>
              <span class="stat-value text-red">{{ mockData.pendingNotes }} notas aguardando vínculo</span>
            </template>
            <template v-else>
              <i class="fa-solid fa-check-circle emerald"></i>
              <span class="stat-value emerald">Tudo atualizado</span>
            </template>
          </div>
        </div>

        <div class="hub-card" 
             :class="{ 
               'alert-card': mockData.cnhExpired > 0, 
               'warning-card': mockData.cnhExpired === 0 && mockData.cnhExpiringThisMonth > 0 
             }">
          <div class="card-glow"></div>
          
          <div class="icon-wrapper" 
               :class="{ 
                 'alert-icon': mockData.cnhExpired > 0, 
                 'warning-icon': mockData.cnhExpired === 0 && mockData.cnhExpiringThisMonth > 0 
               }">
            <i class="fa-solid fa-car"></i>
            <span v-if="mockData.cnhExpired > 0" class="notification-badge">{{ mockData.cnhExpired }}</span>
            <span v-else-if="mockData.cnhExpiringThisMonth > 0" class="notification-badge warning-badge">{{ mockData.cnhExpiringThisMonth }}</span>
          </div>
          
          <h2 class="card-title">Gestão de Frota</h2>
          <p class="card-description">
            Painel de controle dos veículos. Gerencie cadastros, visualize o histórico de saúde, manutenção e médias de consumo por placa.
          </p>
          
          <div class="card-stat" 
               :class="{ 
                 'alert-stat': mockData.cnhExpired > 0, 
                 'warning-stat': mockData.cnhExpired === 0 && mockData.cnhExpiringThisMonth > 0 
               }">
            
            <template v-if="mockData.cnhExpired > 0">
              <i class="fa-solid fa-triangle-exclamation text-red"></i>
              <span class="stat-value text-red">
                {{ mockData.cnhExpired }} {{ mockData.cnhExpired > 1 ? 'CNHs vencidas' : 'CNH vencida' }}
              </span>
            </template>

            <template v-else-if="mockData.cnhExpiringThisMonth > 0">
              <i class="fa-solid fa-triangle-exclamation text-warning"></i>
              <span class="stat-value text-warning">
                {{ mockData.cnhExpiringThisMonth }} {{ mockData.cnhExpiringThisMonth > 1 ? 'CNHs vencem' : 'CNH vence' }} este mês
              </span>
            </template>

            <template v-else>
              <span class="stat-label">Frota Ativa:</span>
              <span class="stat-value">{{ mockData.activeVehicles }} veículos cadastrados</span>
            </template>
            
          </div>
        </div>

      </main>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const mockData = ref({
  monthlySpent: 45230.50,
  pendingNotes: 1, 
  activeVehicles: 34,
  cnhExpiringThisMonth: 1, 
  cnhExpired: 0 
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};
</script>

<style src="@/views/Expenses/expenses.css" scoped></style>