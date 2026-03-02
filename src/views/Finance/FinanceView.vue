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

          <div v-if="!isLoading && !activeClient && searchResults.length > 0" class="search-results-box" key="results">
            <h3 class="section-title">Resultados da Pesquisa</h3>
            <div class="table-responsive">
              <table class="alembro-table">
                <thead>
                  <tr>
                    <th class="col-id">ID</th>
                    <th class="col-name">Nome do Cliente</th>
                    <th class="col-doc">CPF / CNPJ</th>
                    <th class="col-group">Responsável</th>
                    <th class="col-date">Última Venda</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="client in searchResults" :key="client.id" @click="openClient(client)">
                    <td class="col-id">{{ client.id }}</td>
                    <td class="col-name fw-bold">{{ client.name }}</td>
                    <td class="col-doc">{{ client.document }}</td>
                    <td class="col-group">{{ client.group }}</td>
                    <td class="col-date">
                      <span v-if="client.lastSale">{{ client.lastSale }}</span>
                      <span v-else class="empty-data">Sem vendas</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else-if="!isLoading && activeClient" class="client-dashboard" key="dashboard">

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
                    <span class="list-group">{{ client.group }}</span>

                    <span class="list-date">
                      <template v-if="client.lastSale">{{ client.lastSale }}</template>
                      <template v-else><span class="empty-data">Sem vendas</span></template>
                    </span>
                  </div>
                </div>
              </div>

              <div class="panel-card atendimentos-card">
                <div class="card-header-flex">
                  <h3 class="panel-title">Atendimentos</h3>
                  <button class="btn-icon-green" title="Novo Atendimento" @click="openNewAtendimentoModal">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
                <div class="timeline">
                  <div class="timeline-item" v-for="atd in atendimentos" :key="atd.id">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <span class="timeline-date">{{ atd.date }} - {{ atd.user }}</span>
                      <p class="timeline-obs">{{ atd.obs }}</p>
                      <span class="timeline-client">Ref: {{ atd.clientRef }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="financial-lists">

              <div class="accordion-item" :class="{ 'open': activeAccordion === 'contratos' }">
                <div class="accordion-header" @click="toggleAccordion('contratos')">
                  <h4 class="accordion-title">
                    <i class="fa-solid fa-file-signature" style="margin-right: 1rem;"></i> Contratos em Aberto
                  </h4>
                  <div class="accordion-right">
                    <span class="list-total">{{ formatCurrency(totals.contratos) }}</span>
                    <i class="fa-solid fa-chevron-down toggle-icon"></i>
                  </div>
                </div>
                <div class="accordion-body-wrapper">
                  <div class="accordion-body">
                    <table class="alembro-table small-text">
                      <thead>
                        <tr>
                          <th class="col-mini text-center">Emp.</th>
                          <th class="col-name">Nome</th>
                          <th class="col-cpf text-center">CPF / CNPJ</th>
                          <th class="col-doc-short text-center">Tipo</th>
                          <th class="col-date text-center">Geração</th>
                          <th class="col-date text-center">Vencimento</th>
                          <th class="col-money">Valor</th>
                          <th class="col-money">À Receber</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="contrato in contratos" :key="contrato.id">
                          <td class="text-center">{{ contrato.companyId }}</td>
                          <td>{{ contrato.clientName }}</td>
                          <td class="text-center">{{ contrato.cpf_cnpj }}</td>
                          <td class="text-center">{{ contrato.contractType }}</td>
                          <td class="text-center">{{ contrato.generationDate }}</td>
                          <td class="text-center">{{ contrato.dueDate }}</td>
                          <td class="">{{ formatCurrency(contrato.originalValue) }}</td>
                          <td class=" fw-bold emerald">{{ formatCurrency(contrato.balanceDue) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="accordion-item" :class="{ 'open': activeAccordion === 'cheques' }">
                <div class="accordion-header" @click="toggleAccordion('cheques')">
                  <h4 class="accordion-title">
                    <i class="fa-solid fa-money-check-dollar" style="margin-right: 1rem;"></i> Cheques em Aberto
                  </h4>
                  <div class="accordion-right">
                    <span class="list-total">{{ formatCurrency(totals.cheques) }}</span>
                    <i class="fa-solid fa-chevron-down toggle-icon"></i>
                  </div>
                </div>
                <div class="accordion-body-wrapper">
                  <div class="accordion-body">
                    <table class="alembro-table small-text">
                      <thead>
                        <tr>
                          <th class="col-mini text-center">Emp.</th>
                          <th class="col-name">Nome</th>
                          <th class="col-cpf text-center">CPF / CNPJ</th>
                          <th class="col-doc-short text-center">Doc</th>
                          <th class="col-name">Correntista</th>
                          <th class="col-date text-center">Recebimento</th>
                          <th class="col-date text-center">Bom Para</th>
                          <th class="col-money">Valor</th>
                          <th class="col-money">À Receber</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="cheque in cheques" :key="cheque.id">
                          <td class="text-center">{{ cheque.emp }}</td>
                          <td>{{ cheque.nome }}</td>
                          <td class="text-center">{{ cheque.cpfCnpj }}</td>
                          <td class="text-center">{{ cheque.doc }}</td>
                          <td>{{ cheque.correntista }}</td>
                          <td class="text-center">{{ cheque.recebimento }}</td>
                          <td class="text-center">{{ cheque.bomPara }}</td>
                          <td>{{ formatCurrency(cheque.valor) }}</td>
                          <td class="fw-bold emerald">{{ formatCurrency(cheque.aReceber) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="accordion-item" :class="{ 'open': activeAccordion === 'notas' }">
                <div class="accordion-header" @click="toggleAccordion('notas')">
                  <h4 class="accordion-title">
                    <i class="fa-solid fa-file-invoice-dollar" style="margin-right: 1rem;"></i> Notas em Aberto
                  </h4>
                  <div class="accordion-right">
                    <span class="list-total">{{ formatCurrency(totals.notas) }}</span>
                    <i class="fa-solid fa-chevron-down toggle-icon"></i>
                  </div>
                </div>
                <div class="accordion-body-wrapper">
                  <div class="accordion-body">
                    <table class="alembro-table small-text">
                      <thead>
                        <tr>
                          <th class="col-mini text-center">Emp.</th>
                          <th class="col-name">Nome</th>
                          <th class="col-cpf text-center">CPF/CNPJ</th>
                          <th class="col-doc-short text-center">NFe</th>
                          <th class="col-mini text-center">Parc.</th>
                          <th class="col-date text-center">Geração</th>
                          <th class="col-date text-center">Vencimento</th>
                          <th class="col-money">Valor</th>
                          <th class="col-money">À Receber</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="nota in notas" :key="nota.id">
                          <td class="text-center">{{ nota.emp }}</td>
                          <td>{{ nota.nome }}</td>
                          <td class="text-center">{{ nota.cpfCnpj }}</td>
                          <td class="text-center">{{ nota.nfe }}</td>
                          <td class="text-center">{{ nota.parcela }}</td>
                          <td class="text-center">{{ nota.geracao }}</td>
                          <td class="text-center">{{ nota.vencimento }}</td>
                          <td>{{ formatCurrency(nota.valor) }}</td>
                          <td class="fw-bold emerald">{{ formatCurrency(nota.aReceber) }}</td>
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
                <h2 class="gt-value">{{ formatCurrency(grandTotal) }}</h2>
              </div>
            </div>

          </div>

          <div v-else-if="!isLoading && hasSearched && searchResults.length === 0" class="empty-search-state"
            key="not-found">
            <i class="fa-solid fa-magnifying-glass-minus empty-icon" style="color: #ef4444; opacity: 0.8;"></i>
            <h2>Nenhum resultado encontrado</h2>
            <p>Não encontramos nenhum cliente com "{{ lastSearchedTerm }}".</p>
          </div>

          <div v-else-if="!isLoading && !hasSearched" class="empty-search-state" key="empty">
            <i class="fa-solid fa-file-invoice-dollar empty-icon"></i>
            <h2>Pronto para pesquisar</h2>
            <p>Digite o nome ou ID do cliente acima para começar.</p>
          </div>

          <div v-else class="empty-search-state" key="loading">
            <i class="fa-solid fa-circle-notch fa-spin empty-icon" style="color: #10b981; opacity: 1;"></i>
            <h2 style="color: #10b981;">Buscando dados...</h2>
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
                  <p class="modal-subtitle">Visão consolidada do grupo: {{ activeClient?.group }}</p>
                  <span class="modal-calc-note">Cálculo de Limite e Saldo Calculado: (Total de Vendas - Total de
                    Devoluções) *
                    0.3</span>
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
                    <td class="text-right">{{ formatCurrency(client.limiteBm) }}</td>
                    <td class="text-right" :class="{ 'text-red': client.saldoBm < 0 }">{{ formatCurrency(client.saldoBm)
                      }}</td>
                    <td class="text-right">{{ formatCurrency(client.limiteCalculado) }}</td>
                    <td class="text-right">{{ formatCurrency(client.saldoCalculado) }}</td>
                    <td class="text-center">{{ client.maiorAtraso }}d</td>
                    <td class="text-center">{{ client.atraso90Dias }}</td>
                    <td class="text-center">{{ client.mediaAtraso }}d</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <footer class="modal-footer">
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Total Lim. BM</span>
                <span class="modal-total-value">{{ formatCurrency(totalGroupLimits.limiteBm) }}</span>
              </div>
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Total Sld. BM</span>
                <span class="modal-total-value"
                  :class="{ 'emerald': totalGroupLimits.saldoBm > 0, 'text-red': totalGroupLimits.saldoBm < 0 }">{{
                    formatCurrency(totalGroupLimits.saldoBm) }}</span>
              </div>
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Total Lim. Calc.</span>
                <span class="modal-total-value">{{ formatCurrency(totalGroupLimits.limiteCalculado) }}</span>
              </div>
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Total Sld. Calc.</span>
                <span class="modal-total-value"
                  :class="{ 'emerald': totalGroupLimits.saldoCalculado > 0, 'text-red': totalGroupLimits.saldoCalculado < 0 }">{{
                    formatCurrency(totalGroupLimits.saldoCalculado) }}</span>
              </div>
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Média Atraso<br><small>(Grupo)</small></span>
                <span class="modal-total-value">{{ totalGroupLimits.mediaMaiorAtraso }}d</span>
              </div>
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Média 90 Dias<br><small>(Grupo)</small></span>
                <span class="modal-total-value">{{ totalGroupLimits.mediaAtraso90Dias }}</span>
              </div>
              <div class="modal-total-item text-center">
                <span class="modal-total-label">Média Geral<br><small>(Grupo)</small></span>
                <span class="modal-total-value">{{ totalGroupLimits.mediaAtrasoGeral }}d</span>
              </div>
            </footer>
          </div>
        </div>
      </Transition>

      <Transition name="modal-fade">
        <div v-if="showNewAtendimentoModal" class="modal-overlay" @click.self="closeNewAtendimentoModal">
          <div class="modal-content modal-sm">
            <header class="modal-header">
              <div class="modal-header-info">
                <h2 class="modal-title">Novo Atendimento</h2>
                <p class="modal-subtitle">Registrar histórico para o grupo: {{ activeClient?.group }}</p>
              </div>
              <button class="modal-close-btn" @click="closeNewAtendimentoModal">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </header>

            <div class="modal-body form-body">
              <div class="form-group">
                <label>Vincular ao Cliente</label>
                <CustomSelect v-model="formAtendimento.client" :options="activeGroupClients.map(c => c.name)"
                  placeholder="Selecione um cliente do grupo..." />
              </div>

              <div class="form-group">
                <label>Observação</label>
                <textarea v-model="formAtendimento.obs" class="form-control" rows="4"
                  placeholder="Detalhes do atendimento realizado..."></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Data do Atendimento</label>
                  <input type="date" v-model="formAtendimento.date" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Agendar Retorno / Notificação</label>
                  <input type="date" v-model="formAtendimento.scheduleDate" class="form-control" />
                </div>
              </div>
            </div>

            <footer class="modal-footer flex-end">
              <button class="btn-cancel" @click="closeNewAtendimentoModal">Cancelar</button>
              <button class="btn-primary" @click="closeNewAtendimentoModal">Registrar</button>
            </footer>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import financeService from '@/services/financeService';
import CustomSelect from '@/components/common/CustomSelect.vue';

const searchQuery = ref('');
const lastSearchedTerm = ref('');
const searchResults = ref([]);
const activeClient = ref(null);
const isLoading = ref(false);
const hasSearched = ref(false);

const showLimitsModal = ref(false);
const showNewAtendimentoModal = ref(false);

const formAtendimento = ref({
  client: '',
  obs: '',
  date: '',
  scheduleDate: ''
});

const activeGroupClients = ref([]);
const atendimentos = ref([]);
const contratos = ref([]);
const cheques = ref([]);
const notas = ref([]);

const openLimitsModal = () => {
  showLimitsModal.value = true;
};

const closeLimitsModal = () => {
  showLimitsModal.value = false;
};

const openNewAtendimentoModal = () => {
  formAtendimento.value = { client: '', obs: '', date: '', scheduleDate: '' };
  showNewAtendimentoModal.value = true;
};

const closeNewAtendimentoModal = () => {
  showNewAtendimentoModal.value = false;
};

const totalGroupLimits = computed(() => {
  const totals = activeGroupClients.value.reduce((acc, client) => {
    return {
      limiteCalculado: acc.limiteCalculado + (client.limiteCalculado || 0),
      limiteBm: acc.limiteBm + (client.limiteBm || 0),
      saldoCalculado: acc.saldoCalculado + (client.saldoCalculado || 0),
      saldoBm: acc.saldoBm + (client.saldoBm || 0),
      maiorAtraso: acc.maiorAtraso + (client.maiorAtraso || 0),
      atraso90Dias: acc.atraso90Dias + (client.atraso90Dias || 0),
      mediaAtraso: acc.mediaAtraso + (client.mediaAtraso || 0),
      count: acc.count + 1
    };
  }, { limiteCalculado: 0, limiteBm: 0, saldoCalculado: 0, saldoBm: 0, maiorAtraso: 0, atraso90Dias: 0, mediaAtraso: 0, count: 0 });

  return {
    limiteCalculado: totals.limiteCalculado,
    limiteBm: totals.limiteBm,
    saldoCalculado: totals.saldoCalculado,
    saldoBm: totals.saldoBm,
    mediaMaiorAtraso: totals.count ? Math.round(totals.maiorAtraso / totals.count) : 0,
    mediaAtraso90Dias: totals.count ? Math.round(totals.atraso90Dias / totals.count) : 0,
    mediaAtrasoGeral: totals.count ? Math.round(totals.mediaAtraso / totals.count) : 0
  };
});

const activeAccordion = ref('');
const toggleAccordion = (section) => {
  activeAccordion.value = activeAccordion.value === section ? null : section;
};

const totals = computed(() => {
  return {
    contratos: contratos.value.reduce((acc, curr) => acc + curr.balanceDue, 0),
    cheques: cheques.value.reduce((acc, curr) => acc + curr.aReceber, 0),
    notas: notas.value.reduce((acc, curr) => acc + curr.aReceber, 0)
  };
});

const grandTotal = computed(() => totals.value.contratos + totals.value.cheques + totals.value.notas);

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

    if (results.length === 1) {
      await openClient(results[0]);
    } else {
      searchResults.value = results;
    }

    hasSearched.value = true;
  } catch (error) {
    console.error("Erro ao pesquisar clientes:", error);
  } finally {
    isLoading.value = false;
  }
};

const openClient = async (client) => {
  isLoading.value = true;

  try {
    const dashboardData = await financeService.getClientDashboard(client);

    activeGroupClients.value = [...dashboardData.groupClients];
    atendimentos.value = [...dashboardData.atendimentos];
    contratos.value = [...dashboardData.contratos];
    cheques.value = [...dashboardData.cheques];
    notas.value = [...dashboardData.notas];

    activeClient.value = client;
  } catch (error) {
    console.error("Erro ao abrir painel do cliente:", error);
  } finally {
    isLoading.value = false;
  }
};

const clearSearch = () => {
  activeClient.value = null;
  activeGroupClients.value = [];
  atendimentos.value = [];
  contratos.value = [];
  cheques.value = [];
  notas.value = [];
};

const clearInput = () => {
  searchQuery.value = '';
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};
</script>

<style src="@/views/Finance/finance.css" scoped></style>