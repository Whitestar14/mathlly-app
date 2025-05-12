<template>
  <BasePage
    :title="pageTitle"
    :showHeader="false"
    :showFooter="false"
    mainClass="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-white dark:bg-gray-800 transition-colors duration-300"
  >
    <div class="space-y-6 max-w-lg">
      <div class="relative">
        <h1 class="text-9xl font-bold text-gray-200 dark:text-gray-700 select-none">
          {{ visualErrorCode }}
        </h1>
        <div class="absolute inset-0 flex items-center justify-center">
          <kbd class="text-gray-600 font-medium px-3 py-2 text-xl dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
            {{ stylizedErrorCode }}
          </kbd>
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="text-xl font-medium text-gray-900 dark:text-gray-100">
          {{ errorTitleToDisplay }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ errorMessageToDisplay }}
        </p>

        <p v-if="isOffline && autoRetryActive" class="text-indigo-600 dark:text-indigo-400 text-sm mt-2">
          {{ networkStatus.online ? 'Reconnected! Attempting to reload...' : `Connection lost. Auto-retrying in ${autoRetryCountdownTime}s...` }}
          <Button @click="cancelAutomaticRetry" variant="link" size="sm" class="text-sm">Cancel Auto-Retry</Button>
        </p>
         <p v-if="manualRetryFeedbackMessage" class="text-blue-600 dark:text-blue-400 text-sm mt-2">
          {{ manualRetryFeedbackMessage }}
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 *:min-w-[120px]">
        <Button
          v-if="canAttemptRetry"
          variant="ghost"
          @click="handleManualRetry"
          :disabled="isManualRetrying"
          :aria-label="isOffline ? 'Retry Connection' : 'Try Loading Page Again'"
        >
          <template v-if="isManualRetrying && !isOffline"> <LoaderIcon class="h-4 w-4 animate-spin mr-2" />
            Retrying...
          </template>
          <template v-else>
            <RefreshCwIcon class="h-4 w-4" />
            {{ isOffline ? 'Retry Connection' : 'Try Again' }}
          </template>
        </Button>
        <Button
          variant="primary"
          @click="navigateToHome"
          :disabled="isManualRetrying"
        >
          <HomeIcon class="h-4 w-4" />
          Go Home
        </Button>
      </div>

      <div
        v-if="errorStackTraceToDisplay && !isOffline"
        class="mt-8 p-4 bg-gray-50 dark:bg-gray-900 ml-auto mr-auto max-w-[90vw] rounded-lg text-left overflow-auto border border-gray-200 dark:border-gray-700 max-h-60"
      >
        <details>
          <summary class="cursor-pointer text-indigo-600 dark:text-indigo-400 font-medium text-sm">
            Technical Details
          </summary>
          <pre class="mt-2 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{{ errorStackTraceToDisplay }}</pre>
        </details>
      </div>
    </div>
  </BasePage>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { HomeIcon, RefreshCwIcon, LoaderIcon } from 'lucide-vue-next'
import {
  clearRouteError,
  routeError, 
  networkStatus    
} from '@/router/errorHandler'
import { useToast } from '@/composables/useToast'
import BasePage from '@/components/base/BasePage.vue'
import Button from '@/components/base/BaseButton.vue'  

const { toast } = useToast();
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

// --- State for Manual Retry ---
const isManualRetrying = ref(false)
const manualRetryFeedbackMessage = ref('');

// --- State for Automatic Retry (Offline) ---
const autoRetryActive = ref(false)
const autoRetryCountdownTime = ref(0)
const AUTO_RETRY_INITIAL_DELAY_SECONDS = 30
let autoRetryTimerId = null

const isOffline = computed(() => !networkStatus.value)

// Gets the most relevant error object to inspect
const effectiveError = computed(() => {
  const err = props.error || routeError.value
  return err?.originalError || err
})

const extractedErrorMessage = computed(() => {
  const err = effectiveError.value
  if (err instanceof Error && err.message) {
    return err.message
      .replace(/^(Error: )?Failed to fetch dynamically imported module:.*/i, 'Could not load page resources.')
      .replace(/^(Error: )?error loading dynamically imported module/i, 'Could not load page components.')
      .replace(/\$\$Original error:.*?\$\$/g, '') // Remove custom original error markers if any
      .trim()
  }
  if (typeof err === 'string') {
    return err
  }
  return isOffline.value ? 'Internet connection unavailable.' : 'An unexpected error occurred.'
})

const errorStackTraceToDisplay = computed(() => {
  const err = effectiveError.value
  return err instanceof Error && err.stack ? err.stack : ''
})

const pageTitle = computed(() => {
  if (isOffline.value) return 'Connection Issue'
  if (props.isRouteError) return 'Error Loading Page'
  if (props.isGlobalError) return 'Application Error'
  return 'An Error Occurred'
})

const visualErrorCode = computed(() => {
  if (isOffline.value) return 'OFF'

  const err = effectiveError.value
  if (!err) return props.isRouteError ? '503' : '500' // Default if no specific error

  const msg = (err.message || '').toLowerCase()
  if (msg.includes('timeout')) return '408'
  if (msg.includes('failed to fetch') || msg.includes('load chunk') || msg.includes('dynamically imported module')) return '503'
  if (msg.includes('not found') || err.name === 'NotFoundError') return '404'
  if (msg.includes('permission') || msg.includes('forbidden')) return '403'
  if (msg.includes('unauthorized')) return '401'
  return '500' // Default server/client error
})

const stylizedErrorCode = computed(() => {
  if (isOffline.value) return '{connection//lost}'
  switch (visualErrorCode.value) {
    case '404': return '{not//found}'
    case '401': return '{not//authorized}'
    case '403': return '{access//denied}'
    case '408': return '{request//timeout}'
    case '503': return '{service//issue}'
    case '500':
    default: return '{system//error}'
  }
})

const errorTitleToDisplay = computed(() => {
  if (isOffline.value) return 'You are Offline'
  switch (visualErrorCode.value) {
    case '404': return 'Page Not Found'
    case '401': return 'Authentication Required'
    case '403': return 'Access Forbidden'
    case '408': return 'Request Timed Out'
    case '503': return 'Service Temporarily Unavailable'
    case '500':
    default:
      if (extractedErrorMessage.value &&
          !extractedErrorMessage.value.toLowerCase().includes('unknown error') &&
          !extractedErrorMessage.value.toLowerCase().includes('error occurred') &&
          extractedErrorMessage.value.length < 50 &&
          !extractedErrorMessage.value.includes('(')) {
        return extractedErrorMessage.value
      }
      return props.isGlobalError ? 'Application Error' : 'Something Went Wrong'
  }
})

const errorMessageToDisplay = computed(() => {
  if (isOffline.value) return 'Please check your internet connection. We will attempt to reconnect automatically.'

  switch (visualErrorCode.value) {
    case '404':
      return `We couldn't find the page at ${props.path ? `\`${props.path}\`` : 'the requested URL'}. Please check the address or go back.`
    case '401':
      return 'You need to be logged in or have the correct credentials to access this page.'
    case '403':
      return "You don't have the necessary permissions to view this resource."
    case '408':
      return 'The server took too long to respond. This might be a temporary issue. Please try again in a few moments.'
    case '503':
      return 'The service required for this page is currently unavailable or overloaded. Please try again shortly.'
    case '500':
    default:
      if (extractedErrorMessage.value && extractedErrorMessage.value !== errorTitleToDisplay.value) {
        return extractedErrorMessage.value
      }
      return 'An unexpected technical issue occurred. If this problem persists, please contact support or try again later.'
  }
})

const canAttemptRetry = computed(() => {
  return props.isRouteError || isOffline.value
})

const navigateToHome = () => {
  if (isManualRetrying.value) return
  cancelAutomaticRetry()
  clearRouteError()
  router.push('/').catch((err) => {
    console.error('ErrorFallback: Failed to navigate home:', err)
  })
}

async function handleManualRetry() {
  if (isManualRetrying.value) return

  isManualRetrying.value = true
  manualRetryFeedbackMessage.value = ''; 
  cancelAutomaticRetry()

  if (isOffline.value) {
    toast({
      type: 'warning',
      message: 'Still offline. Please check your connection',
    })
    setTimeout(() => {
        isManualRetrying.value = false;
    }, 1500);
    return
  }

  await new Promise((resolve) => setTimeout(resolve, 300))
  clearRouteError()

  try {
    const targetPath = props.path || router.currentRoute.value.redirectedFrom?.fullPath || router.options.history.state.back || '/'
    await router.replace(targetPath)
  } catch (err) {
    console.error('ErrorFallback: Error during manual retry navigation attempt:', err)
  } finally {
    setTimeout(() => {
      isManualRetrying.value = false
    }, 200)
  }
}

// Start the automatic retry process when offline
function startAutomaticRetry() {
  if (!isOffline.value || autoRetryActive.value) return;

  autoRetryActive.value = true
  autoRetryCountdownTime.value = AUTO_RETRY_INITIAL_DELAY_SECONDS
  manualRetryFeedbackMessage.value = '';

  if (autoRetryTimerId) clearInterval(autoRetryTimerId)

  autoRetryTimerId = setInterval(() => {
    if (!isOffline.value) {
      cancelAutomaticRetry()
      if (props.isRouteError || routeError.value) {
         manualRetryFeedbackMessage.value = 'Reconnected! Attempting to reload...';
         handleManualRetry()
      }
      return
    }

    if (autoRetryCountdownTime.value <= 1) {
      cancelAutomaticRetry() 
      handleManualRetry() 
    } else {
      autoRetryCountdownTime.value--
    }
  }, 1000)
}

function cancelAutomaticRetry() {
  if (autoRetryTimerId) {
    clearInterval(autoRetryTimerId)
    autoRetryTimerId = null
  }
  autoRetryActive.value = false
  autoRetryCountdownTime.value = 0
}

watch(networkStatus, (currentStatus, previousStatus) => {
  const isNowOnline = currentStatus; // Assuming networkStatus directly gives boolean
  const wasPreviouslyOnline = previousStatus;

  manualRetryFeedbackMessage.value = ''; // Clear feedback on any network change

  if (!isNowOnline) {
    if (props.isRouteError || props.isGlobalError || routeError.value) {
        startAutomaticRetry()
    }
  } else {
    cancelAutomaticRetry()
    if (wasPreviouslyOnline === false && (props.isRouteError || routeError.value)) {
      manualRetryFeedbackMessage.value = 'Connection restored! Attempting to reload page...';
      handleManualRetry()
    }
  }
}, { immediate: false }) 

onUnmounted(() => {
  cancelAutomaticRetry()
})
</script>