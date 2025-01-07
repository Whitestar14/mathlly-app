import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Calculator",
    component: () => import('@/layouts/pages/CalculatorPage.vue')
  },
  {
    path: "/about",
    name: "About",
    component: () => import('@/layouts/pages/AboutPage.vue')
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import('@/layouts/pages/SettingsPage.vue')
  },
  {
    path: "/feedback",
    name: "Feedback",
    component: () => import('@/layouts/pages/FeedbackPage.vue')
  },
  {
    path: '/whats-new',
    name: 'WhatsNew',
    component: () => import('@/layouts/pages/WhatsNewPage.vue')
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
