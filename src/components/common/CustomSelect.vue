<template>
  <div class="custom-select" :class="{ 'is-open': isOpen }">
    <div class="select-trigger" @click="toggleDropdown">
      <span :class="{ 'placeholder': !modelValue }">
        {{ modelValue || placeholder }}
      </span>
      <i class="fa-solid fa-chevron-down arrow"></i>
    </div>
    
    <Transition name="fade-slide-down">
      <div v-if="isOpen" class="select-options">
        <div 
          v-for="(option, index) in options" 
          :key="index" 
          class="option-item"
          :class="{ 'selected': modelValue === option }"
          @click="selectOption(option)"
        >
          {{ option }}
        </div>
      </div>
    </Transition>
    
    <div v-if="isOpen" class="select-overlay" @click="isOpen = false"></div>
    
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Selecione...'
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  emit('update:modelValue', option);
  isOpen.value = false;
};
</script>

<style src="@/components/common/select.css" scoped></style>