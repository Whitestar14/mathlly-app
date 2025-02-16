// settings.js (Pinia Store)
import { defineStore } from 'pinia';
import db from '@/data/db';

const DEFAULT_SETTINGS = {
  id: 1,
  precision: 4,
  useFractions: false,
  useThousandsSeparator: true,
  theme: 'system',
  mode: 'Standard',
  borderless: false
};

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    ...DEFAULT_SETTINGS
  }),

  actions: {
    async loadSettings() {
      try {
        const settings = await db.settings.get(1);
        if (settings) {
          Object.assign(this, settings);
        } else {
          // If no settings found, create default settings
          await this.saveSettings(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to default settings in case of error
        Object.assign(this, DEFAULT_SETTINGS);
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

    async updateMode(newMode) {
      try {
        const currentSettings = { ...this.$state };
        currentSettings.mode = newMode;
        await this.saveSettings(currentSettings);
      } catch (error) {
        console.error('Error updating mode:', error);
        throw error;
      }
    }
  }
});