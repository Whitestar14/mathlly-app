import { createApp } from "vue";
import App from "./App.vue";
import "./assets/tailwind.css"; // Add this line
import "./assets/global.css"
import router from './router';  // Import the router you just created

createApp(App).use(router).mount("#app");
