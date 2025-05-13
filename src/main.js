// main.js
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

// main.js
// ... (imports) ...

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered with scope:', registration.scope);

        const dispatchUpdateAvailableEvent = (reg) => {
          console.log('SW: Dispatching sw-update-available event.');
          const event = new CustomEvent('sw-update-available', { detail: reg });
          window.dispatchEvent(event);
        };

        // --- MODIFIED ---
        // Only dispatch if there's a waiting worker AND an active controller
        // This prevents the flash on first load/activation.
        if (registration.waiting && navigator.serviceWorker.controller) {
          console.log('SW: A waiting worker exists on load AND a controller is active (update scenario).', registration.waiting);
          dispatchUpdateAvailableEvent(registration);
        } else if (registration.waiting) {
            console.log('SW: A waiting worker exists on load, but NO active controller (likely first install/activation completed, worker waiting). Avoid dispatch.');
        }
        // --- END MODIFIED ---

        registration.addEventListener('updatefound', () => {
          console.log('SW: Event "updatefound" detected.');
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('SW: New worker is installing:', newWorker);
            newWorker.addEventListener('statechange', () => {
              console.log('SW: New worker state changed to:', newWorker.state);
              if (newWorker.state === 'installed') {
                // Only dispatch if this newly installed worker is waiting AND there's already an active controller
                // This ensures we only notify for *updates*, not the very first activation.
                if (registration.waiting === newWorker && navigator.serviceWorker.controller) {
                    console.log('SW: New worker installed and waiting (update scenario).');
                    dispatchUpdateAvailableEvent(registration);
                } else if (registration.waiting === newWorker) {
                    console.log('SW: New worker installed and waiting, but NO controller active yet (first install). Avoid dispatch.');
                }
              }
            });
          }
        });
      })
      .catch(error => {
        console.error('SW registration failed:', error);
      });
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