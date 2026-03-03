<template>
  <Transition name="toast-fade">
    <div v-if="show" class="toast-container" :class="type">
      <div class="toast-content">
        <i :class="['fa-solid', iconClass, 'toast-icon']"></i>
        <span class="toast-message">{{ message }}</span>
      </div>
      <div class="toast-progress"></div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  message: String,
  type: { type: String, default: 'error' }
});

const iconClass = computed(() => {
  return props.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
});
</script>

<style src="@/components/common/toast.css" scoped></style>