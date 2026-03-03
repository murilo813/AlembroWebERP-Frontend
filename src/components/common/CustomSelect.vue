<template>
  <div class="custom-select" :class="{ 'is-open': isOpen }">
    <div class="select-trigger" @click="toggleDropdown">
      <span :class="{ 'placeholder': !modelValue }">
        {{ selectedLabel || placeholder }}
      </span>
      <i class="fa-solid fa-chevron-down arrow"></i>
    </div>
    
    <Transition name="fade-slide-down">
      <div v-if="isOpen" class="select-options">
        <div 
          v-for="(option, index) in options" 
          :key="index" 
          class="option-item"
          :class="{ 'selected': isSelected(option) }"
          @click="selectOption(option)"
        >
          {{ typeof option === 'object' ? option.label : option }}
        </div>
      </div>
    </Transition>
    
    <div v-if="isOpen" class="select-overlay" @click="isOpen = false"></div>
    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Selecione...' }
});

const emit = defineEmits(['update:modelValue']);
const isOpen = ref(false);

const selectedLabel = computed(() => {
  if (!props.modelValue) return null;
  const found = props.options.find(opt => {
    const val = typeof opt === 'object' ? opt.value : opt;
    return val === props.modelValue;
  });
  return typeof found === 'object' ? found.label : found;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const isSelected = (option) => {
  const val = typeof option === 'object' ? option.value : option;
  return props.modelValue === val;
};

const selectOption = (option) => {
  const val = typeof option === 'object' ? option.value : option;
  emit('update:modelValue', val);
  isOpen.value = false;
};
</script>

<style src="@/components/common/select.css" scoped></style>