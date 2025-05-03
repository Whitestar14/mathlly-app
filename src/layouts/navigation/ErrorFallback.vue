<template>
  <BasePage title="Something went wrong" :showHeader="false"
    mainClass="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-white dark:bg-gray-800 transition-colors duration-300">
    <div class="space-y-6 max-w-lg">
      <h1 class="text-sm uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400">
        {{ headerTitle }}
      </h1>

      <div class="relative">
        <h1 class="text-9xl font-bold text-gray-200 dark:text-gray-700 select-none">
          {{ isOffline ? 'OFF' : errorCode }}
        </h1>
        <div class="absolute inset-0 flex items-center justify-center">
          <BaseLogo type="text" size="md" />
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="text-xl font-medium text-gray-900 dark:text-gray-100">
          {{ messageTitle }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ messageBody }}
        </p>

        <p v-if="isOffline && autoRetryEnabled" class="text-indigo-600 dark:text-indigo-400 text-sm mt-2">
          Trying to reconnect in {{ autoRetryCountdown }} seconds...
          <Button @click="cancelAutoRetry" variant="link" size="sm" class="text-sm">Cancel</Button>
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 *:min-w-[120px]">
        <Button v-if="isRouteError || isOffline" variant="ghost"
          class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600" @click="retry"
          :disabled="isRetrying || (isOffline && !networkStatus)" :aria-label="isOffline ? 'Retry Connection' : 'Try Loading Page Again'
            ">
          <template v-if="isRetrying">
            <LoaderIcon class="h-4 w-4 animate-spin" />
            Retrying...
          </template>
          <template v-else>
            <RefreshCwIcon class="h-4 w-4" />
            {{ isOffline ? 'Retry Connection' : 'Try Again' }}
          </template>
        </Button>
        <Button variant="primary" @click="goHome" :disabled="isRetrying">
          <HomeIcon class="h-4 w-4" />
          Go Home
        </Button>
      </div>

      <div v-if="errorStack && !isOffline"
        class="mt-8 p-4 bg-gray-50 dark:bg-gray-900 ml-auto mr-auto max-w-[90vw] rounded-lg text-left overflow-auto border border-gray-200 dark:border-gray-700 max-h-60">
        <details>
          <summary class="cursor-pointer text-indigo-600 dark:text-indigo-400 font-medium text-sm">
            Technical Details
          </summary>
          <pre
            class="mt-2 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{{ errorStack }}</pre>
        </details>
      </div>
    </div>
  </BasePage>
</template>

<script setup>
import { ref, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { HomeIcon, RefreshCwIcon, LoaderIcon } from 'lucide-vue-next'
import {
  clearRouteError,
  networkStatus,
  routeError,
} from '@/router/errorHandler'
import BasePage from '@/components/base/BasePage.vue'
import Button from '@/components/base/BaseButton.vue'
import BaseLogo from '@/components/base/TextLogo.vue'

const props = defineProps({
  error: {
    type: [Error, Object, String],
    default: null,
  },
  path: {
    type: String,
    default: '',
  },
  isRouteError: {
    type: Boolean,
    default: false,
  },
  isGlobalError: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const isRetrying = ref(false)
const autoRetryEnabled = ref(false)
const autoRetryCountdown = ref(0)
const AUTO_RETRY_DELAY_SECONDS = 30

let autoRetryTimer = null

const isOffline = computed(() => !networkStatus.value)

const actualError = computed(() => {
  const err = props.error || routeError.value
  return err?.originalError || err
})

const errorMessage = computed(() => {
  const err = actualError.value
  if (err instanceof Error && err.message) {
    return err.message.replace(/\(Original error:.*?\)/g, '').trim()
  }
  if (typeof err === 'string') {
    return err
  }
  return isOffline.value
    ? 'Connection unavailable.'
    : 'An unknown error occurred.'
})

const errorStack = computed(() => {
  const err = actualError.value
  return err instanceof Error && err.stack ? err.stack : ''
})

const headerTitle = computed(() => {
  if (isOffline.value) return 'Connection Issue'
  if (props.isRouteError) return 'Error Loading Page'
  if (props.isGlobalError) return 'Application Error'
  return 'An Error Occurred'
})

const errorCode = computed(() => {
  if (isOffline.value) return 'OFF'

  const err = actualError.value
  if (!err) return props.isRouteError ? '503' : '500'

  const msg = (err.message || '').toLowerCase()
  if (msg.includes('timeout')) return '408' // Request Timeout
  if (msg.includes('failed to fetch') || msg.includes('load chunk'))
    return '503' // Service Unavailable (can't load resources)
  if (msg.includes('not found') || err.name === 'NotFoundError') return '404' // Not Found
  if (msg.includes('permission') || msg.includes('forbidden')) return '403' // Forbidden
  if (msg.includes('unauthorized')) return '401' // Unauthorized
  return '500'
})

const messageTitle = computed(() => {
  if (isOffline.value) return 'You are offline';
  if (
    errorMessage.value &&
    !errorMessage.value.includes('(') &&
    errorMessage.value.length < 50
  ) {
    return errorMessage.value
  }
  if (props.isRouteError) return 'Page load failed';
  if (props.isGlobalError) return 'Application malfunctioned';
  return 'Something went wrong';
});

const messageBody = computed(() => {
  if (isOffline.value)
    return 'Please check your internet connection. Auto-retry is enabled.'
  if (errorCode.value === '404')
    return `We couldn't find the page at ${props.path ? `\`${props.path}\`` : 'the requested URL'
      }.`
  if (errorCode.value === '503')
    return 'The resources needed for this page could not be loaded. Please check your connection or try again shortly.'
  if (errorMessage.value && errorMessage.value !== messageTitle.value)
    return errorMessage.value // Show detailed msg if different from title
  return 'An unexpected issue occurred. Please try again or contact support if the problem persists.'
})

const goHome = () => {
    if (isRetrying.value) return
    cancelAutoRetry()
    clearRouteError()
    router.push('/').catch((err) => {
      console.error('Failed to navigate home:', err)
    })
}

async function retry() {
  if (isRetrying.value || !networkStatus.value) {
    if (!networkStatus.value) {
      console.log('Retry skipped: still offline.')
      startAutoRetryCountdown()
    }
    return
  }

  isRetrying.value = true
  cancelAutoRetry()

  await new Promise((resolve) => setTimeout(resolve, 500))
  clearRouteError()

  try {
    const targetPath = props.path || router.options.history.state.back
    console.log(`Retrying navigation to: ${targetPath || '/'}`)

    if (targetPath && targetPath !== '/error') {
      await router.replace(targetPath)
    } else {
      await router.replace('/')
    }
  } catch (err) {
    console.error('Error during retry navigation attempt:', err)
    isRetrying.value = false
  } finally {
    setTimeout(() => {
      isRetrying.value = false
    }, 200)
  }
}

function startAutoRetryCountdown() {
  if (!isOffline.value || autoRetryEnabled.value) return

  console.log(`Starting auto-retry countdown (${AUTO_RETRY_DELAY_SECONDS}s)`)
  autoRetryEnabled.value = true
  autoRetryCountdown.value = AUTO_RETRY_DELAY_SECONDS

  if (autoRetryTimer) clearInterval(autoRetryTimer)

  autoRetryTimer = setInterval(() => {
    if (!isOffline.value) {
      cancelAutoRetry()
      retry()
      return
    }

    if (autoRetryCountdown.value <= 1) {
      cancelAutoRetry()
      console.log('Auto-retry countdown finished. Attempting retry...')
      retry()
    } else {
      autoRetryCountdown.value--
    }
  }, 1000)
}

function cancelAutoRetry() {
  if (autoRetryTimer) {
    clearInterval(autoRetryTimer)
    autoRetryTimer = null
  }
  autoRetryEnabled.value = false
  autoRetryCountdown.value = 0
}

watch(networkStatus, (isNowOnline, wasOnline) => {
  if (!isNowOnline) {
    startAutoRetryCountdown()
  } else {
    cancelAutoRetry()
    if (wasOnline === false && (props.isRouteError || routeError.value)) {
      console.log('Came back online, attempting automatic retry.')
      retry()
    }
  }
})

if (isOffline.value) {
  startAutoRetryCountdown()
}

onUnmounted(() => {
  cancelAutoRetry()
})
</script>
