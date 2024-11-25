import { createRouter, createWebHistory } from 'vue-router';
import CalculatorPage from '../components/CalculatorPage.vue';
import AboutPage from '../components/AboutPage.vue';
import SettingsPage from '../components/SettingsPage.vue';
import FeedbackPage from '../components/FeedbackPage.vue';

const routes = [
  {
    path: '/',
    name: 'Calculator',
    component: CalculatorPage,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: FeedbackPage,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;

