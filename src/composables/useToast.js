import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
  const toast = ({ title, description }) => {
    const id = Date.now()
    toasts.value.push({ id, title, description })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3000)
  }

  return { toast, toasts }
}

