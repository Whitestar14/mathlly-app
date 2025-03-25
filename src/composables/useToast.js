// useToast.js
import { ref } from 'vue';
import { useTimeoutFn, useThrottleFn } from '@vueuse/core';

const toasts = ref([]);

export function useToast() {
  // Create a throttled function for adding toasts
  const addToast = useThrottleFn((toastData) => {
    const id = Date.now();
    const zIndex = 50 - toasts.value.length;
    
    toasts.value.push({id, ...toastData, zIndex: Math.max(1, zIndex)});

    useTimeoutFn(() => {
      removeToast(id);
    }, toastData.duration || 5000);
  }, 500); // 500ms throttle

  // Main toast function
  const toast = (toastData) => {
    addToast(toastData);
  };
  
  // Function to remove a toast by ID
  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  return { toast, toasts, removeToast };
}