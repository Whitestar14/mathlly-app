// settings.js (Pinia Store)
import { defineStore } from 'pinia';
import db from '@/data/db';

const DEFAULT_SETTINGS = {
  id: 1,
  precision: 4,
  useFractions: false,
  useThousandsSeparator: true,
  formatBinary: true,
  formatHexadecimal: true,
  formatOctal: true,
  theme: 'system',
  mode: 'Standard',
  animationDisabled: false,
};

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    ...DEFAULT_SETTINGS,
    currentMode: DEFAULT_SETTINGS.mode
  }),

  getters: {
    defaultMode: (state) => state.mode,
    activeMode: (state) => state.currentMode || state.mode
  },

  actions: {
    async loadSettings() {
      try {
        const settings = await db.settings.get(1);
        if (settings) {
          Object.assign(this, settings);
          this.currentMode = settings.mode; // Initialize current mode with default
        } else {
          await this.saveSettings(DEFAULT_SETTINGS);
          this.currentMode = DEFAULT_SETTINGS.mode;
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        Object.assign(this, DEFAULT_SETTINGS);
        this.currentMode = DEFAULT_SETTINGS.mode;
      }
    },

    async saveSettings(newSettings) {
      try {
        // Ensure ID is set
        const settingsToSave = { ...newSettings, id: 1 };
        
        // Use put instead of add to update existing record
        await db.settings.put(settingsToSave);
        
        // Update store state
        Object.assign(this, settingsToSave);
      } catch (error) {
        console.error('Error saving settings:', error);
        throw error; // Propagate error to UI for handling
      }
    },

    getPreferredMode() {
      return this.mode || DEFAULT_SETTINGS.mode;
    },

    setCurrentMode(mode) {
      this.currentMode = mode;
    },

    async setDefaultMode(mode) {
      const currentSettings = { ...this.$state };
      currentSettings.mode = mode;
      // Don't update currentMode here
      await this.saveSettings(currentSettings);
    }
  }
});