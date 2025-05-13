import { createRouter, createWebHistory } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue';
// Import clearRouteError and isHandlingError as they are needed in beforeEach
import { setupRouteErrorHandling, routeError, routePath, clearRouteError, isHandlingError } from './errorHandler';

const routes = [
  // ... your existing routes ...
  {
    path: '/',
    name: 'Home',
    component: () => import('@/layouts/navigation/HomePage.vue'),
    meta: { transition: 'fade' },
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('@/layouts/calculators/MainCalculator.vue'),
    meta: { transition: 'fade', group: 'calculators' },
  },
  {
    path: '/tools/base64',
    name: 'Base64',
    component: () => import('@/layouts/tools/Base64Tool.vue'),
    meta: { transition: 'fade', group: 'tools' },
  },
  {
    path: '/info/update',
    name: "What's New",
    component: () => import('@/layouts/info/UpdatePage.vue'),
    meta: { transition: 'fade', group: 'information' },
  },
  {
    path: '/info/about',
    name: 'About',
    component: () => import('@/layouts/info/AboutPage.vue'),
    meta: { transition: 'fade', group: 'information' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/layouts/utility/SettingsPage.vue'),
    meta: { transition: 'fade', group: 'utility' },
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('@/layouts/utility/FeedbackPage.vue'),
    meta: { transition: 'fade', group: 'utility' },
  },
  {
    path: '/error',
    name: 'Error',
    component: ErrorFallback,
    props: () => ({
      error: routeError.value,
      path: routePath.value,
      isRouteError: true,
    }),
    beforeEnter: (to, from, next) => {
      if (routeError.value) {
        next();
      } else {
        console.warn(
          'Direct access to /error page without active error. Redirecting to home.'
        );
        next('/');
      }
    },
    meta: { transition: 'fade', errorPage: true },
  },
  {
    path: "/doom",
    component: () => import("@/layouts/special/DoomChart.vue"),
    meta: { type: 'seasonal' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/layouts/navigation/NotFound.vue'),
    meta: { transition: 'fade' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  fallback: ErrorFallback
});

// --- BEGIN PROPOSED FIX ---
// Add this beforeEach guard BEFORE setupRouteErrorHandling
router.beforeEach((to, from, next) => {
  // If navigating away from the error page to a different page,
  // and an error was actively being handled.
  if (from.path === '/error' && to.path !== '/error' && isHandlingError.value) {
    console.log(
      `[Router.beforeEach] Navigating from /error to ${to.fullPath}. Clearing previous route error optimistically.`
    );
    // Clear the error state. If the upcoming navigation to 'to.path' fails,
    // router.onError (from setupRouteErrorHandling) will catch it and set a new error.
    // If 'to.path' loads successfully (e.g., from cache), it won't be affected by the old error state.
    clearRouteError();
  }
  next();
});
// --- END PROPOSED FIX ---

// Setup centralized error handling (this registers router.onError and router.afterEach)
setupRouteErrorHandling(router);

// Track last visited page
router.afterEach((to) => {
  const skipTracking = [
    'Error',
    'NotFound',
    'Settings',
    'Home'
  ];

  if (!to.meta.errorPage && !skipTracking.includes(to.name)) {
    const settingsStore = useSettingsStore();
    settingsStore.updateLastVisitedPath(to.fullPath);
  }
});

export default router;