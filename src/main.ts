import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueTippy from 'vue-tippy'
import router from '@/router'
import App from '@/App.vue'
import { useDeviceStore } from '@/stores/device'
import { MotionPlugin } from '@vueuse/motion'
import '@/assets/css/main.css'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale.css'

if (process.env.NODE_ENV === 'development') {
  import('@/assets/css/fonts.css')
}

defineLoadGoogleFonts()

function defineLoadGoogleFonts() {
  if (process.env.NODE_ENV === 'production') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap';
    document.head.appendChild(link);
  }
}

const app = createApp(App)
const pinia = createPinia()

app.use(MotionPlugin).use(pinia).use(router)

// Configure VueTippy
const tippyProps = {
  placement: 'top',
  theme: 'custom',
  arrow: true,
  animation: 'scale',
  delay: [200, 0],
  onShow() {
    const device = useDeviceStore()
    return !device.isMobile
  },
}

app.use(VueTippy, { defaultProps: tippyProps })
app.mount('#app')
