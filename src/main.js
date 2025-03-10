import { createApp, h, Suspense } from "vue";
import { createPinia } from "pinia";
import VueTippy from "vue-tippy";
import router from "@/router";
import App from "@/App.vue";
import "./assets/css/main.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/border.css";
import "tippy.js/animations/scale.css";
import BaseLoader from "@/components/base/BaseLoader.vue";
import { useDeviceStore } from "@/stores/device";

const app = createApp({
  render() {
    return h(Suspense, {
      fallback: h(BaseLoader, {
        variant: "macro",
        message: "Loading Application..."
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