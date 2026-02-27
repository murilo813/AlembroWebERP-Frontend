<template>
  <Transition name="toast-fade">
    <div v-if="show" class="toast-container" :class="type">
      <div class="toast-content">
        <i class="fa-solid fa-circle-exclamation toast-icon"></i>
        <span class="toast-message">{{ message }}</span>
      </div>
      <div class="toast-progress"></div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  message: String,
  type: { type: String, default: 'error' }
});
</script>

<style src="@/components/common/toast.css" scoped></style>