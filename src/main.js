import { createApp } from "vue";
import { createPinia } from "pinia";
import VueTippy from "vue-tippy";
import router from "@/router";
import App from "@/App.vue";
import { useDeviceStore } from "@/stores/device";
import { MotionPlugin } from '@vueuse/motion'
import "./assets/css/main.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

const app = createApp(App);
const pinia = createPinia(); 

app.use(MotionPlugin).use(pinia).use(router);

const props = {
  placement: "top",
  theme: "custom",
  arrow: true,
  animation: "scale",
  delay: [200, 0],
  onShow() {
    const device = useDeviceStore();
    return !device.isMobile;
  }
};

app.use(VueTippy, { defaultProps: props });
app.mount("#app");