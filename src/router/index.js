import { createRouter, createWebHistory } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue';
import { setupRouteErrorHandling, routeError, routePath } from './errorHandler';

const routes = [
  {
    path: '/',
    name: 'Home',
    // use the redirect option to conditionally reroute the loaded route into the specified
    // startup route. gracefully ensure that the logic does not aggressively prevent loading into homepage
    component: () => import('@/layouts/navigation/HomePage.vue'),
    meta: { transition: 'fade' },
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('@/layouts/calculators/main/MainCalculator.vue'),
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
    name: "Updates",
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
    name: 'NotFound',
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

router.afterEach((to) => {
  const skipTracking = ['Error', 'NotFound', 'Settings', 'Home'];

  if (!to.meta.errorPage && !skipTracking.includes(to.name)) {
    const settingsStore = useSettingsStore();
    settingsStore.updateLastVisitedPath(to.fullPath);
  }
});

export default router;
