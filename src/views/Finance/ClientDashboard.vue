<template>
  <div class="client-dashboard-wrapper">
    <LoadingSpinner v-if="isFetchingClient" title="Montando painel do grupo..." subtitle="" />

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

            <div class="client-list-item" v-for="c in activeGroupClients" :key="c.safeKey">
              <span class="list-name">{{ c.name }}</span>
              <span class="list-group">{{ activeGroupInfo?.responsible }}</span>
              <span class="list-date">
                <template v-if="c.formattedLastSale">{{ c.formattedLastSale }}</template>
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
              <div class="timeline-item" v-for="atd in interactions" :key="atd.safeKey">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <span class="timeline-date">{{ atd.formattedDate }} - {{ atd.userName }}</span>
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
              <span class="list-total">{{ totalContractsFormatted }}</span>
              <i class="fa-solid fa-chevron-down toggle-icon"></i>
            </div>
          </div>
          <div class="accordion-body-wrapper">
            <div class="accordion-body">
              <template v-if="contracts.length > 0">
                <div class="table-responsive">
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
                      <tr v-for="contrato in contracts" :key="contrato.safeKey">
                        <td class="text-center">{{ contrato.contractType }}</td>
                        <td class="text-left">{{ contrato.clientName }}</td>
                        <td class="text-center">{{ contrato.formattedGeneration }}</td>
                        <td class="text-center" :class="{ 'text-red fw-bold': contrato.isLate }">
                          {{ contrato.formattedDueDate }}
                        </td>
                        <td class="text-center">{{ contrato.formattedOriginal }}</td>
                        <td class="fw-bold text-center">{{ contrato.formattedBalance }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <div v-else class="empty-data-message">
                <i class="fa-solid fa-file-circle-xmark"></i>
                <span>sem contas para esse grupo</span>
              </div>
            </div>
          </div>
        </div>

        <div class="accordion-item" :class="{ 'open': activeAccordion === 'checks' }">
          <div class="accordion-header" @click="toggleAccordion('checks')">
            <h4 class="accordion-title">
              <i class="fa-solid fa-money-check-dollar" style="margin-right: 1rem;"></i> Cheques em Aberto
            </h4>
            <div class="accordion-right">
              <span class="list-total">{{ totalChecksFormatted }}</span>
              <i class="fa-solid fa-chevron-down toggle-icon"></i>
            </div>
          </div>
          <div class="accordion-body-wrapper">
            <div class="accordion-body">
              <template v-if="checks.length > 0">
                <div class="table-responsive">
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
                      <tr v-for="cheque in checks" :key="cheque.safeKey">
                        <td class="text-center">{{ cheque.companyId }}</td>
                        <td class="text-left">{{ cheque.clientName }}</td>
                        <td class="text-center">{{ cheque.document }}</td>
                        <td>{{ cheque.accountHolder }}</td>
                        <td class="text-center">{{ cheque.formattedReceipt }}</td>
                        <td class="text-center" :class="{ 'text-red fw-bold': cheque.isLate }">
                          {{ cheque.formattedGoodFor }}
                        </td>
                        <td class="text-center">{{ cheque.formattedOriginal }}</td>
                        <td class="fw-bold text-center">{{ cheque.formattedBalance }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <div v-else class="empty-data-message">
                <i class="fa-solid fa-money-check"></i>
                <span>sem contas para esse grupo</span>
              </div>
            </div>
          </div>
        </div>

        <div class="accordion-item" :class="{ 'open': activeAccordion === 'bills' }">
          <div class="accordion-header" @click="toggleAccordion('bills')">
            <h4 class="accordion-title">
              <i class="fa-solid fa-file-invoice-dollar" style="margin-right: 1rem;"></i> Notas em Aberto
            </h4>
            <div class="accordion-right">
              <span class="list-total">{{ totalBillsFormatted }}</span>
              <i class="fa-solid fa-chevron-down toggle-icon"></i>
            </div>
          </div>
          <div class="accordion-body-wrapper">
            <div class="accordion-body">
              <template v-if="bills.length > 0">
                <div class="table-responsive">
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
                      <tr v-for="nota in bills" :key="nota.safeKey">
                        <td class="text-center">{{ nota.companyId }}</td>
                        <td class="text-left">{{ nota.clientName }}</td>
                        <td class="text-center">{{ nota.nf }}</td>
                        <td class="text-center">{{ nota.installment }}</td>
                        <td class="text-center">{{ nota.formattedSaleDate }}</td>
                        <td class="text-center" :class="{ 'text-red fw-bold': nota.isLate }">
                          {{ nota.formattedDueDate }}
                        </td>
                        <td class="text-center">{{ nota.formattedOriginal }}</td>
                        <td class="fw-bold text-center" :class="{ 'emerald': nota.isCredit }">
                          {{ nota.formattedBalance }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <div v-else class="empty-data-message">
                <i class="fa-solid fa-file-invoice"></i>
                <span>sem contas para esse grupo</span>
              </div>
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
          <h2 class="gt-value">{{ grandTotalReceivableFormatted }}</h2>
        </div>
      </div>

    </div>

    <LimitsModal :show="showLimitsModal" :groupInfo="activeGroupInfo" :clients="activeGroupClients"
      @close="showLimitsModal = false" />

    <CollectionModal :show="showNewCollectionModal" :groupInfo="activeGroupInfo" :clients="activeGroupClients"
      @close="showNewCollectionModal = false" @saved="addInteractionToTimeline" />

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import financeService from '@/services/financeService';
import { useToast } from '@/utils/toast';
import LimitsModal from '@/views/Finance/LimitsModal.vue';
import CollectionModal from '@/views/Finance/CollectionModal.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const props = defineProps({
  client: { type: Object, required: true }
});

const { showToast } = useToast();

const isFetchingClient = ref(true);
const activeGroupInfo = ref(null);

// Arrays que receberão os dados pré-processados
const activeGroupClients = ref([]);
const interactions = ref([]);
const contracts = ref([]);
const checks = ref([]);
const bills = ref([]);

// Strings formatadas para os totais
const totalContractsFormatted = ref('R$ 0,00');
const totalChecksFormatted = ref('R$ 0,00');
const totalBillsFormatted = ref('R$ 0,00');
const grandTotalReceivableFormatted = ref('R$ 0,00');

const showLimitsModal = ref(false);
const showNewCollectionModal = ref(false);
const activeAccordion = ref('');

// =================================================================
// PREVENÇÃO DE LENTIDÃO: FUNÇÕES FORA DO LOOP
// O Intl.NumberFormat pesa DEMAIS se criado a cada linha da tabela.
// Criamos UMA vez só e usamos a referência dele.
// =================================================================
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return 'R$ 0,00';
  return currencyFormatter.format(num);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const isOverdue = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

// =================================================================
// BUSCA E PRÉ-PROCESSAMENTO (ONDE A MÁGICA DA PERFORMANCE ACONTECE)
// =================================================================
const fetchDashboardData = async () => {
  if (!props.client?.id) return;

  isFetchingClient.value = true;
  try {
    const groupData = await financeService.getClientData(props.client.id);

    activeGroupInfo.value = groupData.groupInfo;

    // PROCESSA CLIENTES
    activeGroupClients.value = groupData.clients.map(c => ({
      ...c,
      safeKey: `client-${c.id}`,
      formattedLastSale: c.lastSale ? formatDate(c.lastSale) : null
    }));

    // PROCESSA ATENDIMENTOS
    interactions.value = groupData.interactions.map(atd => ({
      ...atd,
      safeKey: `atd-${atd.id}`,
      formattedDate: formatDate(atd.date)
    }));

    // PROCESSA CONTRATOS
    contracts.value = groupData.contracts.map((c, index) => ({
      ...c,
      safeKey: c.id ? `contract-${c.id}` : `contract-idx-${index}`,
      formattedGeneration: formatDate(c.generationDate),
      formattedDueDate: formatDate(c.dueDate),
      formattedOriginal: formatCurrency(c.originalValue),
      formattedBalance: formatCurrency(c.balanceDue),
      isLate: isOverdue(c.dueDate)
    }));

    // PROCESSA CHEQUES
    checks.value = groupData.checks.map((c, index) => ({
      ...c,
      safeKey: c.document ? `check-${c.document}` : `check-idx-${index}`,
      formattedReceipt: formatDate(c.receiptDate),
      formattedGoodFor: formatDate(c.goodForDate),
      formattedOriginal: formatCurrency(c.originalValue),
      formattedBalance: formatCurrency(c.balanceDue),
      isLate: isOverdue(c.goodForDate)
    }));

    // PROCESSA NOTAS FISCAIS
    bills.value = groupData.bills.map((b, index) => ({
      ...b,
      safeKey: b.nf ? `bill-${b.nf}-${b.installment}` : `bill-idx-${index}`,
      formattedSaleDate: formatDate(b.saleDate),
      formattedDueDate: formatDate(b.dueDate),
      formattedOriginal: formatCurrency(b.originalValue),
      formattedBalance: formatCurrency(b.balanceDue),
      isLate: isOverdue(b.dueDate),
      isCredit: Number(b.balanceDue) < 0
    }));

    // PROCESSA TOTAIS
    totalContractsFormatted.value = formatCurrency(groupData.totalContracts);
    totalChecksFormatted.value = formatCurrency(groupData.totalChecks);
    totalBillsFormatted.value = formatCurrency(groupData.totalBills);
    grandTotalReceivableFormatted.value = formatCurrency(groupData.totalReceivable);

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
  interactions.value.unshift({
    ...newInteraction,
    safeKey: `atd-${newInteraction.id || Date.now()}`,
    formattedDate: formatDate(newInteraction.date)
  });
};
</script>

<style src="@/views/Finance/finance.css" scoped></style>