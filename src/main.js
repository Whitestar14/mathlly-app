import { createApp, h, Suspense } from "vue";
import { createPinia } from "pinia";
import VueTippy from "vue-tippy";
import router from "@/router";
import App from "@/App.vue";
import BaseLoader from "@/components/base/BaseLoader.vue";
import { useDeviceStore } from "@/stores/device";
import "./assets/css/main.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/border.css";
import "tippy.js/animations/scale.css";

const app = createApp({
  render() {
    return h(Suspense, {
      timeout: 0, // Disable auto-fallthrough
      fallback: h(BaseLoader, {
        variant: "macro",
        message: "Initializing Mathlly...",
      })
    }, {
      default: () => h(App)
    });
  }
});

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
    return !device.isMobile;
  }
};

app.use(VueTippy, { defaultProps: props });
app.mount("#app");