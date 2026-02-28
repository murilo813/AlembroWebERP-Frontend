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
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Pesquisar por Nome ou ID do cliente..."
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="btn-primary" @click="handleSearch" :disabled="isLoading">
            <i v-if="isLoading" class="fa-solid fa-circle-notch fa-spin"></i>
            <span v-else>Pesquisar</span>
          </button>
          
          <button v-if="activeClient" class="btn-secondary" @click="clearSearch">
            <i class="fa-solid fa-arrow-left"></i> Voltar
          </button>
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
                  <button class="btn-icon-green" title="Ver Limites e Saldos">
                    <i class="fa-solid fa-chart-pie"></i>
                  </button>
                </div>
                <div class="client-details">
                  <div class="client-list-header">
                    <span class="detail-label col-left">Nome do Cliente</span>
                    <span class="detail-label col-right">Responsável</span>
                  </div>

                  <div class="client-list-item" v-for="client in activeGroupClients" :key="client.id">
                    <span class="list-name">{{ client.name }}</span>
                    <span class="list-group">{{ client.group }}</span>
                  </div>
                </div>
              </div>

              <div class="panel-card atendimentos-card">
                <h3 class="panel-title">Atendimentos</h3>
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

          <div v-else-if="!isLoading && hasSearched && searchResults.length === 0" class="empty-search-state" key="not-found">
            <i class="fa-solid fa-magnifying-glass-minus empty-icon" style="color: #ef4444; opacity: 0.8;"></i>
            <h2>Nenhum resultado encontrado</h2>
            <p>Não encontramos nenhum cliente com "{{ searchQuery }}".</p>
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

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import financeService from '@/services/financeService';

const searchQuery = ref('');
const searchResults = ref([]);
const activeClient = ref(null);
const isLoading = ref(false);
const hasSearched = ref(false);

const activeGroupClients = ref([]);
const atendimentos = ref([]);
const contratos = ref([]);
const cheques = ref([]);
const notas = ref([]);

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
  isLoading.value = true;
  activeClient.value = null;
  hasSearched.value = false;

  try {
    const results = await financeService.searchClients(query);
    
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
    searchResults.value = []; 
  } catch (error) {
    console.error("Erro ao abrir painel do cliente:", error);
  } finally {
    isLoading.value = false;
  }
};

const clearSearch = () => {
  activeClient.value = null;
  searchQuery.value = '';
  searchResults.value = [];
  hasSearched.value = false; 
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};
</script>

<style src="@/views/Finance/finance.css" scoped></style>