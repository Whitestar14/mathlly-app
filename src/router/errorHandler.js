import { ref } from 'vue';

export const routeError = ref(null);
export const routePath = ref('');
export const isHandlingError = ref(false); // Add this to track error state

export function setRouteError(error, path) {
  routeError.value = error;
  routePath.value = path;
  isHandlingError.value = true;
}

export function clearRouteError() {
  routeError.value = null;
  routePath.value = '';
  isHandlingError.value = false;
}

export function setupRouteErrorHandling(router) {
  // Handle navigation errors
  router.onError((error) => {
    const pendingRoute = router.currentRoute.value.fullPath;
    setRouteError(error, pendingRoute);
    router.push('/error');
  });

  // Add navigation timeout handling
  router.beforeResolve(async (to, from, next) => {
    // Skip for error route
    if (to.path === '/error') {
      return next();
    }

    // Set a timeout for route resolution
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Navigation timeout - page took too long to load'));
      }, 10000); // 10 second timeout
    });

    try {
      // Race between route components loading and timeout
      await Promise.race([
        // This will resolve when all route components are loaded
        router.resolve(to).matched.reduce(
          (promise, record) => promise.then(() => {
            // Load all components in the route
            return Promise.all(
              Object.values(record.components).map(comp => {
                return typeof comp === 'function' ? comp() : Promise.resolve();
              })
            );
          }),
          Promise.resolve()
        ),
        timeoutPromise
      ]);
      
      next();
    } catch (error) {
      setRouteError(error, to.fullPath);
      next('/error');
    }
  });
  
  // Ensure title is updated correctly after navigation
  router.afterEach((to) => {
    if (to.path !== '/error') {
      clearRouteError();
    }
  });
}
