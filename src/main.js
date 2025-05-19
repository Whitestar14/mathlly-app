// main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import VueTippy from 'vue-tippy';
import router from '@/router';
import App from '@/App.vue';
import { useDeviceStore } from '@/stores/device';
import { MotionPlugin } from '@vueuse/motion';
import '@/assets/css/main.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

if (process.env.NODE_ENV === 'development') {
  import('@/assets/css/fonts.css');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        const dispatchUpdateAvailableEvent = (reg) => {
          const event = new CustomEvent('sw-update-available', { detail: reg });
          window.dispatchEvent(event);
        };

        if (registration.waiting && navigator.serviceWorker.controller) {
          dispatchUpdateAvailableEvent(registration);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (
                  registration.waiting === newWorker &&
                  navigator.serviceWorker.controller
                ) {
                  dispatchUpdateAvailableEvent(registration);
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('SW registration failed:', error);
      });
  });
}

const app = createApp(App);
const pinia = createPinia();

app.use(MotionPlugin).use(pinia).use(router);

const props = {
  placement: 'top',
  theme: 'custom',
  arrow: true,
  animation: 'scale',
  delay: [200, 0],
  onShow() {
    const device = useDeviceStore();
    return !device.isMobile;
  },
};

app.use(VueTippy, { defaultProps: props });
app.mount('#app');
