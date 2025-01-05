import { defineStore } from 'pinia'
import db from '../data/db'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    precision: 4,
    useFractions: false,
    useThousandsSeparator: true,
    theme: 'system'
  }),
  
  actions: {
    async loadSettings() {
      const saved = await db.settings.toArray()
      if (saved.length > 0) {
        Object.assign(this, saved[0])
      }
    },
    
    async saveSettings(newSettings) {
      await db.settings.clear()
      await db.settings.add(newSettings)
      Object.assign(this, newSettings)
    }
  }
})