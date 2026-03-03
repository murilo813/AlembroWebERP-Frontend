<template>
  <div class="finance-container">
    <div class="finance-wrapper">

      <header class="finance-header">
        <div class="title-section">
          <h1 class="main-title">Módulo Financeiro</h1>
          <p class="subtitle">Pesquisa e análise de crédito e débitos</p>
        </div>

        <div class="search-bar">
          <div class="input-group">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input v-model="searchQuery" type="text" placeholder="Pesquisar por Nome ou ID do cliente..."
              @keyup.enter="handleSearch" />
            <i v-if="searchQuery" class="fa-solid fa-xmark clear-icon" @click="clearInput" title="Limpar pesquisa"></i>
          </div>
          <button class="btn-primary" @click="handleSearch" :disabled="isLoading">
            <i v-if="isLoading" class="fa-solid fa-circle-notch fa-spin"></i>
            <span v-else>Pesquisar</span>
          </button>

          <Transition name="slide-btn">
            <button v-if="activeClient" class="btn-secondary" @click="clearSearch">
              <i class="fa-solid fa-arrow-left"></i> Voltar
            </button>
          </Transition>
        </div>
      </header>

      <main class="finance-content">
        <Transition name="fade-slide" mode="out-in">

          <div v-if="isLoading" class="empty-search-state" key="loading">
            <i class="fa-solid fa-circle-notch fa-spin empty-icon" style="color: #10b981; opacity: 1;"></i>
            <h2 style="color: #10b981;">Buscando dados...</h2>
          </div>

          <div v-else-if="isFetchingClient" class="empty-search-state" key="fetching-client">
            <i class="fa-solid fa-circle-notch fa-spin empty-icon" style="color: #10b981; opacity: 1;"></i>
            <h2 style="color: #10b981;">Montando painel do grupo...</h2>
          </div>

          <div v-else-if="activeClient && !isFetchingClient" class="client-dashboard" key="dashboard">
            <div class="dashboard-top-row">
              <div class="panel-card client-info-card">
                <div class="card-header-flex">
                  <h3 class="panel-title">Painel do Grupo</h3>
                  <button class="btn-icon-green" title="Ver Limites e Saldos" @click="openLimitsModal">
                    <i class="fa-solid fa-chart-pie"></i>
                  </button>
                </div>
                <div class="client-details">
                  <div class="client-list-header">
                    <span class="detail-label col-left">Nome do Cliente</span>
                    <span class="detail-label col-right">Responsável</span>
                    <span class="detail-label col-date">Última Venda</span>
                  </div>

                  <div class="client-list-item" v-for="client in activeGroupClients" :key="client.id">
                    <span class="list-name">{{ client.name }}</span>
                    <span class="list-group">{{ activeGroupInfo?.responsible }}</span>

                    <span class="list-date">
                      <template v-if="client.lastSale">{{ formatDate(client.lastSale) }}</template>
                      <template v-else><span class="empty-data">Sem vendas</span></template>
                    </span>
                  </div>
                </div>
              </div>

              <div class="panel-card interactions-card">
                <div class="card-header-flex">
                  <h3 class="panel-title">Atendimentos</h3>
                  <button class="btn-icon-green" title="Novo Atendimento" @click="openNewCollectionModal">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
                <div class="timeline">
                  <div class="timeline-item" v-for="atd in interactions" :key="atd.id">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <span class="timeline-date">{{ formatDate(atd.date) }} - {{ atd.userName }}</span>
                      <p class="timeline-obs">{{ atd.content }}</p>
                      <span class="timeline-client">Ref: {{ atd.clientName }}</span>
                    </div>
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
                          <th class="col-date text-center">Geração</th>
                          <th class="col-date text-center">Vencimento</th>
                          <th class="col-money">Valor Original</th>
                          <th class="col-money">À Receber</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="contrato in contracts" :key="contrato.id || Math.random()">
                          <td class="text-center">{{ contrato.contractType }}</td>
                          <td class="text-center">{{ formatDate(contrato.generationDate) }}</td>
                          <td class="text-center" :class="{ 'text-red fw-bold': isOverdue(contrato.dueDate) }">
                            {{ formatDate(contrato.dueDate) }}
                          </td>
                          <td class="">{{ formatCurrency(contrato.originalValue) }}</td>
                          <td class="fw-bold">{{ formatCurrency(contrato.balanceDue) }}</td>
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
                          <th class="col-doc-short text-center">Doc</th>
                          <th class="col-name">Correntista</th>
                          <th class="col-date text-center">Recebimento</th>
                          <th class="col-date text-center">Bom Para</th>
                          <th class="col-money">Valor</th>
                          <th class="col-money">À Receber</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="cheque in checks" :key="cheque.document">
                          <td class="text-center">{{ cheque.companyId }}</td>
                          <td class="text-center">{{ cheque.document }}</td>
                          <td>{{ cheque.accountHolder }}</td>
                          <td class="text-center">{{ formatDate(cheque.receiptDate) }}</td>
                          <td class="text-center" :class="{ 'text-red fw-bold': isOverdue(cheque.goodForDate) }">
                            {{ formatDate(cheque.goodForDate) }}
                          </td>
                          <td>{{ formatCurrency(cheque.originalValue) }}</td>
                          <td class="fw-bold">{{ formatCurrency(cheque.balanceDue) }}</td>
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
                          <th class="col-doc-short text-center">NFe</th>
                          <th class="col-mini text-center">Parc.</th>
                          <th class="col-date text-center">Geração</th>
                          <th class="col-date text-center">Vencimento</th>
                          <th class="col-money">Valor</th>
                          <th class="col-money">À Receber</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="nota in bills" :key="nota.nf + '-' + nota.installment">
                          <td class="text-center">{{ nota.companyId }}</td>
                          <td class="text-center">{{ nota.nf }}</td>
                          <td class="text-center">{{ nota.installment }}</td>
                          <td class="text-center">{{ formatDate(nota.saleDate) }}</td>
                          <td class="text-center" :class="{ 'text-red fw-bold': isOverdue(nota.dueDate) }">
                            {{ formatDate(nota.dueDate) }}
                          </td>
                          <td>{{ formatCurrency(nota.originalValue) }}</td>
                          <td class="fw-bold" :class="Number(nota.balanceDue) < 0 ? 'emerald' : ''">
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

          <div v-else-if="!hasSearched" class="empty-search-state" key="empty">
            <i class="fa-solid fa-file-invoice-dollar empty-icon"></i>
            <h2>Pronto para pesquisar</h2>
            <p>Digite o nome ou ID do cliente acima para começar.</p>
          </div>

          <div v-else-if="hasSearched && searchResults.length === 0" class="empty-search-state" key="not-found">
            <i class="fa-solid fa-magnifying-glass-minus empty-icon" style="color: #ef4444; opacity: 0.8;"></i>
            <h2>Nenhum resultado encontrado</h2>
            <p>Não encontramos nenhum cliente com "{{ lastSearchedTerm }}".</p>
          </div>

          <div v-else class="search-results-box" key="results">
            <h3 class="section-title">Resultados da Pesquisa</h3>
            <div class="table-responsive">
              <table class="alembro-table">
                <thead>
                  <tr>
                    <th class="col-id">ID</th>
                    <th class="col-name">Nome do Cliente</th>
                    <th class="col-doc">CPF / CNPJ</th>
                    <th class="col-group">Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="client in searchResults" :key="client.id" @click="openClient(client)">
                    <td class="col-id">{{ client.id }}</td>
                    <td class="col-name fw-bold">{{ client.name }}</td>
                    <td class="col-doc">{{ client.cpfCnpj }}</td>
                    <td class="col-group">{{ client.responsible }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </Transition>
      </main>

      <Transition name="modal-fade">
        <div v-if="showLimitsModal" class="modal-overlay" @click.self="closeLimitsModal">
          <div class="modal-content">
            <header class="modal-header">
              <div class="modal-header-info">
                <h2 class="modal-title">Limites e Saldos</h2>
                <div class="subtitle-row">
                  <p class="modal-subtitle">Visão consolidada do grupo: {{ activeGroupInfo?.responsible }}</p>
                  <span class="modal-calc-note">Cálculo de Limite e Saldo Calculado: (Total de Vendas - Total de
                    Devoluções) * 0.3</span>
                </div>
              </div>
              <button class="modal-close-btn" @click="closeLimitsModal">
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
                  <tr v-for="client in activeGroupClients" :key="client.id">
                    <td class="col-name text-left fw-bold">{{ client.name }}</td>
                    <td class="text-right">{{ formatCurrency(client.limitBm) }}</td>
                    <td class="text-right" :class="{ 'text-red': client.balanceBm < 0 }">{{
                      formatCurrency(client.balanceBm)
                    }}</td>
                    <td class="text-right">{{ formatCurrency(client.limitCalc) }}</td>
                    <td class="text-right" :class="{ 'text-red': client.balanceCalc < 0 }">{{
                      formatCurrency(client.balanceCalc) }}</td>
                    <td class="text-center">{{ client.maxDelay }}d</td>
                    <td class="text-center">{{ formatPercent(client.pctDelay90) }}</td>
                    <td class="text-center">{{ client.avgDelay }}d</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <footer class="modal-footer">
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Total Lim. BM</span>
                <span class="modal-total-value">{{ formatCurrency(activeGroupInfo?.totalLimitBm) }}</span>
              </div>
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Total Sld. BM</span>
                <span class="modal-total-value"
                  :class="{ 'emerald': activeGroupInfo?.totalBalanceBm > 0, 'text-red': activeGroupInfo?.totalBalanceBm < 0 }">
                  {{ formatCurrency(activeGroupInfo?.totalBalanceBm) }}
                </span>
              </div>
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Total Lim. Calc.</span>
                <span class="modal-total-value">{{ formatCurrency(activeGroupInfo?.totalLimitCalc) }}</span>
              </div>
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Total Sld. Calc.</span>
                <span class="modal-total-value"
                  :class="{ 'emerald': activeGroupInfo?.totalBalanceCalc > 0, 'text-red': activeGroupInfo?.totalBalanceCalc < 0 }">
                  {{ formatCurrency(activeGroupInfo?.totalBalanceCalc) }}
                </span>
              </div>
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Maior Atraso<br><small>(Grupo)</small></span>
                <span class="modal-total-value">{{ activeGroupInfo?.groupMaxDelay }}d</span>
              </div>
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Média 90 Dias<br><small>(Grupo)</small></span>
                <span class="modal-total-value">{{ formatPercent(activeGroupInfo?.groupAvgPct90) }}</span>
              </div>
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Média Geral<br><small>(Grupo)</small></span>
                <span class="modal-total-value">{{ activeGroupInfo?.groupAvgDelay }}d</span>
              </div>
            </footer>
          </div>
        </div>
      </Transition>

      <Transition name="modal-fade">
        <div v-if="showNewCollectionModal" class="modal-overlay" @click.self="closeNewCollectionModal">
          <div class="modal-content modal-sm">
            <header class="modal-header">
              <div class="modal-header-info">
                <h2 class="modal-title">Novo Atendimento</h2>
                <p class="modal-subtitle">Registrar histórico para o grupo: {{ activeGroupInfo?.responsible }}</p>
              </div>
              <button class="modal-close-btn" @click="closeNewCollectionModal">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </header>

            <div class="modal-body form-body">
              <div class="form-group">
                <label>Vincular ao Cliente</label>
                <CustomSelect v-model="collectionForm.client"
                  :options="activeGroupClients.map(c => ({ value: c.id, label: c.name }))"
                  placeholder="Selecione um cliente do grupo..." />
              </div>

              <div class="form-group">
                <label>Observação</label>
                <textarea v-model="collectionForm.obs" class="form-control" rows="4"
                  placeholder="Detalhes do atendimento realizado..."></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Data do Atendimento</label>
                  <input type="date" v-model="collectionForm.date" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Agendar Retorno / Notificação</label>
                  <input type="date" v-model="collectionForm.scheduleDate" class="form-control" />
                </div>
              </div>
            </div>

            <footer class="modal-footer flex-end">
              <button class="btn-cancel" @click="closeNewCollectionModal" :disabled="isSavingObs">Cancelar</button>

              <button class="btn-primary" @click="handleSaveObservation" :disabled="isSavingObs">
                <i v-if="isSavingObs" class="fa-solid fa-circle-notch fa-spin"></i>
                <span v-else>Registrar</span>
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import financeService from '@/services/financeService';
import CustomSelect from '@/components/common/CustomSelect.vue';

const searchQuery = ref('');
const lastSearchedTerm = ref('');
const searchResults = ref([]);
const activeClient = ref(null);
const isLoading = ref(false);
const isFetchingClient = ref(false);
const hasSearched = ref(false);

const showLimitsModal = ref(false);
const showNewCollectionModal = ref(false);
const isSavingObs = ref(false);

const collectionForm = ref({
  client: '',
  obs: '',
  date: '',
  scheduleDate: ''
});

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

const openLimitsModal = () => showLimitsModal.value = true;
const closeLimitsModal = () => showLimitsModal.value = false;

const openNewCollectionModal = () => {
  const today = new Date().toISOString().split('T')[0];
  collectionForm.value = { client: '', obs: '', date: today, scheduleDate: '' };
  showNewCollectionModal.value = true;
};
const closeNewCollectionModal = () => showNewCollectionModal.value = false;

const activeAccordion = ref('');
const toggleAccordion = (section) => {
  activeAccordion.value = activeAccordion.value === section ? null : section;
};

const isOverdue = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

const handleSearch = async () => {
  if (isLoading.value || !searchQuery.value.trim()) return;

  const query = searchQuery.value.trim();
  lastSearchedTerm.value = query;
  isLoading.value = true;
  activeClient.value = null;
  hasSearched.value = false;

  try {
    const results = await financeService.searchClients(query);
    searchResults.value = results;
    hasSearched.value = true;

    if (results.length === 1) {
      await openClient(results[0]);
    } else {
      searchResults.value = results;
    }
  } catch (error) {
    console.error("Erro ao pesquisar clientes:", error);
  } finally {
    isLoading.value = false;
  }
};

const openClient = async (client) => {
  if (isFetchingClient.value) return;

  isFetchingClient.value = true;

  try {
    const groupData = await financeService.getClientData(client.id);

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

    activeClient.value = client;
  } catch (error) {
    console.error("Erro ao abrir painel do cliente:", error);
  } finally {
    isFetchingClient.value = false;
  }
};

const handleSaveObservation = async () => {
  if (!collectionForm.value.client || !collectionForm.value.obs || !collectionForm.value.date) {
    alert("Selecione o cliente, digite a observação e informe a data!");
    return;
  }

  isSavingObs.value = true;
  const loggedUserId = localStorage.getItem('userId');
  const loggedCompanyId = localStorage.getItem('companyId');
  const loggedUserName = localStorage.getItem('nomenclature') || "Usuário";

  const payload = {
    userId: Number(loggedUserId),
    companyId: Number(loggedCompanyId),
    observation: collectionForm.value.obs,
    date: collectionForm.value.date,
    scheduleDate: collectionForm.value.scheduleDate || null
  };

  try {
    const selectedClientId = collectionForm.value.client;

    await financeService.saveObservation(selectedClientId, payload);

    const clientNameSelected = activeGroupClients.value.find(c => c.id === selectedClientId)?.name || "Cliente";

    interactions.value.unshift({
      id: Date.now(),
      clientName: clientNameSelected,
      content: payload.observation,
      date: payload.date,
      scheduleDate: payload.scheduleDate,
      userName: loggedUserName
    });

    closeNewCollectionModal();

    // Se quiser, bota um Toast de sucesso aqui depois!
    console.log("Atendimento salvo com sucesso!");

  } catch (error) {
    alert("Erro ao registrar atendimento. Verifique o console.");
  } finally {
    isSavingObs.value = false;
  }
};

const clearSearch = () => {
  activeClient.value = null;
  activeGroupInfo.value = null;
  activeGroupClients.value = [];
  interactions.value = [];
  contracts.value = [];
  checks.value = [];
  bills.value = [];
};

const clearInput = () => searchQuery.value = '';

const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return '0%';
  const formatted = (parseFloat(value) * 100).toFixed(1);
  return `${formatted}%`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};
</script>

<style src="@/views/Finance/finance.css" scoped></style>