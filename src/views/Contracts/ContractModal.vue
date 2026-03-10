<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <header class="modal-header">
          <div class="modal-header-info">
            <h2 class="modal-title">{{ isEditing ? 'Editar Contrato' : 'Novo Contrato' }}</h2>
            <p class="modal-subtitle">
              {{ isEditing ? 'Atualizando dados do documento' : 'Criar novo documento financeiro global' }}
            </p>
          </div>
          <button class="modal-close-btn" @click="$emit('close')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="modal-body form-body">

          <div class="form-group search-group" v-if="!isEditing">
            <label>Vincular ao Cliente <span class="text-red">*</span></label>
            <div class="search-wrapper" v-if="!form.clientId">
              <input type="text" class="form-control" v-model="clientSearch" @input="handleSearch"
                placeholder="Digite o nome ou ID para buscar..." />
              <ul v-if="searchResults.length" class="dropdown-list">
                <li v-for="c in searchResults" :key="c.id" @click="selectClient(c)">
                  <span class="fw-bold">{{ c.id }}</span> - {{ c.name }}
                </li>
              </ul>
            </div>
            <div v-else class="selected-client-badge emerald fw-bold">
              <span><i class="fa-solid fa-user-check"></i> {{ selectedClientName }}</span>
              <button class="btn-clear text-red" title="Trocar Cliente" @click="clearClient">
                <i class="fa-solid fa-times"></i>
              </button>
            </div>
          </div>

          <div class="form-group" v-else>
            <label>Cliente Vinculado</label>
            <input type="text" class="form-control disabled-input" :value="contractData?.clientName" disabled />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Tipo de Contrato <span class="text-red">*</span></label>
              <input type="text" v-model="form.contractType"
                @input="form.contractType = form.contractType.toUpperCase()" class="form-control uppercase-input"
                placeholder="Ex: PDD, VENDA FUTURA, CPR..." />
            </div>

            <div class="form-group" v-if="isEditing">
              <label>Status</label>
              <CustomSelect 
                v-model="form.status" 
                :options="statusOptions" 
                placeholder="Selecione o status..."
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Data de Geração</label>
              <input type="date" v-model="form.generationDate" class="form-control" />
            </div>
            <div class="form-group">
              <label>Data de Vencimento</label>
              <input type="date" v-model="form.dueDate" class="form-control" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valor Original <span class="text-red">*</span></label>
              <input type="text" class="form-control" v-model="displayOriginalValue" @focus="onFocusMoney('original')"
                @blur="onBlurMoney('original')" placeholder="R$ 0,00" />
            </div>
            <div class="form-group">
              <label>Saldo Devedor <span class="text-red">*</span></label>
              <input type="text" class="form-control" v-model="displayBalanceDue" @focus="onFocusMoney('balance')"
                @blur="onBlurMoney('balance')" placeholder="R$ 0,00" />
            </div>
          </div>

          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="form.obs" class="form-control" rows="3"
              placeholder="Detalhes do contrato, número de registro, etc..."></textarea>
          </div>
        </div>

        <footer class="modal-footer flex-end">
          <button class="btn-cancel" @click="$emit('close')" :disabled="isSaving">Cancelar</button>
          <button class="btn-primary" @click="handleSave" :disabled="isSaving">
            <i v-if="isSaving" class="fa-solid fa-circle-notch fa-spin"></i>
            <span v-else><i class="fa-solid fa-save"></i> Salvar</span>
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import contractsService from '@/services/contractsService';
import financeService from '@/services/financeService';
import CustomSelect from '@/components/common/CustomSelect.vue'; 
import { useToast } from '@/utils/toast';

const props = defineProps({
  show: Boolean,
  contractData: Object
});

const emit = defineEmits(['close', 'saved']);
const { showToast } = useToast();

const isSaving = ref(false);
const isEditing = computed(() => !!props.contractData);

const clientSearch = ref('');
const searchResults = ref([]);
const selectedClientName = ref('');
let debounceTimer = null;

const displayOriginalValue = ref('');
const displayBalanceDue = ref('');

const statusOptions = [
  { label: 'Aberto', value: 'aberto' },
  { label: 'Pago', value: 'pago' }
];

const form = ref({
  clientId: null,
  contractType: '',
  generationDate: '',
  dueDate: '',
  originalValue: 0,
  balanceDue: 0,
  obs: '',
  status: 'aberto'
});

const formatToBRL = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

const parseFromBRL = (str) => {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  const cleanStr = str.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(cleanStr) || 0;
};

const onFocusMoney = (field) => {
  if (field === 'original') displayOriginalValue.value = form.value.originalValue || '';
  if (field === 'balance') displayBalanceDue.value = form.value.balanceDue || '';
};

const onBlurMoney = (field) => {
  if (field === 'original') {
    form.value.originalValue = parseFromBRL(displayOriginalValue.value);
    displayOriginalValue.value = formatToBRL(form.value.originalValue);
  }
  if (field === 'balance') {
    form.value.balanceDue = parseFromBRL(displayBalanceDue.value);
    displayBalanceDue.value = formatToBRL(form.value.balanceDue);
  }
};

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    if (props.contractData) {
      form.value = {
        clientId: props.contractData.clientId,
        contractType: props.contractData.contractType || '',
        generationDate: props.contractData.generationDate || '',
        dueDate: props.contractData.dueDate || '',
        originalValue: Number(props.contractData.originalValue) || 0,
        balanceDue: Number(props.contractData.balanceDue) || 0,
        obs: props.contractData.obs || '',
        status: props.contractData.status || 'aberto'
      };
      selectedClientName.value = props.contractData.clientName;
      displayOriginalValue.value = formatToBRL(form.value.originalValue);
      displayBalanceDue.value = formatToBRL(form.value.balanceDue);
    } else {
      const today = new Date().toISOString().split('T')[0];
      form.value = {
        clientId: null, contractType: '', generationDate: today,
        dueDate: '', originalValue: 0, balanceDue: 0, obs: '', status: 'aberto'
      };
      clientSearch.value = '';
      searchResults.value = [];
      selectedClientName.value = '';
      displayOriginalValue.value = '';
      displayBalanceDue.value = '';
    }
  }
});

const handleSearch = async () => {
  clearTimeout(debounceTimer);
  if (clientSearch.value.length < 3) {
    searchResults.value = [];
    return;
  }
  debounceTimer = setTimeout(async () => {
    try {
      searchResults.value = await financeService.searchClients(clientSearch.value);
    } catch (error) {
      console.error("Erro ao buscar clientes", error);
    }
  }, 400);
};

const selectClient = (client) => {
  form.value.clientId = client.id;
  selectedClientName.value = `${client.id} - ${client.name}`;
  searchResults.value = [];
};

const clearClient = () => {
  form.value.clientId = null;
  selectedClientName.value = '';
  clientSearch.value = '';
};

const handleSave = async () => {
  form.value.originalValue = parseFromBRL(displayOriginalValue.value);
  form.value.balanceDue = parseFromBRL(displayBalanceDue.value);

  if (!form.value.clientId || !form.value.contractType || form.value.originalValue === 0) {
    showToast("Preencha os campos obrigatórios (Cliente, Tipo e Valor).", "error");
    return;
  }

  isSaving.value = true;

  try {
    if (isEditing.value) {
      const payload = {};
      const original = props.contractData;

      if (form.value.contractType !== original.contractType) payload.contractType = form.value.contractType;
      if (form.value.generationDate !== original.generationDate) payload.generationDate = form.value.generationDate || null;
      if (form.value.dueDate !== original.dueDate) payload.dueDate = form.value.dueDate || null;
      if (Number(form.value.originalValue) !== Number(original.originalValue)) payload.originalValue = form.value.originalValue;
      if (Number(form.value.balanceDue) !== Number(original.balanceDue)) payload.balanceDue = form.value.balanceDue;
      if (form.value.obs !== original.obs) payload.obs = form.value.obs || null;
      if (form.value.status !== original.status) payload.status = form.value.status;

      if (Object.keys(payload).length === 0) {
        showToast("Nenhuma alteração detectada.", "info");
        isSaving.value = false;
        emit('close');
        return;
      }

      await contractsService.updateContract(original.id, payload);
      showToast("Contrato atualizado!", "success");
    } else {
      const payload = {
        clientId: form.value.clientId,
        contractType: form.value.contractType,
        generationDate: form.value.generationDate || null,
        dueDate: form.value.dueDate || null,
        originalValue: form.value.originalValue,
        balanceDue: form.value.balanceDue,
        obs: form.value.obs || null
      };

      await contractsService.createContract(payload);
      showToast("Contrato criado com sucesso!", "success");
    }

    emit('saved');
    emit('close');
  } catch (error) {
    showToast("Erro ao salvar contrato.", "error");
    console.error(error);
  } finally {
    isSaving.value = false;
  }
};
</script>
<style src="@/views/Contracts/contracts.css" scoped></style>