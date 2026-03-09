<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        
        <header class="modal-header">
          <div class="modal-header-info">
            <h2 class="modal-title">Detalhes da Entrada <span class="emerald">#{{ formattedData.entryId }}</span></h2>
            <div class="subtitle-row">
              <p class="modal-subtitle">Fornecedor: <span style="color: #f8fafc;">{{ formattedData.provider }}</span></p>
              <span class="modal-calc-note" v-if="formattedData.plate">
                Vinculado à placa: <strong class="emerald">{{ formattedData.plate }}</strong>
              </span>
            </div>
          </div>
          <button class="modal-close-btn" @click="$emit('close')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="modal-body modal-details-body">
          
          <div class="details-section">
            <div class="details-grid">
              <div class="detail-box">
                <span class="detail-label">Vinculado por</span>
                <span class="detail-value"><i class="fa-regular fa-user" style="color: #64748b; margin-right: 0.5rem;"></i> {{ formattedData.linkedBy }}</span>
              </div>
              <div class="detail-box">
                <span class="detail-label">Data do Vínculo</span>
                <span class="detail-value"><i class="fa-regular fa-calendar" style="color: #64748b; margin-right: 0.5rem;"></i> {{ formattedData.linkedDate }}</span>
              </div>
              <div class="detail-box obs-box" style="grid-column: span 2;">
                <span class="detail-label">Observações de Vínculo</span>
                <span class="detail-value text-muted" v-if="!formattedData.observation">Nenhuma observação registrada.</span>
                <span class="detail-value" v-else>{{ formattedData.observation }}</span>
              </div>
            </div>
          </div>

          <div class="details-section">
            <h3 class="section-title">Resumo Financeiro da Nota</h3>
            <div class="financial-summary-grid">
              
              <div class="fin-item">
                <span class="fin-label">Total Produtos</span>
                <span class="fin-value">{{ formattedData.totals.products }}</span>
              </div>
              <div class="fin-item">
                <span class="fin-label">Total Serviços</span>
                <span class="fin-value">{{ formattedData.totals.services }}</span>
              </div>
              <div class="fin-item">
                <span class="fin-label text-red">Descontos (-)</span>
                <span class="fin-value text-red">{{ formattedData.totals.discount }}</span>
              </div>
              <div class="fin-item">
                <span class="fin-label">Acréscimos (+)</span>
                <span class="fin-value">{{ formattedData.totals.addition }}</span>
              </div>
              <div class="fin-item">
                <span class="fin-label">Frete (+)</span>
                <span class="fin-value">{{ formattedData.totals.freight }}</span>
              </div>
              <div class="fin-item">
                <span class="fin-label">Seguro (+)</span>
                <span class="fin-value">{{ formattedData.totals.insurance }}</span>
              </div>
              
              <div class="fin-item total-highlight">
                <span class="fin-label" style="color: #10b981;">Valor Total da Nota</span>
                <span class="fin-value" style="font-size: 2.8rem; color: #10b981;">{{ formattedData.totals.grandTotal }}</span>
              </div>

            </div>
          </div>

          <div class="details-section" style="border-bottom: none; margin-bottom: 0;">
            <h3 class="section-title">Itens da Nota</h3>
            
            <div class="table-responsive">
              <table class="alembro-table small-text">
                <thead>
                  <tr>
                    <th class="text-center" style="width: 8rem;">ID</th>
                    <th class="text-left">Descrição do Item</th>
                    <th class="text-center" style="width: 6rem;">Unid.</th>
                    <th class="text-center" style="width: 8rem;">Qtd.</th>
                    <th class="text-right" style="width: 12rem;">Custo Unit.</th>
                    <th class="text-right" style="width: 10rem;">Acrés. (+)</th>
                    <th class="text-right" style="width: 10rem;">Desc. (-)</th>
                    <th class="text-right" style="width: 14rem;">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in formattedData.items" :key="item.id">
                    <td class="text-center" style="color: #64748b;">{{ item.id }}</td>
                    <td class="text-left fw-bold">{{ item.name }}</td>
                    <td class="text-center">{{ item.unit }}</td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-right">{{ item.formattedUnitCost }}</td>
                    <td class="text-right">{{ item.formattedAddition }}</td>
                    <td class="text-right text-red">{{ item.formattedDiscount }}</td>
                    <td class="text-right fw-bold emerald">{{ item.formattedTotal }}</td>
                  </tr>
                  <tr v-if="!formattedData.items || formattedData.items.length === 0">
                    <td colspan="8" class="text-center empty-data" style="padding: 3rem;">Nenhum item registrado para esta nota.</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>

        <footer class="modal-footer flex-end">
          <button class="btn-secondary" @click="$emit('close')">Fechar</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  expenseData: {
    type: Object,
    default: () => ({
      entryId: '10502',
      provider: 'POSTO IPIRANGA LTDA',
      plate: 'ABC-1234',
      linkedBy: 'João da Silva',
      linkedDate: '15/10/2023',
      observation: 'Abastecimento extra devido a rota desviada e troca de óleo não planejada.',
      totals: {
        products: 2450.00,
        services: 150.00,
        discount: 50.00,
        addition: 0,
        freight: 0,
        insurance: 0,
        grandTotal: 2550.00
      },
      items: [
        { id: '001', name: 'Óleo Diesel S10', unit: 'LT', quantity: 400, unitCost: 6.12, addition: 0, discount: 48.00, totalValue: 2400.00 },
        { id: '002', name: 'Arla 32', unit: 'LT', quantity: 20, unitCost: 2.50, addition: 0, discount: 2.00, totalValue: 48.00 },
        { id: '003', name: 'Filtro de Óleo', unit: 'UN', quantity: 1, unitCost: 102.00, addition: 0, discount: 0, totalValue: 102.00 }
      ]
    })
  }
});

defineEmits(['close']);

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatCurrency = (val) => {
  const num = Number(val);
  return isNaN(num) ? 'R$ 0,00' : currencyFormatter.format(num);
};

const formattedData = computed(() => {
  const data = props.expenseData || {};
  const rawTotals = data.totals || {};
  
  return {
    entryId: data.entryId || '---',
    provider: data.provider || 'Fornecedor não informado',
    plate: data.plate || '',
    linkedBy: data.linkedBy || 'Usuário Desconhecido',
    linkedDate: data.linkedDate || '--/--/----',
    observation: data.observation || '',
    
    totals: {
      products: formatCurrency(rawTotals.products),
      services: formatCurrency(rawTotals.services),
      discount: formatCurrency(rawTotals.discount),
      addition: formatCurrency(rawTotals.addition),
      freight: formatCurrency(rawTotals.freight),
      insurance: formatCurrency(rawTotals.insurance),
      grandTotal: formatCurrency(rawTotals.grandTotal),
    },
    
    items: (data.items || []).map(item => ({
      ...item,
      formattedUnitCost: formatCurrency(item.unitCost),
      formattedAddition: formatCurrency(item.addition),
      formattedDiscount: formatCurrency(item.discount),
      formattedTotal: formatCurrency(item.totalValue)
    }))
  };
});
</script>
<style src="@/views/Expenses/expenses.css"></style>