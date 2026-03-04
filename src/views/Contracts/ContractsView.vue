<template>
  <div class="contracts-container">
    <div class="contracts-wrapper">

      <header class="contracts-header">
        <div class="title-section">
          <h1 class="main-title">Módulo de Gerenciamento de Contratos</h1>
          <p class="subtitle">Administração, edição e criação de novos contratos globais</p>
        </div>
        <button class="btn-primary" @click="openModal(null)">
          <i class="fa-solid fa-plus"></i> Novo Contrato
        </button>
      </header>

      <main class="contracts-content">
        <Transition name="fade-slide" mode="out-in">

          <div v-if="isLoading" class="empty-search-state" key="loading">
            <i class="fa-solid fa-circle-notch fa-spin empty-icon" style="color: #10b981; opacity: 1;"></i>
            <h2 style="color: #10b981;">Carregando contratos...</h2>
            <p>Sincronizando com o banco de dados</p>
          </div>

          <div v-else class="financial-lists" key="content">

            <div class="accordion-item" :class="{ 'open': activeAccordion === 'open' }">
              <div class="accordion-header" @click="toggleAccordion('open')">
                <h4 class="accordion-title">
                  <i class="fa-solid fa-file-signature" style="margin-right: 1rem;"></i> Contratos em Aberto
                </h4>
                <div class="accordion-right">
                  <span class="list-total fw-bold emerald">{{ formatCurrency(totalOpen) }}</span>
                  <i class="fa-solid fa-chevron-down toggle-icon"></i>
                </div>
              </div>
              <div class="accordion-body-wrapper">
                <div class="accordion-body">
                  <div class="table-responsive">
                    <table class="alembro-table contract-table">
                      <thead>
                        <tr>
                          <th class="col-id text-center">ID Cliente</th>
                          <th class="col-name text-left">Nome do Cliente</th>
                          <th class="col-doc text-center">Tipo Doc.</th>
                          <th class="col-date text-center">Geração</th>
                          <th class="col-date text-center">Vencimento</th>
                          <th class="col-money text-center">Valor Original</th>
                          <th class="col-money text-center">À Receber</th>
                          <th class="col-action text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="contract in openContracts" :key="contract.id">
                          <td class="text-center" style="position: relative;">
                            <i v-if="contract.obs" 
                              class="fa-solid fa-circle-exclamation obs-indicator emerald" 
                              title="Ver Observação"
                              @click="showObs(contract.obs)">
                            </i>
                            {{ contract.clientId }}
                          </td>
                          <td class="fw-bold">{{ contract.clientName }}</td>
                          <td class="text-center">
                            <span class="type-badge">{{ contract.contractType }}</span>
                          </td>
                          <td class="text-center">{{ formatDate(contract.generationDate) }}</td>
                          <td class="text-center" :class="{ 'text-red fw-bold': isOverdue(contract.dueDate) }">
                            {{ formatDate(contract.dueDate) }}
                          </td>
                          <td class="text-center">{{ formatCurrency(contract.originalValue) }}</td>
                          <td class="text-center fw-bold">{{ formatCurrency(contract.balanceDue) }}</td>
                          <td class="text-center">
                            <button class="action-btn edit-btn" title="Editar Contrato" @click="openModal(contract)">
                              <i class="fa-solid fa-pen"></i>
                            </button>
                          </td>
                        </tr>
                        <tr v-if="openContracts.length === 0">
                          <td colspan="8" class="text-center empty-data" style="padding: 3rem;">Nenhum contrato em
                            aberto.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div class="accordion-item" :class="{ 'open': activeAccordion === 'paid' }">
              <div class="accordion-header" @click="toggleAccordion('paid')">
                <h4 class="accordion-title">
                  <i class="fa-solid fa-check-double" style="margin-right: 1rem;"></i> Contratos Pagos / Finalizados
                </h4>
                <div class="accordion-right">
                  <span class="list-total fw-bold emerald">{{ formatCurrency(totalPaid) }}</span>
                  <i class="fa-solid fa-chevron-down toggle-icon"></i>
                </div>
              </div>
              <div class="accordion-body-wrapper">
                <div class="accordion-body">
                  <div class="table-responsive">
                    <table class="alembro-table contract-table">
                      <thead>
                        <tr>
                          <th class="col-id text-center">ID Cliente</th>
                          <th class="col-name text-left">Nome do Cliente</th>
                          <th class="col-doc text-center">Tipo Doc.</th>
                          <th class="col-date text-center">Geração</th>
                          <th class="col-date text-center">Vencimento</th>
                          <th class="col-money text-center">Valor Original</th>
                          <th class="col-money text-center">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="contract in paidContracts" :key="contract.id">
                          <td class="text-center" style="position: relative;">
                            <i v-if="contract.obs" 
                              class="fa-solid fa-circle-exclamation obs-indicator emerald" 
                              title="Ver Observação"
                              @click="showObs(contract.obs)">
                            </i>
                            {{ contract.clientId }}
                          </td>
                          <td class="fw-bold">{{ contract.clientName }}</td>
                          <td class="text-center">
                            <span class="type-badge">{{ contract.contractType }}</span>
                          </td>
                          <td class="text-center">{{ formatDate(contract.generationDate) }}</td>
                          <td class="text-center">{{ formatDate(contract.dueDate) }}</td>
                          <td class="text-center">{{ formatCurrency(contract.originalValue) }}</td>
                          <td class="text-center fw-bold emerald">Liquidado</td>
                        </tr>
                        <tr v-if="paidContracts.length === 0">
                          <td colspan="7" class="text-center empty-data" style="padding: 3rem;">Nenhum contrato
                            finalizado.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Transition>
      </main>

    </div>
  </div>
  <ContractModal :show="showModal" :contractData="selectedContract" @close="closeModal"
    @saved="() => fetchContracts(true)" />

  <Transition name="modal-fade">
    <div v-if="showObsModal" class="modal-overlay" @click.self="closeObsModal">
      <div class="modal-content modal-sm"> <header class="modal-header">
          <div class="modal-header-info">
            <h2 class="modal-title">Observações do Contrato</h2>
            <p class="modal-subtitle">Detalhes e anotações internas</p>
          </div>
          <button class="modal-close-btn" @click="closeObsModal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="modal-body">
          <div class="obs-content-box">
            <i class="fa-solid fa-quote-left quote-icon"></i>
            <p>{{ currentObsText }}</p>
          </div>
        </div>

        <footer class="modal-footer flex-end">
          <button class="btn-primary" @click="closeObsModal">Entendido</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import contractsService from '@/services/contractsService';
import ContractModal from '@/views/Contracts/ContractModal.vue';
import { useToast } from '@/utils/toast';

const { showToast } = useToast();

const contractsList = ref([]);
const totalOpen = ref(0);
const totalPaid = ref(0);
const isLoading = ref(true);
const showModal = ref(false);
const selectedContract = ref(null);
const showObsModal = ref(false);
const currentObsText = ref('')

const openModal = (contract) => {
  selectedContract.value = contract;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedContract.value = null;
};

const showObs = (obsText) => {
  currentObsText.value = obsText;
  showObsModal.value = true;
};

const closeObsModal = () => {
  showObsModal.value = false;
  currentObsText.value = '';
};

const fetchContracts = async (isSilent = false) => {
  if (!isSilent) {
    isLoading.value = true;
  }

  try {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      showToast("Usuário não autenticado.", "error");
      return;
    }

    const data = await contractsService.getContracts(userId);

    contractsList.value = data.contracts;
    totalOpen.value = data.totalOpen;
    totalPaid.value = data.totalPaid;

  } catch (error) {
    showToast("Erro ao carregar contratos.", "error");
  } finally {
    if (!isSilent) {
      isLoading.value = false;
    }
  }
};

onMounted(() => {
  fetchContracts();
});

const activeAccordion = ref('open');

const toggleAccordion = (section) => {
  activeAccordion.value = activeAccordion.value === section ? null : section;
};

const openContracts = computed(() => 
  contractsList.value.filter(c => c.status === 'aberto')
);

const paidContracts = computed(() => 
  contractsList.value.filter(c => c.status === 'pago')
);

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

<style src="@/views/Contracts/contracts.css" scoped></style>