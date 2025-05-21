import { createRouter, createWebHistory } from 'vue-router';
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue';
import { setupRouteErrorHandling, routeError, routePath } from './errorHandler';
import db from '@/data/db';

let isInitialNavigation = true;

const routes = [
  {
    path: '/',
    name: 'home',
    // use the redirect option to conditionally reroute the loaded route into the specified
    // startup route. gracefully ensure that the logic does not aggressively prevent loading into homepage
    component: () => import('@/layouts/navigation/HomePage.vue'),
    meta: { transition: 'fade' },
  },
  {
    path: '/calculator',
    name: 'calculator',
    component: () => import('@/layouts/calculators/main/MainCalculator.vue'),
    meta: { transition: 'fade', group: 'calculators' },
  },
  {
    path: '/tools/base64',
    name: 'base64',
    component: () => import('@/layouts/tools/Base64Tool.vue'),
    meta: { transition: 'fade', group: 'tools' },
  },
  {
    path: '/info/update',
    name: "updates",
    component: () => import('@/layouts/info/UpdatePage.vue'),
    meta: { transition: 'fade', group: 'information' },
  },
  {
    path: '/info/about',
    name: 'about',
    component: () => import('@/layouts/info/AboutPage.vue'),
    meta: { transition: 'fade', group: 'information' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/layouts/utility/SettingsPage.vue'),
    meta: { transition: 'fade', group: 'utility' },
  },
  {
    path: '/feedback',
    name: 'feedback',
    component: () => import('@/layouts/utility/FeedbackPage.vue'),
    meta: { transition: 'fade', group: 'utility' },
  },
  {
    path: '/error',
    name: 'error',
    component: ErrorFallback,
    props: () => ({
      error: routeError.value,
      path: routePath.value,
      isRouteError: true,
    }),
    beforeEnter: (_, __, next) => {
      if (routeError.value) next();
      else {
        console.warn(
          'Direct access to /error page without active error. Redirecting to home.'
        );
        next('/');
      }
    },
    meta: { transition: 'fade', errorPage: true },
  },
  {
    path: '/doom',
    component: () => import('@/layouts/special/DoomChart.vue'),
    meta: { type: 'seasonal' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/layouts/navigation/NotFound.vue'),
    meta: { transition: 'fade' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  fallback: ErrorFallback,
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
});

setupRouteErrorHandling(router);

// Store last visited path in localStorage
router.afterEach((to) => {
  // Don't store certain pages as last visited
  const excludedRoutes = ['not-found', 'settings', 'error', 'feedback'];
  
  if (!excludedRoutes.includes(to.name) && to.path !== '/') {
    localStorage.setItem('last-visited-path', to.fullPath);
  }
  
  // After the first navigation is complete, set the flag to false
  isInitialNavigation = false;
});

// Handle redirection based on startup preferences
router.beforeEach(async (to, from, next) => {
  // Only apply redirection logic for the home page AND only on initial navigation
  if (to.path === '/' && isInitialNavigation) {
    try {
      // Get settings from IndexedDB
      const settings = await db.settings.get(1);
      
      if (settings && settings.startup) {
        const startupNav = settings.startup.navigation;
        
        // If startup preference is set to last-visited
        if (startupNav === 'last-visited') {
          // Get last visited path from localStorage
          const lastVisitedPath = localStorage.getItem('last-visited-path');
          
          // Only redirect if we have a valid last visited path
          if (lastVisitedPath && lastVisitedPath !== '/') {
            return next(lastVisitedPath);
          }
          
          // If no valid last path, default to calculator
          if (settings.calculator) {
            return next('/calculator');
          }
        }
        
        // If startup preference is set to calculator
        if (startupNav === 'calculator') {
          return next('/calculator');
        }
      }
      
      // If no settings or preference is 'home', proceed normally
      next();
    } catch (error) {
      console.error('Error in navigation guard:', error);
      // In case of any error, proceed to home page
      next();
    }
  } else {
    // For all other routes or non-initial navigations to home, proceed normally
    next();
  }
});

export default router;
