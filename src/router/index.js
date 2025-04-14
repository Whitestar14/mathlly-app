import { createRouter, createWebHistory } from 'vue-router';
import { setupRouteErrorHandling, routeError, routePath } from './errorHandler';

const routes = [
  // Home route
  {
    path: '/',
    name: 'Home',
    component: () => import('@/layouts/navigation/HomePage.vue'),
    meta: { transition: 'fade' },
  },

  // Calculator routes
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('@/layouts/calculators/MainCalculator.vue'),
    meta: { transition: 'fade', group: 'calculators' },
  },

  // Tools routes
  {
    path: '/tools/base64',
    name: 'Base64',
    component: () => import('@/layouts/tools/Base64Tool.vue'),
    meta: { transition: 'fade', group: 'tools' },
  },

  // Information routes
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

  // Utility routes
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
    component: () => import('@/layouts/navigation/ErrorFallback.vue'),
    // Pass the reactive error state as props
    props: () => ({
      error: routeError.value, // Pass the reactive ref directly
      path: routePath.value, // Pass the reactive ref directly
      isRouteError: true, // Add a flag to distinguish router errors
    }),
    beforeEnter: (to, from, next) => {
      // Allow access only if there's actually a route error being handled
      // Or if navigated directly for some reason (maybe show generic error)
      if (routeError.value) {
        next();
      } else {
        // No active error, redirect home
        console.warn(
          'Direct access to /error page without active error. Redirecting.'
        );
        next('/');
      }
    },
    meta: { transition: 'fade' },
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
});

// Setup centralized error handling
setupRouteErrorHandling(router);

export default router;
