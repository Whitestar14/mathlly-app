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
    currentMode: null
  }),

  getters: {
    defaultMode: (state) => state.mode,
    // Modified to prioritize currentMode only if explicitly set
    activeMode: (state) => state.currentMode === null ? state.mode : state.currentMode
  },

  actions: {
    async loadSettings() {
      try {
        const settings = await db.settings.get(1);
        if (settings) {
          Object.assign(this, settings);
        } else {
          await this.saveSettings(DEFAULT_SETTINGS);
        }
        // Initialize currentMode as null to use default mode
        this.currentMode = null;
      } catch (error) {
        console.error('Error loading settings:', error);
        Object.assign(this, DEFAULT_SETTINGS);
        this.currentMode = null;
      }
    },

    async saveSettings(newSettings) {
      try {
        // Create a new settings object that preserves the ID
        const currentSettings = await db.settings.get(1);
        const settingsToSave = {
          id: 1,
          ...DEFAULT_SETTINGS,  // Ensure all default fields exist
          ...(currentSettings || {}),  // Preserve existing settings
          ...newSettings,  // Apply new settings
        };
        
        // If no existing settings, add new record
        if (!currentSettings) {
          await db.settings.add(settingsToSave);
        } else {
          // Update existing record
          await db.settings.update(1, settingsToSave);
        }
        
        // Update store state
        Object.assign(this, settingsToSave);
      } catch (error) {
        console.error('Error saving settings:', error);
        throw error; // Propagate error to UI for handling
      }
    },

    setCurrentMode(mode) {
      // Only set currentMode if it differs from default mode
      this.currentMode = mode !== this.mode ? mode : null;
    },

    async setDefaultMode(mode) {
      const currentSettings = { ...this.$state };
      currentSettings.mode = mode;
      // Reset currentMode when default mode changes
      this.currentMode = null;
      await this.saveSettings(currentSettings);
    }
  }
});