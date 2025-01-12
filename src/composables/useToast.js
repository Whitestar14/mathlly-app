// useToast.js
import { ref } from 'vue';

const toasts = ref([]);

export function useToast() {
  const toast = ({ title, description, duration = 5000 }) => { // Default duration 5 seconds
    const id = Date.now();
    toasts.value.push({ id, title, description });

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    }, duration);
  };

  return { toast, toasts };
}