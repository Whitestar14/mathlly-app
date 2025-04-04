import { createRouter, createWebHistory } from "vue-router";

const routes = [
  // Home route
  {
    path: "/",
    name: "Home",
    component: () => import('@/layouts/pages/HomePage.vue'),
    meta: { transition: 'fade' }
  },

  // Calculator routes
  {
    path: "/calculator",
    name: "Calculator",
    component: () => import('@/layouts/pages/calculators/MainCalculator.vue'),
    meta: { transition: 'fade', group: 'calculators' }
  },

  // Tools routes
  {
    path: "/tools/base64",
    name: "Base64",
    component: () => import('@/layouts/pages/tools/Base64Tool.vue'),
    meta: { transition: 'fade', group: 'tools' }
  },

  // Information routes
  {
    path: "/info/update",
    name: "What's New",
    component: () => import('@/layouts/pages/info/UpdatePage.vue'),
    meta: { transition: 'fade', group: 'information' }
  },
  {
    path: "/info/about",
    name: "About",
    component: () => import('@/layouts/pages/info/AboutPage.vue'),
    meta: { transition: 'fade', group: 'information' }
  },

  // Utility routes
  {
    path: "/settings",
    name: "Settings",
    component: () => import('@/layouts/pages/utility/SettingsPage.vue'),
    meta: { transition: 'fade', group: 'utility' }
  },
  {
    path: "/feedback",
    name: "Feedback",
    component: () => import('@/layouts/pages/utility/FeedbackPage.vue'),
    meta: { transition: 'fade', group: 'utility' }
  },

  // 404 route
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import('@/layouts/pages/NotFound.vue'),
    meta: { transition: 'fade' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
