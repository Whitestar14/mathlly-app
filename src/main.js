import { createApp } from "vue";
import { createPinia } from "pinia";
import VueTippy from "vue-tippy";
import router from "@/router";
import App from "@/App.vue";
import { useDeviceStore } from "@/stores/device";
import { MotionPlugin } from '@vueuse/motion'
import "@/assets/css/main.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";


// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered:', registration.scope);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              const event = new CustomEvent('sw-update-available');
              window.dispatchEvent(event);
            }
          });
        });
      })
      .catch(error => {
        console.error('SW registration failed:', error);
      });
  });
  
  // Listen for controller change to reload the page
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

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