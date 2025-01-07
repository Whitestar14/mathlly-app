<script setup>
import { useToast } from '@/composables/useToast'
import { XIcon } from 'lucide-vue-next'

const { toasts } = useToast()
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm w-full"
    >
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">
            {{ toast.title }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ toast.description }}
          </p>
        </div>
        <button 
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" 
          @click="toasts = toasts.filter(t => t.id !== toast.id)"
        >
          <XIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
  

