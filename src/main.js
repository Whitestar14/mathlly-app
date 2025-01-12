import { createApp } from "vue";
import { createPinia } from "pinia";
import VueTippy from "vue-tippy";
import router from "@/router";
import App from "@/App.vue";
import "@/assets/css/tailwind.css";
import "@/styles/style.css";
import "@/assets/css/global.css";
import "@/assets/css/tooltip.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/border.css";
import "tippy.js/animations/scale.css";
import { useDeviceStore } from "@/stores/device";
const app = createApp(App);
const pinia = createPinia(); 

const props = {
  placement: "top",
  theme: "custom",
  arrow: false,
  allowHTML: true,
  animation: "scale",
  disabled: () => {
    const deviceStore = useDeviceStore(pinia);
    return deviceStore.isMobile;
  },
};

app.use(pinia); 
app.use(router);
app.use(VueTippy, {
  defaultProps: props,
});
app.mount("#app");

const deviceStore = useDeviceStore();
deviceStore.initializeDeviceInfo();

app.config.globalProperties.$unmount = () => {
  deviceStore.destroyDeviceInfo();
};
