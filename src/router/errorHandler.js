import { ref } from 'vue';
import { useOnline } from '@vueuse/core';

export const routeError = ref(null);
export const routePath = ref('');
export const isHandlingError = ref(false);
export const hasError = ref(false);
export const networkStatus = useOnline();

export function setRouteError(error, path) {
  console.error(`[Router Error] Path: ${path}`, error);
  routeError.value = error;
  routePath.value = path;
  hasError.value = true;
  isHandlingError.value = true;
}

export function clearRouteError() {
  if (routeError.value) {
    routeError.value = null;
    routePath.value = '';  
    isHandlingError.value = false;
  }
  hasError.value = false;
}

export function setupRouteErrorHandling(router) {
  router.onError((error, to) => {
    if (to.path === '/error' && isHandlingError.value) {
      console.warn(
        'Router.onError triggered while already handling an error or navigating to /error. Preventing loop.'
      );
      return;
    }

    const currentPath = to.fullPath || router.currentRoute.value.fullPath;
    const isCurrentlyOnline = networkStatus.value;
    let processedError = error;

    const isChunkLoadError =
      error.message &&
      (error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('error loading dynamically imported module'));

    if (!isCurrentlyOnline) {
      processedError = new Error(
        `You appear to be offline. Please check your connection. (Original error: ${error.message})`
      );
      // Keep the original error accessible if needed, e.g., for stack trace
      processedError.originalError = error;
    } else if (isChunkLoadError) {
      processedError = new Error(
        `Failed to load page component. Please check your connection and try again. (${error.message})`
      );
      processedError.originalError = error;
    } else if (!error.message) {
      processedError = new Error(
        `An unknown error occurred while navigating to ${currentPath}.`
      );
      processedError.originalError = error;
    }

    // --- Set State and Redirect ---
    setRouteError(processedError, currentPath);
    router.replace({ path: '/error' });
  });

  router.afterEach((to) => {
    if (to.path !== '/error' && isHandlingError.value) {
      clearRouteError();
    }

    let baseTitle = 'Mathlly';
    if (to.meta?.title) {
      baseTitle = to.meta.title;
    } else if (to.name && typeof to.name === 'string') {
      baseTitle = to.name;
    }
    document.title =
      baseTitle !== 'Mathlly' ? `${baseTitle} - Mathlly` : baseTitle;
  });
}