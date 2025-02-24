import { createRouter, createWebHistory } from "vue-router";

const routes = [
  // Calculator routes
  {
    path: "/",
    name: "Calculator",
    component: () => import('@/layouts/pages/calculators/StandardCalculator.vue'),
    meta: { transition: 'fade', group: 'calculators' }
  },
  {
    path: "/functions",
    name: "Functions",
    component: () => import('@/layouts/pages/calculators/FunctionsCalculator.vue'),
    meta: { transition: 'fade', group: 'calculators' }
  },
  {
    path: "/regex",
    name: "Regex",
    component: () => import('@/layouts/pages/calculators/RegexCalculator.vue'),
    meta: { transition: 'fade', group: 'calculators' }
  },
  {
    path: "/graphing",
    name: "Graphing",
    component: () => import('@/layouts/pages/calculators/GraphingCalculator.vue'),
    meta: { transition: 'fade', group: 'calculators' }
  },
  {
    path: "/converter",
    name: "Converter",
    component: () => import('@/layouts/pages/calculators/UnitConverter.vue'),
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
    path: "/whats-new",
    name: "WhatsNew",
    component: () => import('@/layouts/pages/info/WhatsNewPage.vue'),
    meta: { transition: 'fade', group: 'information' }
  },
  {
    path: "/about",
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
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
