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
              <tr v-for="c in formattedClients" :key="c.id">
                <td class="col-name text-left fw-bold">{{ c.name }}</td>
                <td class="text-right">{{ c.formattedLimitBm }}</td>
                <td class="text-right" :class="{ 'text-red': c.isBalanceBmNegative }">{{ c.formattedBalanceBm }}</td>
                <td class="text-right">{{ c.formattedLimitCalc }}</td>
                <td class="text-right" :class="{ 'text-red': c.isBalanceCalcNegative }">{{ c.formattedBalanceCalc }}</td>
                <td class="text-center">{{ c.maxDelay }}d</td>
                <td class="text-center">{{ c.formattedPctDelay90 }}</td>
                <td class="text-center">{{ c.avgDelay }}d</td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="modal-footer">
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Total Lim. BM</span>
            <span class="modal-total-value">{{ formattedGroup.formattedTotalLimitBm }}</span>
          </div>
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Total Sld. BM</span>
            <span class="modal-total-value"
              :class="{ 'emerald': formattedGroup.isTotalBalanceBmPositive, 'text-red': formattedGroup.isTotalBalanceBmNegative }">
              {{ formattedGroup.formattedTotalBalanceBm }}
            </span>
          </div>
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Total Lim. Calc.</span>
            <span class="modal-total-value">{{ formattedGroup.formattedTotalLimitCalc }}</span>
          </div>
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Total Sld. Calc.</span>
            <span class="modal-total-value"
              :class="{ 'emerald': formattedGroup.isTotalBalanceCalcPositive, 'text-red': formattedGroup.isTotalBalanceCalcNegative }">
              {{ formattedGroup.formattedTotalBalanceCalc }}
            </span>
          </div>
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Maior Atraso<br><small>(Grupo)</small></span>
            <span class="modal-total-value">{{ formattedGroup.groupMaxDelay }}d</span>
          </div>
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Média 90 Dias<br><small>(Grupo)</small></span>
            <span class="modal-total-value">{{ formattedGroup.formattedGroupAvgPct90 }}</span>
          </div>
          <div class="modal-total-item text-center">
            <span class="modal-total-label">Média Geral<br><small>(Grupo)</small></span>
            <span class="modal-total-value">{{ formattedGroup.groupAvgDelay }}d</span>
          </div>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  groupInfo: Object,
  clients: Array
});

defineEmits(['close']);

// 1. Instanciamos o formatador pesado UMA VEZ FORA de tudo
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return 'R$ 0,00';
  return currencyFormatter.format(num);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${(parseFloat(value) * 100).toFixed(1)}%`;
};

// 2. Computed para mapear os Clientes (só roda quando as props.clients mudam)
const formattedClients = computed(() => {
  if (!props.clients) return [];
  
  return props.clients.map(c => ({
    ...c,
    formattedLimitBm: formatCurrency(c.limitBm),
    formattedBalanceBm: formatCurrency(c.balanceBm),
    formattedLimitCalc: formatCurrency(c.limitCalc),
    formattedBalanceCalc: formatCurrency(c.balanceCalc),
    formattedPctDelay90: formatPercent(c.pctDelay90),
    isBalanceBmNegative: Number(c.balanceBm) < 0,
    isBalanceCalcNegative: Number(c.balanceCalc) < 0
  }));
});

// 3. Computed para mapear o Footer (só roda quando as props.groupInfo mudam)
const formattedGroup = computed(() => {
  if (!props.groupInfo) return {};
  
  const info = props.groupInfo;
  return {
    ...info,
    formattedTotalLimitBm: formatCurrency(info.totalLimitBm),
    formattedTotalBalanceBm: formatCurrency(info.totalBalanceBm),
    formattedTotalLimitCalc: formatCurrency(info.totalLimitCalc),
    formattedTotalBalanceCalc: formatCurrency(info.totalBalanceCalc),
    formattedGroupAvgPct90: formatPercent(info.groupAvgPct90),
    isTotalBalanceBmPositive: Number(info.totalBalanceBm) > 0,
    isTotalBalanceBmNegative: Number(info.totalBalanceBm) < 0,
    isTotalBalanceCalcPositive: Number(info.totalBalanceCalc) > 0,
    isTotalBalanceCalcNegative: Number(info.totalBalanceCalc) < 0,
  };
});
</script>

<style src="@/views/Finance/finance.css" scoped></style>