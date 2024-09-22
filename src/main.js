import { createApp } from "vue";
import App from "./App.vue";
import "./assets/tailwind.css"; // Add this line
import "./assets/global.css"
import router from './router';  // Import the router you just created
import VueTippy from "vue-tippy";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/material.css";
import "./assets/tooltip.css"

const app = createApp(App);
app
  .use(router)
  .use(VueTippy, {
    defaultProps: {
      placement: "top",
      theme: "custom",
      arrow: false,
    },
  })
  .mount("#app");
