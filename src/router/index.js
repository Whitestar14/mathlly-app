import { createRouter, createWebHistory } from "vue-router";
import AboutPage from "../components/pages/AboutPage.vue";
import FeedbackPage from "../components/pages/FeedbackPage.vue";
import CalculatorPage from "../components/pages/CalculatorPage.vue";
import SettingsPage from "../components/pages/SettingsPage.vue";

const routes = [
  {
    path: "/",
    name: "Calculator",
    component: CalculatorPage,
  },
  {
    path: "/about",
    name: "About",
    component: AboutPage,
  },
  {
    path: "/settings",
    name: "Settings",
    component: SettingsPage,
  },
  {
    path: "/feedback",
    name: "Feedback",
    component: FeedbackPage,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
