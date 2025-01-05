import { createApp } from "vue";
import { createPinia } from 'pinia';
import App from "./App.vue";
import "./assets/css/tailwind.css"; 
import "./assets/css/global.css"
import router from './router'; 
import VueTippy from "vue-tippy";
import "tippy.js/dist/tippy.css";
import "./assets/css/tooltip.css"
import "tippy.js/animations/shift-toward.css"
import "tippy.js/dist/border.css";

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const app = createApp(App);
app
  .use(createPinia())
  .use(router)
  .use(VueTippy, {
    defaultProps: {
      placement: "top",
      theme: "custom",
      arrow: true,
      allowHTML: true,
      animation: "shift-toward",
      disabled: isMobileDevice(),
    },
  })
  .mount("#app");
