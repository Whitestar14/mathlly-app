import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Calculator",
    component: () => import('../components/pages/CalculatorPage.vue')
  },
  {
    path: "/about",
    name: "About",
    component: () => import('../components/pages/AboutPage.vue')
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import('../components/pages/SettingsPage.vue')
  },
  {
    path: "/feedback",
    name: "Feedback",
    component: () => import('../components/pages/FeedbackPage.vue')
  },
  {
    path: '/whats-new',
    name: 'WhatsNew',
    component: () => import('../components/pages/WhatsNewPage.vue')
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
