<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <header class="modal-header">
          <div class="modal-header-info">
            <h2 class="modal-title">Limites e Saldos</h2>
            <div class="subtitle-row">
              <p class="modal-subtitle">Visão consolidada do grupo: {{ groupInfo?.responsible }}</p>
              <span class="modal-calc-note">Cálculo de Limite e Saldo Calculado: (Total de Vendas - Total de Devoluções)
                * 0.3</span>
            </div>
          </div>
          <button class="modal-close-btn" @click="$emit('close')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="modal-body">
          <table class="alembro-table modal-table">
            <thead>
              <tr>
                <th class="col-name text-left">Cliente</th>
                <th class="col-money text-right">Limite BM</th>
                <th class="col-money text-right">Saldo BM</th>
                <th class="col-money text-right">Lim. Calc.</th>
                <th class="col-money text-right">Sld. Calc.</th>
                <th class="col-center" style="width: 10rem;">Maior Atraso</th>
                <th class="col-center" style="width: 12rem;">Atraso 90 Dias</th>
                <th class="col-center" style="width: 12rem;">Média Atraso</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in clients" :key="c.id">
                <td class="col-name text-left fw-bold">{{ c.name }}</td>
                <td class="text-right">{{ formatCurrency(c.limitBm) }}</td>
                <td class="text-right" :class="{ 'text-red': c.balanceBm < 0 }">{{ formatCurrency(c.balanceBm) }}</td>
                <td class="text-right">{{ formatCurrency(c.limitCalc) }}</td>
                <td class="text-right" :class="{ 'text-red': c.balanceCalc < 0 }">{{ formatCurrency(c.balanceCalc) }}
                </td>
                <td class="text-center">{{ c.maxDelay }}d</td>
                <td class="text-center">{{ formatPercent(c.pctDelay90) }}</td>
                <td class="text-center">{{ c.avgDelay }}d</td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="modal-footer">
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Total Lim. BM</span>
            <span class="modal-total-value">{{ formatCurrency(groupInfo?.totalLimitBm) }}</span>
          </div>
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Total Sld. BM</span>
            <span class="modal-total-value"
              :class="{ 'emerald': groupInfo?.totalBalanceBm > 0, 'text-red': groupInfo?.totalBalanceBm < 0 }">
              {{ formatCurrency(groupInfo?.totalBalanceBm) }}
            </span>
          </div>
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Total Lim. Calc.</span>
            <span class="modal-total-value">{{ formatCurrency(groupInfo?.totalLimitCalc) }}</span>
          </div>
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Total Sld. Calc.</span>
            <span class="modal-total-value"
              :class="{ 'emerald': groupInfo?.totalBalanceCalc > 0, 'text-red': groupInfo?.totalBalanceCalc < 0 }">
              {{ formatCurrency(groupInfo?.totalBalanceCalc) }}
            </span>
          </div>
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Maior Atraso<br><small>(Grupo)</small></span>
            <span class="modal-total-value">{{ groupInfo?.groupMaxDelay }}d</span>
          </div>
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Média 90 Dias<br><small>(Grupo)</small></span>
            <span class="modal-total-value">{{ formatPercent(groupInfo?.groupAvgPct90) }}</span>
          </div>
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Média Geral<br><small>(Grupo)</small></span>
            <span class="modal-total-value">{{ groupInfo?.groupAvgDelay }}d</span>
          </div>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  groupInfo: Object,
  clients: Array
});

defineEmits(['close']);

const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};
const formatPercent = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${(parseFloat(value) * 100).toFixed(1)}%`;
};
</script>

<style src="@/views/Finance/finance.css" scoped></style>