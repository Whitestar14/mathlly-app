import { createRouter, createWebHistory } from "vue-router";
import CalculatorPage from "../components/CalculatorPage.vue";
import AboutPage from "../components/AboutPage.vue";
import SettingsPage from "../components/SettingsPage.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: CalculatorPage,
  },
  {
    path: "/about",
    name: "about",
    component: AboutPage,
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
