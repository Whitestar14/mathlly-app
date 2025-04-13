<template>
  <BasePage title="Something went wrong" :showBackButton="true" :showFooter="true" mainClass="">
    <div
      class="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-white dark:bg-gray-800 transition-colors duration-300">
      <div class="space-y-6 max-w-lg">
        <!-- Error Code with Logo -->
        <div class="relative">
          <h1 class="text-9xl font-bold text-gray-200 dark:text-gray-700">
            {{ isOffline ? 'OFF' : '500' }}
          </h1>
        </div>

        <!-- Message -->
        <div class="space-y-2">
          <h2 class="text-xl font-medium text-gray-900 dark:text-gray-100">
            {{
              isOffline
                ? 'You are offline'
                : error
                  ? 'An error occurred'
                  : 'Page failed to load'
            }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{
              isOffline
                ? 'Please check your internet connection and try again.'
                : error?.message ||
                'Something went wrong while loading this page.'
            }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 *:min-w-[120px]">
          <Button variant="ghost" class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            @click="retry">
            <RefreshCwIcon class="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="primary" @click="router.push('/')">
            <HomeIcon class="h-4 w-4" />
            Home
          </Button>
        </div>

        <!-- Technical Details -->
        <div v-if="error?.stack && !isOffline"
          class="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-left overflow-auto border border-gray-200 dark:border-gray-700">
          <details>
            <summary class="cursor-pointer text-indigo-600 dark:text-indigo-400 font-medium">
              Technical Details
            </summary>
            <pre class="mt-2 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ error.stack }}</pre>
          </details>
        </div>
      </div>
    </div>
  </BasePage>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HomeIcon, RefreshCwIcon } from 'lucide-vue-next'
import BasePage from '@/components/base/BasePage.vue'
import Button from '@/components/base/BaseButton.vue'
import { usePageTitle } from '@/composables/usePageTitle'

const props = defineProps({
  error: {
    type: Error,
    default: null
  },
  path: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const isOffline = ref(false)

// Set the page title
usePageTitle('Something went wrong')

onMounted(() => {
  // Check if we're offline
  isOffline.value = !navigator.onLine

  // Listen for online/offline events
  window.addEventListener('online', () => { isOffline.value = false })
  window.addEventListener('offline', () => { isOffline.value = true })
})

const retry = () => {
  if (props.path) {
    router.replace(props.path)
  } else if (router.options.history.state.back) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>