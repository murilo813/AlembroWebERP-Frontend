<template>
  <div class="client-dashboard-wrapper">
    <div v-if="isFetchingClient" class="empty-search-state">
      <i class="fa-solid fa-circle-notch fa-spin empty-icon" style="color: #10b981; opacity: 1;"></i>
      <h2 style="color: #10b981;">Montando painel do grupo...</h2>
    </div>

    <div v-else class="client-dashboard">
      <div class="dashboard-top-row">
        
        <div class="panel-card client-info-card">
          <div class="card-header-flex">
            <h3 class="panel-title">Painel do Grupo</h3>
            <button class="btn-icon-green" title="Ver Limites e Saldos" @click="showLimitsModal = true">
              <i class="fa-solid fa-chart-pie"></i>
            </button>
          </div>
          <div class="client-details">
            <div class="client-list-header">
              <span class="detail-label col-left">Nome do Cliente</span>
              <span class="detail-label col-right">Responsável</span>
              <span class="detail-label col-date">Última Venda</span>
            </div>

            <div class="client-list-item" v-for="c in activeGroupClients" :key="c.id">
              <span class="list-name">{{ c.name }}</span>
              <span class="list-group">{{ activeGroupInfo?.responsible }}</span>
              <span class="list-date">
                <template v-if="c.lastSale">{{ formatDate(c.lastSale) }}</template>
                <template v-else><span class="empty-data">Sem vendas</span></template>
              </span>
            </div>
          </div>
        </div>

        <div class="panel-card interactions-card">
          <div class="card-header-flex">
            <h3 class="panel-title">Atendimentos</h3>
            <button class="btn-icon-green" title="Novo Atendimento" @click="showNewCollectionModal = true">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          <div class="timeline">
            <template v-if="interactions.length > 0">
              <div class="timeline-item" v-for="atd in interactions" :key="atd.id">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <span class="timeline-date">{{ formatDate(atd.date) }} - {{ atd.userName }}</span>
                  <p class="timeline-obs">{{ atd.content }}</p>
                  <span class="timeline-client">Ref: {{ atd.clientName }}</span>
                </div>
              </div>
            </template>
            <div v-else class="timeline-empty">
              <i class="fa-solid fa-comment-slash"></i>
              <p>Nenhum atendimento registrado para este grupo.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="financial-lists">
        
        <div class="accordion-item" :class="{ 'open': activeAccordion === 'contracts' }">
          <div class="accordion-header" @click="toggleAccordion('contracts')">
            <h4 class="accordion-title">
              <i class="fa-solid fa-file-signature" style="margin-right: 1rem;"></i> Contratos em Aberto
            </h4>
            <div class="accordion-right">
              <span class="list-total">{{ formatCurrency(totalContracts) }}</span>
              <i class="fa-solid fa-chevron-down toggle-icon"></i>
            </div>
          </div>
          <div class="accordion-body-wrapper">
            <div class="accordion-body">
              <table class="alembro-table small-text">
                <thead>
                  <tr>
                    <th class="col-doc-short text-center">Tipo</th>
                    <th class="col-doc-short text-left">Nome</th>
                    <th class="col-date text-center">Geração</th>
                    <th class="col-date text-center">Vencimento</th>
                    <th class="col-money text-center">Valor Original</th>
                    <th class="col-money text-center">À Receber</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="contrato in contracts" :key="contrato.id || Math.random()">
                    <td class="text-center">{{ contrato.contractType }}</td>
                    <td class="text-left">{{ contrato.clientName }}</td>
                    <td class="text-center">{{ formatDate(contrato.generationDate) }}</td>
                    <td class="text-center" :class="{ 'text-red fw-bold': isOverdue(contrato.dueDate) }">
                      {{ formatDate(contrato.dueDate) }}
                    </td>
                    <td class="text-center">{{ formatCurrency(contrato.originalValue) }}</td>
                    <td class="fw-bold text-center">{{ formatCurrency(contrato.balanceDue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="accordion-item" :class="{ 'open': activeAccordion === 'checks' }">
          <div class="accordion-header" @click="toggleAccordion('checks')">
            <h4 class="accordion-title">
              <i class="fa-solid fa-money-check-dollar" style="margin-right: 1rem;"></i> Cheques em Aberto
            </h4>
            <div class="accordion-right">
              <span class="list-total">{{ formatCurrency(totalChecks) }}</span>
              <i class="fa-solid fa-chevron-down toggle-icon"></i>
            </div>
          </div>
          <div class="accordion-body-wrapper">
            <div class="accordion-body">
              <table class="alembro-table small-text">
                <thead>
                  <tr>
                    <th class="col-mini text-center">Emp.</th>
                    <th class="col-name text-left">Nome</th>
                    <th class="col-doc-short text-center">Doc</th>
                    <th class="col-name">Correntista</th>
                    <th class="col-date text-center">Recebimento</th>
                    <th class="col-date text-center">Bom Para</th>
                    <th class="col-money text-center">Valor</th>
                    <th class="col-money text-center">À Receber</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cheque in checks" :key="cheque.document">
                    <td class="text-center">{{ cheque.companyId }}</td>
                    <td class="text-left">{{ cheque.clientName }}</td>
                    <td class="text-center">{{ cheque.document }}</td>
                    <td>{{ cheque.accountHolder }}</td>
                    <td class="text-center">{{ formatDate(cheque.receiptDate) }}</td>
                    <td class="text-center" :class="{ 'text-red fw-bold': isOverdue(cheque.goodForDate) }">
                      {{ formatDate(cheque.goodForDate) }}
                    </td>
                    <td class="text-center">{{ formatCurrency(cheque.originalValue) }}</td>
                    <td class="fw-bold text-center">{{ formatCurrency(cheque.balanceDue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="accordion-item" :class="{ 'open': activeAccordion === 'bills' }">
          <div class="accordion-header" @click="toggleAccordion('bills')">
            <h4 class="accordion-title">
              <i class="fa-solid fa-file-invoice-dollar" style="margin-right: 1rem;"></i> Notas em Aberto
            </h4>
            <div class="accordion-right">
              <span class="list-total">{{ formatCurrency(totalBills) }}</span>
              <i class="fa-solid fa-chevron-down toggle-icon"></i>
            </div>
          </div>
          <div class="accordion-body-wrapper">
            <div class="accordion-body">
              <table class="alembro-table small-text">
                <thead>
                  <tr>
                    <th class="col-mini text-center">Emp.</th>
                    <th class="col-name text-left">Nome</th>
                    <th class="col-doc-short text-center">NFe</th>
                    <th class="col-mini text-center">Parc.</th>
                    <th class="col-date text-center">Geração</th>
                    <th class="col-date text-center">Vencimento</th>
                    <th class="col-money text-center">Valor</th>
                    <th class="col-money text-center">À Receber</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="nota in bills" :key="nota.nf + '-' + nota.installment">
                    <td class="text-center">{{ nota.companyId }}</td>
                    <td class="text-left">{{ nota.clientName }}</td>
                    <td class="text-center">{{ nota.nf }}</td>
                    <td class="text-center">{{ nota.installment }}</td>
                    <td class="text-center">{{ formatDate(nota.saleDate) }}</td>
                    <td class="text-center" :class="{ 'text-red fw-bold': isOverdue(nota.dueDate) }">
                      {{ formatDate(nota.dueDate) }}
                    </td>
                    <td class="text-center">{{ formatCurrency(nota.originalValue) }}</td>
                    <td class="fw-bold text-center" :class="Number(nota.balanceDue) < 0 ? 'emerald' : ''">
                      {{ formatCurrency(nota.balanceDue) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <div class="bottom-spacer"></div>

      <div class="sticky-total-bar">
        <div class="sticky-total-content">
          <div class="gt-info">
            <p class="gt-label">Total a Receber do Grupo</p>
          </div>
          <h2 class="gt-value">{{ formatCurrency(grandTotalReceivable) }}</h2>
        </div>
      </div>

    </div>

    <LimitsModal 
      :show="showLimitsModal" 
      :groupInfo="activeGroupInfo" 
      :clients="activeGroupClients" 
      @close="showLimitsModal = false" 
    />
    
    <CollectionModal 
      :show="showNewCollectionModal" 
      :groupInfo="activeGroupInfo" 
      :clients="activeGroupClients" 
      @close="showNewCollectionModal = false" 
      @saved="addInteractionToTimeline" 
    />

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import financeService from '@/services/financeService';
import { useToast } from '@/utils/toast';
import LimitsModal from '@/views/Finance/LimitsModal.vue';
import CollectionModal from '@/views/Finance/CollectionModal.vue';

const props = defineProps({
  client: { type: Object, required: true }
});

const { showToast } = useToast();

const isFetchingClient = ref(true);
const activeGroupInfo = ref(null);
const activeGroupClients = ref([]);
const interactions = ref([]);
const contracts = ref([]);
const checks = ref([]);
const bills = ref([]);

const totalContracts = ref(0);
const totalChecks = ref(0);
const totalBills = ref(0);
const grandTotalReceivable = ref(0);

const showLimitsModal = ref(false);
const showNewCollectionModal = ref(false);
const activeAccordion = ref('');

const fetchDashboardData = async () => {
  if (!props.client?.id) return;
  
  isFetchingClient.value = true;
  try {
    const groupData = await financeService.getClientData(props.client.id);

    activeGroupInfo.value = groupData.groupInfo;
    activeGroupClients.value = groupData.clients;
    interactions.value = groupData.interactions;
    contracts.value = groupData.contracts;
    checks.value = groupData.checks;
    bills.value = groupData.bills;

    totalContracts.value = groupData.totalContracts;
    totalChecks.value = groupData.totalChecks;
    totalBills.value = groupData.totalBills;
    grandTotalReceivable.value = groupData.totalReceivable;

  } catch (error) {
    showToast("Erro ao carregar dados do grupo. Verifique sua conexão.", "error");
    console.error(error);
  } finally {
    isFetchingClient.value = false;
  }
};

onMounted(() => fetchDashboardData());
watch(() => props.client.id, () => fetchDashboardData());

const toggleAccordion = (section) => {
  activeAccordion.value = activeAccordion.value === section ? null : section;
};

const addInteractionToTimeline = (newInteraction) => {
  interactions.value.unshift(newInteraction);
};

// formatadores
const isOverdue = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};
const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};
const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};
</script>

<style src="@/views/Finance/finance.css" scoped></style>