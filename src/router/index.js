import { createRouter, createWebHistory } from 'vue-router';
import {
  setupRouteErrorHandling,
  routeError,
  routePath,
  clearRouteError,
} from './errorHandler';

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
    props: () => ({ error: routeError.value, path: routePath.value }),
    beforeEnter: (to, from, next) => {
      // Only allow access if there's an error
      if (routeError.value) {
        next();
      } else {
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

// Setup error handling
setupRouteErrorHandling(router);

// Clear error when navigating away from error page
router.afterEach((to) => {
  if (to.path !== '/error') {
    clearRouteError();
  }
});

export default router;
