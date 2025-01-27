import { createRouter, createWebHistory } from "vue-router";
import CalculatorPage from "@/layouts/pages/CalculatorPage.vue"

const routes = [
  {
    path: "/",
    name: "Calculator",
    component: CalculatorPage,
    meta: { transition: 'fade' }
  },
  {
    path: "/about",
    name: "About",
    component: () => import('@/layouts/pages/AboutPage.vue'),
    meta: { transition: 'fade' }
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import('@/layouts/pages/SettingsPage.vue'),
    meta: { transition: 'fade' }
  },
  {
    path: "/feedback",
    name: "Feedback",
    component: () => import('@/layouts/pages/FeedbackPage.vue'),
    meta: { transition: 'fade' }
  },
  {
    path: '/whats-new',
    name: 'WhatsNew',
    component: () => import('@/layouts/pages/WhatsNewPage.vue'),
    meta: { transition: 'fade' }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
