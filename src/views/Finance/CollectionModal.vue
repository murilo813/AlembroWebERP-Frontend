<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content modal-sm">
        <header class="modal-header">
          <div class="modal-header-info">
            <h2 class="modal-title">Novo Atendimento</h2>
            <p class="modal-subtitle">Registrar histórico para o grupo: {{ groupInfo?.responsible }}</p>
          </div>
          <button class="modal-close-btn" @click="$emit('close')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="modal-body form-body">
          <div class="form-group">
            <label>Vincular ao Cliente</label>
            <CustomSelect v-model="form.client" :options="clients.map(c => ({ value: c.id, label: c.name }))"
              placeholder="Selecione um cliente do grupo..." />
          </div>
          <div class="form-group">
            <label>Observação</label>
            <textarea v-model="form.obs" class="form-control" rows="4"
              placeholder="Detalhes do atendimento realizado..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Data do Atendimento</label>
              <input type="date" v-model="form.date" class="form-control" />
            </div>
            <div class="form-group">
              <label>Agendar Retorno / Notificação</label>
              <input type="date" v-model="form.scheduleDate" class="form-control" />
            </div>
          </div>
        </div>

        <footer class="modal-footer flex-end">
          <button class="btn-cancel" @click="$emit('close')" :disabled="isSaving">Cancelar</button>
          <button class="btn-primary" @click="handleSave" :disabled="isSaving">
            <i v-if="isSaving" class="fa-solid fa-circle-notch fa-spin"></i>
            <span v-else>Registrar</span>
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import financeService from '@/services/financeService';
import CustomSelect from '@/components/common/CustomSelect.vue';
import { useToast } from '@/utils/toast';

const props = defineProps({
  show: Boolean,
  groupInfo: Object,
  clients: Array
});

const emit = defineEmits(['close', 'saved']);
const { showToast } = useToast();

const isSaving = ref(false);
const form = ref({ client: '', obs: '', date: '', scheduleDate: '' });

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    const today = new Date().toISOString().split('T')[0];
    form.value = { client: '', obs: '', date: today, scheduleDate: '' };
  }
});

const handleSave = async () => {
  if (!form.value.client || !form.value.obs || !form.value.date) {
    showToast("Preencha todos os campos obrigatórios!", "error");
    return;
  }

  isSaving.value = true;
  const loggedUserId = localStorage.getItem('userId');
  const loggedCompanyId = localStorage.getItem('companyId');
  const loggedUserName = localStorage.getItem('nomenclature') || "Usuário";

  const payload = {
    userId: Number(loggedUserId),
    companyId: Number(loggedCompanyId),
    observation: form.value.obs,
    date: form.value.date,
    scheduleDate: form.value.scheduleDate || null
  };

  try {
    const selectedClientId = form.value.client;
    await financeService.saveObservation(selectedClientId, payload);

    const clientNameSelected = props.clients.find(c => c.id === selectedClientId)?.name || "Cliente";

    emit('saved', {
      id: Date.now(),
      clientName: clientNameSelected,
      content: payload.observation,
      date: payload.date,
      scheduleDate: payload.scheduleDate,
      userName: loggedUserName
    });

    showToast("Atendimento registrado com sucesso!", "success");
    emit('close');
  } catch (error) {
    showToast("Erro ao salvar atendimento. Tente novamente.", "error");
    console.error(error);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style src="@/views/Finance/finance.css" scoped></style>