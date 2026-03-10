<template>
  <div class="expenses-container">
    <div class="expenses-wrapper">

      <header class="expenses-header">
        <div class="title-section">
          <h1 class="main-title">Módulo de Gastos</h1>
          <p class="subtitle">Conciliação de entradas pendentes.</p>
        </div>

        <button class="btn-secondary" @click="$router.push('/expenses')">
          <i class="fa-solid fa-arrow-left"></i> Voltar ao Hub
        </button>
      </header>

      <main class="expenses-content">
        <div class="pending-split-view">

          <aside class="pending-sidebar">
            <div class="sidebar-header">
              <h3>Entradas Pendentes</h3>
              <span class="badge-count">{{ PendingNotes.length }}</span>
            </div>

            <div v-if="isLoading"
              style="display: flex; flex: 1; align-items: center; justify-content: center; transform: scale(0.8);">
              <LoadingSpinner title="Carregando entradas..." subtitle="Sincronizando com o banco de dados" />
            </div>

            <div v-else-if="PendingNotes.length === 0" class="empty-sidebar-state">
              <i class="fa-solid fa-file-circle-check"></i>
              <p>Nenhuma entrada pendente para conciliação.</p>
            </div>

            <div v-else class="pending-list">
              <div v-for="note in PendingNotes" :key="note.id" class="pending-card-item"
                :class="{ 'active': selectedNote?.id === note.id }" @click="selectNote(note)">
                <div class="card-item-top">
                  <span class="item-id">#{{ note.id }}</span>
                  <span class="item-date"><i class="fa-regular fa-calendar"></i> {{ note.date }}</span>
                </div>
                <div class="item-supplier">{{ note.provider }}</div>
              </div>
            </div>
          </aside>

          <section class="pending-form-area">

            <div v-if="!selectedNote" class="empty-form-state">
              <i class="fa-solid fa-arrow-pointer empty-form-icon"></i>
              <h2>Selecione uma entrada</h2>
              <p>Clique em uma entrada na lista ao lado para iniciar o vínculo com a frota.</p>
            </div>

            <div v-else class="form-content-wrapper fade-in">

              <div class="selected-note-header">
                <div class="note-info-badge">
                  <span class="label">Entrada Selecionada</span>
                  <span class="value">#{{ selectedNote.id }}</span>
                </div>
                <h2 class="supplier-title">{{ selectedNote.provider }}</h2>
                <p class="date-subtitle">Emitida em {{ selectedNote.date }}</p>
              </div>

              <div class="form-body">

                <div class="form-row" style="position: relative; z-index: 999;">

                  <div class="form-group search-group">
                    <label>Veículo / Placa <span class="text-red">*</span></label>

                    <div class="search-wrapper" v-if="!linkForm.plate">
                      <input type="text" class="form-control uppercase-input" v-model="searchVehicleQuery"
                        @input="handleVehicleSearch" @focus="showVehicleDropdown = true"
                        @blur="hideVehicleDropdownWithDelay" placeholder="Buscar placa...">
                      <ul v-if="showVehicleDropdown && searchResultsVehicles.length > 0" class="dropdown-list">
                        <li v-for="vehicle in searchResultsVehicles" :key="vehicle.plate"
                          @click="selectVehicle(vehicle)">
                          <span class="fw-bold">{{ vehicle.plate }}</span> - {{
                            vehicle.vehicle }}
                        </li>
                      </ul>
                    </div>

                    <div v-else class="selected-client-badge emerald fw-bold">
                      <span><i class="fa-solid fa-car"></i> {{ linkForm.plate }} - {{
                        linkForm.vehicleModel }}</span>
                      <button class="btn-clear text-red" title="Trocar Veículo" @click="clearResponsibleAndVehicle">
                        <i class="fa-solid fa-times"></i>
                      </button>
                    </div>
                  </div>

                  <div class="form-group search-group">
                    <label>Responsável</label>

                    <div class="search-wrapper" v-if="!linkForm.responsible">
                      <input type="text" class="form-control" v-model="searchResponsibleQuery"
                        @input="handleResponsibleSearch" @focus="showResponsibleDropdown = true"
                        @blur="hideResponsibleDropdownWithDelay" placeholder="Buscar motorista...">
                      <ul v-if="showResponsibleDropdown && searchResultsResponsible.length > 0" class="dropdown-list">
                        <li v-for="resp in searchResultsResponsible" :key="resp.plate" @click="selectResponsible(resp)">
                          {{ resp.responsible_name }}
                        </li>
                      </ul>
                    </div>

                    <div v-else class="selected-client-badge emerald fw-bold">
                      <span><i class="fa-solid fa-user-check"></i> {{ linkForm.responsible
                      }}</span>
                      <button class="btn-clear text-red" title="Trocar Responsável" @click="clearResponsibleAndVehicle">
                        <i class="fa-solid fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="form-row" style="margin-top: 1rem; position: relative; z-index: 998;">

                  <div class="form-group">
                    <label>Tipo de Gasto <span class="text-red">*</span></label>
                    <CustomSelect v-model="linkForm.expenseType" :options="expenseTypeOptions"
                      placeholder="Selecione o tipo..." />
                  </div>

                  <div class="form-group">
                    <label>Quilometragem (KM)</label>
                    <div style="position: relative;">
                      <input type="text" class="form-control" placeholder="Apenas números..." v-model="linkForm.km"
                        @input="linkForm.km = linkForm.km.replace(/[^0-9]/g, '')">
                      <span
                        style="position: absolute; right: 1.5rem; color: #64748b; font-size: 1.2rem; top: 50%; transform: translateY(-50%); pointer-events: none;">km</span>
                    </div>
                  </div>
                </div>

                <div class="form-row" style="position: relative; z-index: 1;">
                  <div class="form-group">
                    <label>Observações (Opcional)</label>
                    <textarea class="form-control" rows="3" placeholder="Detalhes adicionais sobre o gasto..."
                      v-model="linkForm.observation"></textarea>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button class="btn-cancel" @click="selectedNote = null">Cancelar</button>
                <button class="btn-primary" @click="saveLink">
                  <i class="fa-solid fa-link"></i> Salvar Vínculo
                </button>
              </div>

            </div>
          </section>

        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from '@/utils/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import CustomSelect from '@/components/common/CustomSelect.vue';
import expensesService from '@/services/expensesService';

const { showToast } = useToast();
const isLoading = ref(true);
const selectedNote = ref(null);

const linkForm = ref({
  plate: '',
  vehicleModel: '',
  expenseType: '',
  km: '',
  responsible: '',
  observation: ''
});

const expenseTypeOptions = [
  { label: 'Combustível', value: 'combustivel' },
  { label: 'Manutenção/Peças', value: 'manutencao' },
  { label: 'Serviços/Lavagem', value: 'servicos' },
  { label: 'Outros', value: 'outros' }
];

const PendingNotes = ref([]);

let debounceTimer = null;

const searchVehicleQuery = ref('');
const showVehicleDropdown = ref(false);
const searchResultsVehicles = ref([]);

const handleVehicleSearch = () => {
  clearTimeout(debounceTimer);
  if (searchVehicleQuery.value.length < 2) {
    searchResultsVehicles.value = [];
    return;
  }

  debounceTimer = setTimeout(async () => {
    try {
      searchResultsVehicles.value = await expensesService.searchFleet(searchVehicleQuery.value, 'vehicle');
    } catch (error) {
      console.error("Erro na busca de veículo", error);
    }
  }, 400);
};

const selectVehicle = (item) => {
  linkForm.value.plate = item.plate;
  linkForm.value.vehicleModel = item.vehicle;

  if (item.responsible_name && !linkForm.value.responsible) {
    linkForm.value.responsible = item.responsible_name;
  }

  searchVehicleQuery.value = '';
  showVehicleDropdown.value = false;
};

const hideVehicleDropdownWithDelay = () => setTimeout(() => showVehicleDropdown.value = false, 200);

const searchResponsibleQuery = ref('');
const showResponsibleDropdown = ref(false);
const searchResultsResponsible = ref([]);

const handleResponsibleSearch = () => {
  clearTimeout(debounceTimer);
  if (searchResponsibleQuery.value.length < 3) {
    searchResultsResponsible.value = [];
    return;
  }

  debounceTimer = setTimeout(async () => {
    try {
      searchResultsResponsible.value = await expensesService.searchFleet(searchResponsibleQuery.value, 'responsible');
    } catch (error) {
      console.error("Erro na busca de responsável", error);
    }
  }, 400);
};

const selectResponsible = (item) => {
  linkForm.value.responsible = item.responsible_name;

  if (item.plate && !linkForm.value.plate) {
    linkForm.value.plate = item.plate;
    linkForm.value.vehicleModel = item.vehicle;
  }

  searchResponsibleQuery.value = '';
  showResponsibleDropdown.value = false;
};

const clearResponsibleAndVehicle = () => {
  linkForm.value.responsible = '';
  searchResponsibleQuery.value = '';

  linkForm.value.plate = '';
  linkForm.value.vehicleModel = '';
  searchVehicleQuery.value = '';
};

const hideResponsibleDropdownWithDelay = () => setTimeout(() => showResponsibleDropdown.value = false, 200);


onMounted(async () => {
  isLoading.value = true;
  try {
    const entries = await expensesService.getPendingNotes();

    PendingNotes.value = entries.map(entry => ({
      ...entry,
      date: entry.date ? entry.date.split('-').reverse().join('/') : ''
    }));
    
  } catch (error) {
    showToast("Erro ao carregar entradas pendentes do banco.", "error");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

const selectNote = (note) => {
  selectedNote.value = note;
  clearResponsibleAndVehicle();
  linkForm.value.expenseType = '';
  linkForm.value.km = '';
  linkForm.value.observation = '';
};

const saveLink = async () => {
  if (!linkForm.value.plate || !linkForm.value.expenseType) {
    showToast("Por favor, preencha o Veículo e o Tipo de Gasto.", "error");
    return;
  }

  const payload = {
    entryId: selectedNote.value.id,
    plate: linkForm.value.plate,
    responsible: linkForm.value.responsible,
    expenseType: linkForm.value.expenseType,
    km: linkForm.value.km,
    obs: linkForm.value.observation
  };

  try {
    await expensesService.registerExpense(payload);

    console.log("Sucesso! Vínculo salvo:", payload);
    showToast(`Entrada #${selectedNote.value.id} vinculada com sucesso!`, "success");

    PendingNotes.value = PendingNotes.value.filter(n => n.id !== selectedNote.value.id);
    selectedNote.value = null;

  } catch (error) {
    console.error("Erro ao salvar o vínculo:", error);
    showToast("Erro ao salvar o vínculo no banco de dados.", "error");
  }
};
</script>

<style src="@/views/Expenses/expenses.css" scoped></style>