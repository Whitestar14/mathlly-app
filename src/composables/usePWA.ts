import { ref, computed, type Ref } from 'vue'
import { useIntervalFn, useLocalStorage } from '@vueuse/core'
import { useVersionStore } from '@/stores/version'
import { useSettingsStore } from '@/stores/settings'

// Import the virtual module - this should work now with devOptions enabled
let useRegisterSW: any
let updateServiceWorker: any

// Dynamically import the PWA register module
async function initializePWA() {
  try {
    if (import.meta.env.DEV) {
      // In development, check if the virtual module is available
      const pwaModule = await import('virtual:pwa-register/vue')
      useRegisterSW = pwaModule.useRegisterSW
    } else {
      // In production, it should definitely be available
      const pwaModule = await import('virtual:pwa-register/vue')
      useRegisterSW = pwaModule.useRegisterSW
    }
  } catch (error) {
    console.warn('[PWA] Virtual module not available, using fallback registration')
    useRegisterSW = createFallbackRegisterSW()
  }
}

// Fallback registration for when virtual module isn't available
function createFallbackRegisterSW() {
  return (callbacks: any = {}) => {
    const needRefresh = ref(false)
    const offlineReady = ref(false)

    const updateServiceWorker = async (reloadPage = true) => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration?.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            if (reloadPage) {
              window.location.reload()
            }
          }
        } catch (error) {
          console.error('[PWA] Failed to update service worker:', error)
          if (reloadPage) {
            window.location.reload()
          }
        }
      }
    }

    // Only register in production or when sw.js is actually available
    if ('serviceWorker' in navigator && (import.meta.env.PROD || import.meta.env.DEV)) {
      // Check if sw.js exists before registering
      fetch('/sw.js', { method: 'HEAD' })
        .then(response => {
          if (response.ok && response.headers.get('content-type')?.includes('javascript')) {
            return navigator.serviceWorker.register('/sw.js')
          } else {
            throw new Error('Service worker not available or wrong MIME type')
          }
        })
        .then((registration: ServiceWorkerRegistration) => {
          console.log('[PWA] Service worker registered:', registration)
          callbacks.onRegistered?.(registration)

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  needRefresh.value = true
                  callbacks.onNeedRefresh?.()
                }
              })
            }
          })

          if (registration.active && !navigator.serviceWorker.controller) {
            offlineReady.value = true
            callbacks.onOfflineReady?.()
          }
        })
        .catch((error: Error) => {
          console.warn('[PWA] Service worker registration skipped:', error.message)
          // Don't call onRegisterError for development when SW isn't available
          if (import.meta.env.PROD) {
            callbacks.onRegisterError?.(error)
          }
        })
    }

    return {
      needRefresh,
      offlineReady,
      updateServiceWorker
    }
  }
}

/**
 * PWA update management composable
 */
export function usePWA() {
  const versionStore = useVersionStore()
  const settingsStore = useSettingsStore()
  
  // Local state
  const latestVersion = ref('')
  const updateFeatures = ref<string[]>([])
  const dismissedVersion = useLocalStorage('dismissed-version', '')
  const isInitialized = ref(false)
  
  // PWA state - initialize with default values
  const needRefresh = ref(false)
  const offlineReady = ref(false)
  let updateServiceWorkerFn: ((reloadPage?: boolean) => Promise<void>) | null = null

  // Computed properties
  const currentVersion = computed(() => versionStore.versionInfo.full)
  const updatesEnabled = computed(() => settingsStore.appearance.checkForUpdates !== false)
  
  // Initialize PWA
  const initPWA = async () => {
    if (isInitialized.value) return

    await initializePWA()
    
    if (useRegisterSW) {
      const pwaResult = useRegisterSW({
        onRegistered(registration: ServiceWorkerRegistration | undefined) {
          console.log('[PWA] Service worker registered:', registration)
          
          if (updatesEnabled.value && registration) {
            registration.update()
            startPeriodicChecks(registration)
          }
        },
        onRegisterError(error: Error) {
          console.error('[PWA] Service worker registration error:', error)
        },
        onNeedRefresh() {
          needRefresh.value = true
        },
        onOfflineReady() {
          offlineReady.value = true
        }
      })

      // Update reactive refs
      needRefresh.value = pwaResult.needRefresh.value
      offlineReady.value = pwaResult.offlineReady.value
      updateServiceWorkerFn = pwaResult.updateServiceWorker

      // Watch for changes
      if (pwaResult.needRefresh) {
        needRefresh.value = pwaResult.needRefresh.value
      }
      if (pwaResult.offlineReady) {
        offlineReady.value = pwaResult.offlineReady.value
      }
    }

    isInitialized.value = true
  }

  /**
   * Start periodic update checks
   */
  const startPeriodicChecks = (registration: ServiceWorkerRegistration) => {
    const { pause, resume } = useIntervalFn(
      () => {
        if (registration && updatesEnabled.value) {
          registration.update()
          checkForVersionUpdates()
        }
      },
      60 * 60 * 1000, // Check every hour
      { immediate: false }
    )

    // Initial check
    checkForVersionUpdates()
    resume()

    return { pause, resume }
  }

  /**
   * Check for version updates from changelog
   */
  const checkForVersionUpdates = async (): Promise<void> => {
    try {
      // For now, we'll skip the changelog import since it's not in the context
      // You can uncomment this when the changelog is available
      // if (updates.length > 0) {
      //   const latestUpdate = updates[0]
      //   latestVersion.value = latestUpdate?.version || ''
      //   
      //   if (isNewerVersion(latestVersion.value, currentVersion.value)) {
      //     updateFeatures.value = latestUpdate?.features || []
      //   }
      // }
      
      // Fallback to version-info.json if available
      try {
        const response = await fetch(`/version-info.json?t=${Date.now()}`)
        if (response.ok) {
          const versionData = await response.json()
          latestVersion.value = versionData.full || ''
        }
      } catch {
        // Ignore fetch errors in development
      }
    } catch (error) {
      console.error('[PWA] Failed to check for version updates:', error)
    }
  }

  /**
   * Compare version strings
   */
  const isNewerVersion = (latest: string, current: string): boolean => {
    if (!latest || !current) return false
    
    const normalizeVersion = (v: string) => v.replace(/^v/, '')
    const latestParts = normalizeVersion(latest).split('.').map(Number)
    const currentParts = normalizeVersion(current).split('.').map(Number)
    
    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const latestPart = latestParts[i] || 0
      const currentPart = currentParts[i] || 0
      
      if (latestPart > currentPart) return true
      if (latestPart < currentPart) return false
    }
    
    return false
  }

  /**
   * Check if update should be shown
   */
  const shouldShowUpdate = computed(() => {
    // Service worker update available
    if (needRefresh.value) return true
    
    // Version update available and not dismissed
    if (isNewerVersion(latestVersion.value, currentVersion.value)) {
      return dismissedVersion.value !== latestVersion.value
    }
    
    return false
  })

  /**
   * Update the application
   */
  const updateApp = async (): Promise<void> => {
    try {
      if (updateServiceWorkerFn) {
        await updateServiceWorkerFn(true)
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error('[PWA] Failed to update app:', error)
      window.location.reload()
    }
  }

  /**
   * Dismiss the update notification
   */
  const dismissUpdate = (): void => {
    if (latestVersion.value) {
      dismissedVersion.value = latestVersion.value
    }
    needRefresh.value = false
  }

  // Initialize PWA on first call
  initPWA()

  return {
    // State
    needRefresh,
    offlineReady,
    latestVersion,
    updateFeatures,
    currentVersion,
    
    // Computed
    shouldShowUpdate,
    updatesEnabled,
    
    // Methods
    updateApp,
    dismissUpdate,
    checkForVersionUpdates
  }
}
