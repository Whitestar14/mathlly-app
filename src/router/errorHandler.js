import { ref } from 'vue';

export const routeError = ref(null);
export const routePath = ref('');
export const isHandlingError = ref(false);

export function setRouteError(error, path) {
  console.error(`[Router Error] Path: ${path}`, error); // Log the error for debugging
  routeError.value = error;
  routePath.value = path;
  isHandlingError.value = true; // Indicate we are now in a router-handled error state
}

export function clearRouteError() {
  if (routeError.value) {
    // console.log('Clearing route error');
    routeError.value = null;
    routePath.value = '';
    isHandlingError.value = false; // Clear the router error state
  }
}

export function setupRouteErrorHandling(router) {
  // --- Centralized Error Handling ---
  router.onError((error, to) => {
    // Avoid error loops if error occurs *while* navigating to /error
    if (to.path === '/error' && routeError.value) {
      console.warn(
        'Router.onError triggered while already handling an error or navigating to /error. Preventing loop.'
      );
      return; // Prevent potential infinite loops
    }

    // Check for specific error types if needed (e.g., chunk load)
    const isChunkLoadError =
      error.message &&
      error.message.includes('Failed to fetch dynamically imported module');
    const isOfflineError = !navigator.onLine; // Basic check

    // Enhance the error object or message if desired
    let processedError = error;
    if (isChunkLoadError) {
      processedError = new Error(
        `Failed to load page component. Please check your connection and try again. (${error.message})`
      );
    } else if (isOfflineError) {
      processedError = new Error(
        `You appear to be offline. Please check your connection. (${error.message})`
      );
    } else {
      // Generic navigation error
      processedError = new Error(
        `Could not navigate to ${to.fullPath}. ${error.message}`
      );
    }

    setRouteError(
      processedError,
      to.fullPath || router.currentRoute.value.fullPath
    );

    // Redirect to a dedicated error page
    // Use replace to avoid adding the failed navigation to history
    router.replace({ path: '/error' });
  });

  // --- Clear Error State on Successful Navigation ---
  // Use afterEach as it runs after navigation is confirmed.
  router.afterEach((to) => {
    // Clear the error state *unless* we just navigated *to* the error page
    if (to.path !== '/error') {
      clearRouteError();
    }
  });
}
