// stores/device.js
import { defineStore } from 'pinia';

export const useDeviceStore = defineStore('device', {
    state: () => ({
        isMobile: false,
        screenWidth: 0,
        screenHeight: 0,
        orientation: 'portrait', // or 'landscape'
    }),
    getters: {
        isLandscape: (state) => state.orientation === 'landscape',
    },
    actions: {
        updateDeviceInfo() {
            this.screenWidth = window.innerWidth;
            this.screenHeight = window.innerHeight;
            this.isMobile = window.innerWidth < 768; // Your mobile breakpoint
            this.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        },
        initializeDeviceInfo() {
            this.updateDeviceInfo(); // Get initial values
            window.addEventListener('resize', this.updateDeviceInfo);
            window.addEventListener('orientationchange', this.updateDeviceInfo)
        },
        destroyDeviceInfo() {
            window.removeEventListener('resize', this.updateDeviceInfo);
            window.removeEventListener('orientationchange', this.updateDeviceInfo)
        }
    },
});