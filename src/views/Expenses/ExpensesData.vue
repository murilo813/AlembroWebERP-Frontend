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
                      <li v-for="vehicle in searchResultsVehicles" :key="vehicle.plate"
                        @click="selectVehicle(vehicle)">
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

                <div class="form-group">
                  <label>Fornecedor</label>
                  <div style="position: relative;">
                    <input type="text" class="form-control compact-input" placeholder="Nome..." v-model="filters.provider">
                    <i class="fa-solid fa-magnifying-glass search-icon-inside"></i>
                  </div>
                </div>

                <div class="form-group">
                  <label>Tipo de Gasto</label>
                  <CustomSelect 
                    v-model="filters.expenseType" 
                    :options="expenseTypeOptions" 
                    placeholder="Todos os tipos" 
                  />
                </div>

                <div class="filter-actions-cell">
                  <button class="btn-primary btn-compact" @click="applyFilters" title="Filtrar">
                    <i class="fa-solid fa-filter"></i> Filtrar
                  </button>
                  <button class="btn-secondary text-red btn-compact-icon" @click="clearFilters" title="Limpar Filtros">
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
              <span class="summary-value emerald">{{ formatCurrency(summaryMocks.totalAmount) }}</span>
              <span style="color: #64748b; font-size: 1.2rem; font-weight: 600; margin-top: 0.2rem;">{{ summaryMocks.totalCount }} Lançamentos</span>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="summary-icon"><i class="fa-solid fa-car"></i></div>
            <div class="summary-info">
              <span class="summary-label">Veículo com Maior Gasto</span>
              <span class="summary-value" style="font-size: 1.8rem;">{{ summaryMocks.topVehicle.plate }}</span>
              <span style="color: #64748b; font-size: 1.2rem; font-weight: 600; margin-top: 0.2rem;">{{ formatCurrency(summaryMocks.topVehicle.value) }}</span>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="summary-icon"><i class="fa-solid fa-user-tie"></i></div>
            <div class="summary-info">
              <span class="summary-label">Resp. com Maior Gasto</span>
              <span class="summary-value" style="font-size: 1.8rem;">{{ summaryMocks.topResponsible.name }}</span>
              <span style="color: #64748b; font-size: 1.2rem; font-weight: 600; margin-top: 0.2rem;">{{ formatCurrency(summaryMocks.topResponsible.value) }}</span>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="summary-icon" :class="`icon-${summaryMocks.topCategory.code}`">
              <i class="fa-solid fa-layer-group"></i>
            </div>
            
            <div class="summary-info">
              <span class="summary-label">Categoria com Maior Gasto</span>
              <span class="summary-value" :class="`text-${summaryMocks.topCategory.code}`" style="font-size: 1.8rem;">
                {{ summaryMocks.topCategory.name }}
              </span>
              <span style="color: #64748b; font-size: 1.2rem; font-weight: 600; margin-top: 0.2rem;">
                {{ formatCurrency(summaryMocks.topCategory.value) }}
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
              <tr v-for="expense in mockedExpensesList" :key="expense.id">
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
                      {{ expense.typeLabel }}
                    </span>
                    <span class="small-date">{{ expense.date }}</span>
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
              <tr v-if="mockedExpensesList.length === 0">
                <td colspan="7" class="text-center" style="padding: 4rem;">
                  <span class="empty-data">Nenhum gasto encontrado para os filtros selecionados.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
    
    <EntryModal 
      :show="showDetailsModal" 
      :expenseData="selectedExpense" 
      @close="showDetailsModal = false" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useToast } from '@/utils/toast';
import expensesService from '@/services/expensesService'; 
import CustomSelect from '@/components/common/CustomSelect.vue';
import EntryModal from '@/views/Expenses/EntryModal.vue';

const { showToast } = useToast();

const isFiltersOpen = ref(false); 

const toggleFilters = () => {
  isFiltersOpen.value = !isFiltersOpen.value;
};

const expenseTypeOptions = [
  { label: 'Todos os tipos', value: '' },
  { label: 'Combustível', value: 'combustivel' },
  { label: 'Manutenção', value: 'manutencao' },
  { label: 'Aquisição', value: 'aquisicao'},
  { label: 'Lavação', value: 'lavacao'},
  { label: 'Documentação', value: 'documentacao'},
  { label: 'Multa', value: 'multa'},
  { label: 'Serviços', value: 'servicos' },
  { label: 'Outros', value: 'outros' }
];

const filters = ref({
  startDate: '', endDate: '', plate: '', doc: '', 
  provider: '', expenseType: '', responsible: '' 
});

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(val => val !== '');
});

let vehicleTimer = null;
let responsibleTimer = null;

onUnmounted(() => {
  if (vehicleTimer) clearTimeout(vehicleTimer);
  if (responsibleTimer) clearTimeout(responsibleTimer);
});

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

const applyFilters = () => {
  showToast("Buscando dados...", "success");
  isFiltersOpen.value = false; 
};

const clearFilters = () => {
  filters.value = { startDate: '', endDate: '', plate: '', doc: '', provider: '', expenseType: '', responsible: '' };
  searchVehicleQuery.value = '';
  searchResponsibleQuery.value = '';
};

const showDetailsModal = ref(false);
const selectedExpense = ref(null);

const openDetails = (expense) => {
  selectedExpense.value = {
    ...expense,
    linkedBy: 'João da Silva',
    linkedDate: '15/10/2023',
    observation: 'Abastecimento extra devido a rota desviada.',
    totals: { products: 2450.00, services: 150.00, discount: 50.00, addition: 0, freight: 0, insurance: 0, grandTotal: 2550.00 },
    items: [
      { id: '001', name: 'Óleo Diesel S10', unit: 'LT', quantity: 400, unitCost: 6.12, addition: 0, discount: 48.00, totalValue: 2400.00 }
    ]
  }; 
  showDetailsModal.value = true;
};

const summaryMocks = ref({
  totalAmount: 14580.50,
  totalCount: 12,
  topVehicle: { plate: 'ABC-1234', value: 5430.00 },
  topResponsible: { name: 'JOÃO SILVA', value: 6120.50 },
  topCategory: { name: 'Documentação', value: 8900.00, code: 'documentacao' }
});

const mockedExpensesList = ref([
  {
    id: 1, entryId: 10502, plate: 'ABC-1234', vehicleModel: 'Volvo FH 540',
    responsible: 'JOÃO SILVA', provider: 'POSTO IPIRANGA', typeCode: 'combustivel', typeLabel: 'Combustível',
    date: '15/10/2023', value: 2450.00, km: '45.000'
  },
  {
    id: 2, entryId: 10508, plate: 'XYZ-9876', vehicleModel: 'Scania R450',
    responsible: 'MARCOS PEIXOTO', provider: 'AUTO PECAS SAO JOSE', typeCode: 'manutencao', typeLabel: 'Manutenção',
    date: '16/10/2023', value: 850.75, km: '112.400'
  },
  {
    id: 3, entryId: 10515, plate: 'DEF-5678', vehicleModel: 'MB Actros',
    responsible: 'LUCAS MARTINS', provider: 'DETRAN', typeCode: 'multa', typeLabel: 'Multa',
    date: '18/10/2023', value: 3095.23, km: null
  }
]);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};
</script>

<style src="@/views/Expenses/expenses.css"></style>