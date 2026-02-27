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
                  <h3 class="panel-title">Painel do Cliente</h3>
                  <button class="btn-icon-green" title="Ver Limites e Saldos">
                    <i class="fa-solid fa-chart-pie"></i>
                  </button>
                </div>
                <div class="client-details">
                  <p class="detail-label">Nome do Cliente</p>
                  <p class="detail-value highlight">{{ activeClient.name }}</p>
                  
                  <p class="detail-label mt-2">Documento</p>
                  <p class="detail-value">{{ activeClient.document }}</p>

                  <p class="detail-label mt-2">Grupo / Responsável</p>
                  <p class="detail-value">{{ activeClient.group }}</p>
                </div>
              </div>

              <div class="panel-card atendimentos-card">
                <h3 class="panel-title">Últimos Atendimentos</h3>
                <div class="timeline">
                  <div class="timeline-item" v-for="atd in mockAtendimentos" :key="atd.id">
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
              
              <div class="accordion-item" :class="{ 'open': accordions.contratos }">
                <div class="accordion-header" @click="accordions.contratos = !accordions.contratos">
                  <h4 class="accordion-title">Contratos em Aberto</h4>
                  <div class="accordion-right">
                    <span class="list-total">{{ formatCurrency(totals.contratos) }}</span>
                    <i class="fa-solid fa-chevron-down toggle-icon"></i>
                  </div>
                </div>
                <div class="accordion-body" v-show="accordions.contratos">
                  <p class="empty-state">Nenhum contrato pendente para este grupo.</p>
                </div>
              </div>

              <div class="accordion-item" :class="{ 'open': accordions.cheques }">
                <div class="accordion-header" @click="accordions.cheques = !accordions.cheques">
                  <h4 class="accordion-title">Cheques em Aberto</h4>
                  <div class="accordion-right">
                    <span class="list-total">{{ formatCurrency(totals.cheques) }}</span>
                    <i class="fa-solid fa-chevron-down toggle-icon"></i>
                  </div>
                </div>
                <div class="accordion-body" v-show="accordions.cheques">
                  <p class="empty-state">Nenhum cheque pendente.</p>
                </div>
              </div>

              <div class="accordion-item" :class="{ 'open': accordions.notas }">
                <div class="accordion-header" @click="accordions.notas = !accordions.notas">
                  <h4 class="accordion-title">Notas em Aberto</h4>
                  <div class="accordion-right">
                    <span class="list-total">{{ formatCurrency(totals.notas) }}</span>
                    <i class="fa-solid fa-chevron-down toggle-icon"></i>
                  </div>
                </div>
                <div class="accordion-body" v-show="accordions.notas">
                  <table class="alembro-table small-text">
                    <thead>
                      <tr>
                        <th>Emp</th>
                        <th>Nome</th>
                        <th>NFe</th>
                        <th>Vencimento</th>
                        <th>Parcela</th>
                        <th class="text-right">A Receber</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="nota in mockNotas" :key="nota.id">
                        <td>{{ nota.emp }}</td>
                        <td>{{ nota.nome }}</td>
                        <td>{{ nota.nfe }}</td>
                        <td>{{ nota.vencimento }}</td>
                        <td>{{ nota.parcela }}</td>
                        <td class="text-right fw-bold emerald">{{ formatCurrency(nota.valor) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div class="grand-total-box">
              <p class="gt-label">Total a Receber do Grupo</p>
              <h2 class="gt-value">{{ formatCurrency(grandTotal) }}</h2>
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

const searchQuery = ref('');
const searchResults = ref([]);
const activeClient = ref(null);
const isLoading = ref(false);
const hasSearched = ref(false);
const searchTriggerCounter = ref(0);

const accordions = ref({
  contratos: false,
  cheques: false,
  notas: true 
});

const mockClientsDatabase = [
  { id: 101, name: "THIAGO FARIAS LIMA", document: "111.222.333-44", group: "Família Farias", lastSale: "25/02/2026" },
  { id: 102, name: "MURILO DE SOUZA", document: "999.888.777-66", group: "Agro Zecão Matriz", lastSale: null },
];

const mockAtendimentos = ref([
  { id: 1, date: "18/03/2026", user: "Marcos Adm", obs: "Falei com ele, prospectando novo contrato de insumos.", clientRef: "Thiago Farias" },
  { id: 2, date: "15/01/2026", user: "Murilo", obs: "Cobrança via e-mail referente a parcela atrasada.", clientRef: "Thiago Farias" },
]);

const mockNotas = ref([
  { id: 1, emp: "3", nome: "THIAGO FARIAS", nfe: "11945", vencimento: "02/02/2026", parcela: "1/3", valor: 182.00 },
  { id: 2, emp: "3", nome: "THIAGO FARIAS", nfe: "2519A", vencimento: "02/03/2026", parcela: "2/3", valor: 182.00 },
  { id: 3, emp: "1", nome: "THIAGO FARIAS", nfe: "2519A", vencimento: "02/04/2026", parcela: "3/3", valor: 182.00 },
]);

const totals = computed(() => {
  return {
    contratos: 0,
    cheques: 0,
    notas: mockNotas.value.reduce((acc, curr) => acc + curr.valor, 0)
  };
});

const grandTotal = computed(() => totals.value.contratos + totals.value.cheques + totals.value.notas);

const handleSearch = () => {
  if (isLoading.value) return;

  const query = searchQuery.value.trim();

  isLoading.value = true;
  activeClient.value = null;
  hasSearched.value = false;

  setTimeout(() => { // simluando loading 
    
    if (query && !isNaN(query)) {
      const found = mockClientsDatabase.find(c => c.id === parseInt(query));
      if (found) {
         openClient(found);
         isLoading.value = false;
         hasSearched.value = true;
         return;
      }
      searchResults.value = [];
    } else {
      searchResults.value = mockClientsDatabase.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    searchTriggerCounter.value++; 
    isLoading.value = false; 
    hasSearched.value = true;
    
  }, 600);
};

const openClient = (client) => {
  activeClient.value = client;
  searchResults.value = []; 
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

<style src="./finance.css" scoped></style>