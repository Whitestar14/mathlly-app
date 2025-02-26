import { createApp } from "vue";
import { createPinia } from "pinia";
import VueTippy from "vue-tippy";
import router from "@/router";
import App from "@/App.vue";
import "@/assets/css/tailwind.css";
import "@/assets/css/global.css";
import "@/assets/css/tooltip.css";
import "@/assets/css/animation.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/border.css";
import "tippy.js/animations/scale.css";
import { useDeviceStore } from "@/stores/device";

const app = createApp(App);
const pinia = createPinia(); 

app.use(pinia).use(router);

const props = {
  placement: "top",
  theme: "custom",
  arrow: false,
  allowHTML: true,
  animation: "scale",
  delay: [300, 0],
  onShow() {
    const device = useDeviceStore();
    device.initializeDeviceInfo();
    return !device.isMobile;
  }
};

app.use(VueTippy, { defaultProps: props });
app.mount("#app");

