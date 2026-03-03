import { ref } from 'vue';

const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

export function useToast() {
  const showToast = (message, type = 'success') => {
    toast.value.show = false;
    
    setTimeout(() => {
      toast.value = { show: true, message, type };
      
      setTimeout(() => {
        toast.value.show = false;
      }, 3000);
    }, 10);
  };

  return { toast, showToast };
}