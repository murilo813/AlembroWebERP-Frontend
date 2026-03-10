<template>
  <div class="expenses-container">
    <div class="expenses-wrapper">

      <header class="expenses-header" style="flex-direction: column; align-items: stretch; gap: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div class="title-section">
            <h1 class="main-title">Consulta de Gastos</h1>
            <p class="subtitle">Visão gerencial de despesas consolidadas.</p>
          </div>
          <button class="btn-secondary" @click="$router.push('/expenses')">
            <i class="fa-solid fa-arrow-left"></i> Voltar ao Hub
          </button>
        </div>

        <div class="collapsible-filters-container">
          <div class="filters-toggle" @click="toggleFilters" :class="{ 'is-open': isFiltersOpen }">
            <div class="toggle-left">
              <i class="fa-solid fa-filter"></i>
              <span>Filtros de Busca</span>
              <span v-if="hasActiveFilters" class="active-dot"></span>
            </div>
            <i class="fa-solid fa-chevron-down toggle-arrow" :class="{ 'rotated': isFiltersOpen }"></i>
          </div>

          <Transition name="expand-filters">
            <div v-show="isFiltersOpen" class="filters-body">
              <div class="filters-grid">

                <div class="form-group">
                  <label>Data Início</label>
                  <input type="date" class="form-control compact-input" v-model="filters.startDate">
                </div>

                <div class="form-group">
                  <label>Data Final</label>
                  <input type="date" class="form-control compact-input" v-model="filters.endDate">
                </div>

                <div class="form-group search-group">
                  <label>Placa / Veículo</label>
                  <div class="search-wrapper" v-if="!filters.plate">
                    <input type="text" class="form-control compact-input uppercase-input" v-model="searchVehicleQuery"
                      @input="handleVehicleSearch" @focus="showVehicleDropdown = true"
                      @blur="hideVehicleDropdownWithDelay" placeholder="Buscar placa...">
                    <ul v-if="showVehicleDropdown && searchResultsVehicles.length > 0" class="dropdown-list">
                      <li v-for="vehicle in searchResultsVehicles" :key="vehicle.plate" @click="selectVehicle(vehicle)">
                        <span class="fw-bold">{{ vehicle.plate }}</span> - {{ vehicle.vehicle }}
                      </li>
                    </ul>
                  </div>
                  <div v-else class="selected-client-badge compact-badge emerald fw-bold">
                    <span><i class="fa-solid fa-car"></i> {{ filters.plate }}</span>
                    <button class="btn-clear text-red" title="Limpar" @click="clearVehicle">
                      <i class="fa-solid fa-times"></i>
                    </button>
                  </div>
                </div>

                <div class="form-group search-group">
                  <label>Responsável</label>
                  <div class="search-wrapper" v-if="!filters.responsible">
                    <input type="text" class="form-control compact-input" v-model="searchResponsibleQuery"
                      @input="handleResponsibleSearch" @focus="showResponsibleDropdown = true"
                      @blur="hideResponsibleDropdownWithDelay" placeholder="Buscar motorista...">
                    <ul v-if="showResponsibleDropdown && searchResultsResponsible.length > 0" class="dropdown-list">
                      <li v-for="resp in searchResultsResponsible" :key="resp.plate" @click="selectResponsible(resp)">
                        {{ resp.responsible_name }}
                      </li>
                    </ul>
                  </div>
                  <div v-else class="selected-client-badge compact-badge emerald fw-bold">
                    <span><i class="fa-solid fa-user-tie"></i> {{ filters.responsible }}</span>
                    <button class="btn-clear text-red" title="Limpar" @click="clearResponsible">
                      <i class="fa-solid fa-times"></i>
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label>Doc.</label>
                  <input type="text" class="form-control compact-input" placeholder="ID/Nota..." v-model="filters.doc">
                </div>

                <div class="form-group search-group">
                  <label>Fornecedor</label>
                  <div class="search-wrapper" v-if="!filters.providerId">
                    <input type="text" class="form-control compact-input" v-model="searchProviderQuery"
                      @input="handleProviderSearch" @focus="showProviderDropdown = true"
                      @blur="hideProviderDropdownWithDelay" placeholder="Digite nome ou ID..." />
                    <i class="fa-solid fa-magnifying-glass search-icon-inside" v-if="!searchProviderQuery"></i>
                    <ul v-if="showProviderDropdown && searchResultsProviders.length > 0" class="dropdown-list">
                      <li v-for="prov in searchResultsProviders" :key="prov.id" @click="selectProvider(prov)">
                        <span class="fw-bold">{{ prov.id }}</span> - {{ prov.name }}
                      </li>
                    </ul>
                  </div>
                  <div v-else class="selected-client-badge compact-badge emerald fw-bold">
                    <span><i class="fa-solid fa-building"></i> {{ filters.providerName }}</span>
                    <button class="btn-clear text-red" title="Limpar" @click="clearProvider">
                      <i class="fa-solid fa-times"></i>
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label>Tipo de Gasto</label>
                  <CustomSelect v-model="filters.expenseType" :options="expenseTypeOptions"
                    placeholder="Todos os tipos" />
                </div>

                <div class="filter-actions-cell">
                  <button class="btn-primary btn-compact" @click="applyFilters" title="Filtrar" :disabled="isLoading">
                    <i class="fa-solid fa-filter" v-if="!isLoading"></i>
                    <i class="fa-solid fa-circle-notch fa-spin" v-else></i>
                    Filtrar
                  </button>
                  <button class="btn-secondary text-red btn-compact-icon" @click="clearFilters" title="Limpar Filtros"
                    :disabled="isLoading">
                    <i class="fa-solid fa-eraser"></i>
                  </button>
                </div>

              </div>
            </div>
          </Transition>
        </div>
      </header>

      <main class="expenses-content" style="display: flex; flex-direction: column; gap: 3rem;">

        <div class="summary-cards-grid">
          <div class="summary-card">
            <div class="summary-icon"><i class="fa-solid fa-money-bill-wave"></i></div>
            <div class="summary-info">
              <span class="summary-label">Total Filtrado</span>
              <span class="summary-value emerald">{{ formatCurrency(summaryData.totalAmount) }}</span>
              <span style="color: #64748b; font-size: 1.2rem; font-weight: 600; margin-top: 0.2rem;">{{
                summaryData.totalCount }} Lançamentos</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon"><i class="fa-solid fa-car"></i></div>
            <div class="summary-info">
              <span class="summary-label">Veículo com Maior Gasto</span>
              <span class="summary-value" style="font-size: 1.8rem;">{{ summaryData.topVehicle.name }}</span>
              <span style="color: #64748b; font-size: 1.2rem; font-weight: 600; margin-top: 0.2rem;">{{
                formatCurrency(summaryData.topVehicle.value) }}</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon"><i class="fa-solid fa-user-tie"></i></div>
            <div class="summary-info">
              <span class="summary-label">Resp. com Maior Gasto</span>
              <span class="summary-value" style="font-size: 1.8rem;">{{ summaryData.topResponsible.name }}</span>
              <span style="color: #64748b; font-size: 1.2rem; font-weight: 600; margin-top: 0.2rem;">{{
                formatCurrency(summaryData.topResponsible.value) }}</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon"
              :class="summaryData.topCategory.code ? `icon-${summaryData.topCategory.code}` : ''">
              <i class="fa-solid fa-layer-group"></i>
            </div>
            <div class="summary-info">
              <span class="summary-label">Categoria com Maior Gasto</span>
              <span class="summary-value"
                :class="summaryData.topCategory.code ? `text-${summaryData.topCategory.code}` : ''"
                style="font-size: 1.8rem;">
                {{ summaryData.topCategory.name }}
              </span>
              <span style="color: #64748b; font-size: 1.2rem; font-weight: 600; margin-top: 0.2rem;">
                {{ formatCurrency(summaryData.topCategory.value) }}
              </span>
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="alembro-table">
            <thead>
              <tr>
                <th class="text-center" style="width: 10rem;">ID/Nota</th>
                <th class="text-center" style="width: 22rem;">Placa & Veículo</th>
                <th class="text-left" style="width: 18rem;">Responsável</th>
                <th class="text-left">Fornecedor</th>
                <th class="text-center" style="width: 15rem;">Tipo / Data</th>
                <th class="text-right" style="width: 14rem;">Valor / KM</th>
                <th class="text-center" style="width: 6rem;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="7" class="text-center" style="padding: 4rem; color: #64748b;">
                  <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.4rem;"></i>
                  <p style="margin-top: 1rem; font-size: 1.4rem;">Buscando dados...</p>
                </td>
              </tr>

              <tr v-else-if="expensesList.length === 0">
                <td colspan="7" class="text-center" style="padding: 4rem;">
                  <span class="empty-data">Nenhum gasto encontrado para os filtros selecionados.</span>
                </td>
              </tr>

              <tr v-else v-for="expense in expensesList" :key="expense.id">
                <td class="text-center">
                  <span class="fw-bold" style="color: #94a3b8;">#{{ expense.entryId }}</span>
                </td>
                <td class="text-center">
                  <div class="cell-vehicle" v-if="expense.vehicleModel">
                    <span class="plate-badge">{{ expense.plate }}</span>
                    <span class="vehicle-model">{{ expense.vehicleModel }}</span>
                  </div>
                  <div class="cell-vehicle" v-else>
                    <span class="fw-bold" style="font-size: 1.4rem; color: #f8fafc;">{{ expense.plate }}</span>
                  </div>
                </td>
                <td class="text-left">
                  <div class="cell-responsible">
                    <span class="fw-bold">{{ expense.responsible }}</span>
                  </div>
                </td>
                <td class="text-left">
                  <span class="fw-bold">{{ expense.provider }}</span>
                </td>
                <td class="text-center">
                  <div class="cell-type-date" style="align-items: center;">
                    <span class="expense-type-badge" :class="expense.typeCode">
                      {{ getExpenseTypeLabel(expense.typeCode) }}
                    </span>
                    <span class="small-date">{{ formatDateBR(expense.date) }}</span>
                  </div>
                </td>
                <td class="text-right">
                  <div class="cell-value" style="align-items: flex-end;">
                    <span class="fw-bold emerald">{{ formatCurrency(expense.value) }}</span>
                    <span v-if="expense.km" class="small-km">KM: {{ expense.km }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <button class="btn-icon-only" title="Ver Detalhes" @click="openDetails(expense)">
                    <i class="fa-regular fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-container" v-if="totalPages > 1 && !isLoading">
          <button class="btn-pagination" :disabled="currentPage === 1" @click="fetchExpenses(currentPage - 1)">
            <i class="fa-solid fa-chevron-left"></i> Anterior
          </button>
          <span class="pagination-info">Página {{ currentPage }} de {{ totalPages }}</span>
          <button class="btn-pagination" :disabled="currentPage === totalPages" @click="fetchExpenses(currentPage + 1)">
            Próximo <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

      </main>
    </div>

    <EntryModal :show="showDetailsModal" :expenseData="selectedExpense" @close="showDetailsModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useToast } from '@/utils/toast';
import expensesService from '@/services/expensesService';
import financeService from '@/services/financeService';
import CustomSelect from '@/components/common/CustomSelect.vue';
import EntryModal from '@/views/Expenses/EntryModal.vue';

const { showToast } = useToast();

const isLoading = ref(false);
const expensesList = ref([]);
const totalPages = ref(1);
const currentPage = ref(1);

const summaryData = ref({
  totalAmount: 0,
  totalCount: 0,
  topVehicle: { name: '---', value: 0 },
  topResponsible: { name: '---', value: 0 },
  topCategory: { name: '---', value: 0, code: '' }
});

const isFiltersOpen = ref(false);

const toggleFilters = () => {
  isFiltersOpen.value = !isFiltersOpen.value;
};


const expenseTypeOptions = [
  { label: 'Todos os tipos', value: '' },
  { label: 'Combustível', value: 'combustivel' },
  { label: 'Manutenção', value: 'manutencao' },
  { label: 'Aquisição', value: 'aquisicao' },
  { label: 'Lavação', value: 'lavacao' },
  { label: 'Documentação', value: 'documentacao' },
  { label: 'Multa', value: 'multa' },
  { label: 'Serviços', value: 'servicos' },
  { label: 'Outros', value: 'outros' }
];

const filters = ref({
  startDate: '', endDate: '', plate: '', doc: '',
  providerId: null, providerName: '', expenseType: '', responsible: ''
});

const hasActiveFilters = computed(() => {
  const { providerName, ...rest } = filters.value;
  return Object.values(rest).some(val => val !== '' && val !== null);
});

const fetchExpenses = async (page = 1) => {
  if (isLoading.value) return;
  isLoading.value = true;

  try {
    const params = {
      page: page,
      initDate: filters.value.startDate || null,
      finalDate: filters.value.endDate || null,
      plate: filters.value.plate || null,
      responsible: filters.value.responsible || null,
      doc: filters.value.doc || null,
      providerId: filters.value.providerId || null,
      expenseType: filters.value.expenseType || null
    };

    const response = await expensesService.getExpenses(params);

    expensesList.value = response.data;
    summaryData.value = response.summary;
    totalPages.value = response.totalPages;
    currentPage.value = response.currentPage;

  } catch (error) {
    showToast("Erro ao carregar consulta de gastos.", "error");
    expensesList.value = [];
  } finally {
    isLoading.value = false;
  }
};

const applyFilters = () => {
  fetchExpenses(1);
  isFiltersOpen.value = false;
};

const clearFilters = () => {
  filters.value = {
    startDate: '', endDate: '', plate: '', doc: '',
    providerId: null, providerName: '', expenseType: '', responsible: ''
  };
  searchVehicleQuery.value = '';
  searchResponsibleQuery.value = '';
  searchProviderQuery.value = '';
  fetchExpenses(1);
};

onMounted(() => {
  fetchExpenses(1);
});

let vehicleTimer = null;
let responsibleTimer = null;
let providerTimer = null;

onUnmounted(() => {
  if (vehicleTimer) clearTimeout(vehicleTimer);
  if (responsibleTimer) clearTimeout(responsibleTimer);
  if (providerTimer) clearTimeout(providerTimer);
});

// FORNECEDOR
const searchProviderQuery = ref('');
const showProviderDropdown = ref(false);
const searchResultsProviders = ref([]);

const handleProviderSearch = () => {
  clearTimeout(providerTimer);
  if (searchProviderQuery.value.length < 3) {
    searchResultsProviders.value = [];
    return;
  }
  providerTimer = setTimeout(async () => {
    try {
      searchResultsProviders.value = await financeService.searchClients(searchProviderQuery.value);
    } catch (error) {
      console.error("Erro", error);
    }
  }, 400);
};

const selectProvider = (provider) => {
  filters.value.providerId = provider.id;
  filters.value.providerName = provider.name;
  searchProviderQuery.value = '';
  showProviderDropdown.value = false;
};

const clearProvider = () => {
  filters.value.providerId = null;
  filters.value.providerName = '';
  searchProviderQuery.value = '';
};
const hideProviderDropdownWithDelay = () => setTimeout(() => showProviderDropdown.value = false, 200);

// VEÍCULO
const searchVehicleQuery = ref('');
const showVehicleDropdown = ref(false);
const searchResultsVehicles = ref([]);

const handleVehicleSearch = () => {
  clearTimeout(vehicleTimer);
  if (searchVehicleQuery.value.length < 2) {
    searchResultsVehicles.value = [];
    return;
  }
  vehicleTimer = setTimeout(async () => {
    try {
      searchResultsVehicles.value = await expensesService.searchFleet(searchVehicleQuery.value, 'vehicle');
    } catch (error) {
      console.error("Erro", error);
    }
  }, 400);
};

const selectVehicle = (item) => {
  filters.value.plate = item.plate;
  searchVehicleQuery.value = '';
  showVehicleDropdown.value = false;
};

const clearVehicle = () => {
  filters.value.plate = '';
  searchVehicleQuery.value = '';
};
const hideVehicleDropdownWithDelay = () => setTimeout(() => showVehicleDropdown.value = false, 200);

// RESPONSÁVEL
const searchResponsibleQuery = ref('');
const showResponsibleDropdown = ref(false);
const searchResultsResponsible = ref([]);

const handleResponsibleSearch = () => {
  clearTimeout(responsibleTimer);
  if (searchResponsibleQuery.value.length < 3) {
    searchResultsResponsible.value = [];
    return;
  }
  responsibleTimer = setTimeout(async () => {
    try {
      searchResultsResponsible.value = await expensesService.searchFleet(searchResponsibleQuery.value, 'responsible');
    } catch (error) {
      console.error("Erro", error);
    }
  }, 400);
};

const selectResponsible = (item) => {
  filters.value.responsible = item.responsible_name;
  searchResponsibleQuery.value = '';
  showResponsibleDropdown.value = false;
};

const clearResponsible = () => {
  filters.value.responsible = '';
  searchResponsibleQuery.value = '';
};
const hideResponsibleDropdownWithDelay = () => setTimeout(() => showResponsibleDropdown.value = false, 200);


// MODAL
const showDetailsModal = ref(false);
const selectedExpense = ref(null);

const openDetails = async (expense) => {
  try {
    const details = await expensesService.getExpenseDetails(expense.entryId);
    selectedExpense.value = details;
    showDetailsModal.value = true;
  } catch (error) {
    showToast("Não foi possível carregar os detalhes desta nota.", "error");
  }
};

const formatCurrency = (value) => {
  const val = Number(value);
  if (isNaN(val)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const formatDateBR = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const getExpenseTypeLabel = (code) => {
  const option = expenseTypeOptions.find(opt => opt.value === code);
  return option ? option.label : code;
};
</script>

<style src="@/views/Expenses/expenses.css"></style>