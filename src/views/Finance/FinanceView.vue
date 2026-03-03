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

          <ClientDashboard v-else-if="activeClient" :client="activeClient" key="dashboard" />

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

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import financeService from '@/services/financeService';
import { useToast } from '@/utils/toast';
import ClientDashboard from '@/views/Finance/ClientDashboard.vue'; 

const { showToast } = useToast();

const searchQuery = ref('');
const lastSearchedTerm = ref('');
const searchResults = ref([]);
const activeClient = ref(null);
const isLoading = ref(false);
const hasSearched = ref(false);

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
      openClient(results[0]);
    }
  } catch (error) {
    showToast("Erro na comunicação com o servidor.", "error");
  } finally {
    isLoading.value = false;
  }
};

const openClient = (client) => {
  activeClient.value = client;
};

const clearSearch = () => {
  activeClient.value = null;
};

const clearInput = () => {
  searchQuery.value = '';
};
</script>

<style src="@/views/Finance/finance.css" scoped></style>