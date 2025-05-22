// settings.js (Pinia Store)
import { defineStore } from 'pinia';
import db from '@/data/db';
import {
  cloneDeep,
  merge,
  set,
  flattenObject,
  unflattenObject,
  isNestedStructure,
} from '@/utils/misc/objectUtils';

export const DEFAULT_SETTINGS = {
  id: 1,
  display: {
    precision: 4,
    useFractions: false,
    formatting: {
      useThousandsSeparator: true,
      formatBinary: true,
      formatHexadecimal: true,
      formatOctal: true,
    },
    syntaxHighlighting: true,
    textSize: 'normal',
  },
  calculator: {
    mode: 'Standard',
    scientific: {
      angleUnit: 'degrees',
    },
    programmer: {
      defaultBase: 'decimal',
    },
  },
  appearance: {
    theme: 'system',
    animationDisabled: false,
    checkForUpdates: true,
  },
  startup: {
    navigation: 'last-visited',
  },
};

export const useSettingsStore = defineStore('settings', {
  state: () => ({ ...flattenObject(DEFAULT_SETTINGS) }),

  getters: {
    display: (state) => createSettingsProxy(state, 'display'),
    calculator: (state) => createSettingsProxy(state, 'calculator'),
    appearance: (state) => createSettingsProxy(state, 'appearance'),
    startup: (state) => createSettingsProxy(state, 'startup'),
  },

  actions: {
    async loadSettings() {
      try {
        const settings = await db.settings.get(1);
        if (settings) {
          const mergedSettings = merge({}, DEFAULT_SETTINGS, settings);

          Object.assign(this, flattenObject(mergedSettings));
        } else {
          await this.saveSettings(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        Object.assign(this, flattenObject(DEFAULT_SETTINGS));
      }
    },

    async saveSettings(newSettings) {
      try {
        const currentSettings = await db.settings.get(1);
        const baseSettings = cloneDeep(DEFAULT_SETTINGS);

        const flattenedNewSettings = isNestedStructure(newSettings)
          ? flattenObject(newSettings)
          : newSettings;

        const settingsToSave = merge(
          {},
          baseSettings,
          currentSettings || {},
          isNestedStructure(newSettings)
            ? newSettings
            : unflattenObject(flattenedNewSettings)
        );

        settingsToSave.id = 1;

        if (!currentSettings) {
          await db.settings.add(settingsToSave);
        } else {
          await db.settings.update(1, settingsToSave);
        }

        Object.assign(this, flattenObject(settingsToSave));

        return true;
      } catch (error) {
        console.error('Error saving settings:', error);
        throw error;
      }
    },

    async updateSetting(path, value) {
      try {
        const currentSettings =
          (await db.settings.get(1)) || cloneDeep(DEFAULT_SETTINGS);
        set(currentSettings, path, value);
        await this.saveSettings(currentSettings);

        const flatKey = path.replace(/\./g, '_');
        this[flatKey] = value;
      } catch (error) {
        console.error(`Error updating setting at path ${path}:`, error);
        throw error;
      }
    },
  },
});

/**
 * Creates a proxy for accessing nested settings with dot notation
 * @param {Object} state - The store state
 * @param {string} section - The top-level section (display, calculator, etc.)
 * @returns {Proxy} A proxy object for the section
 */
function createSettingsProxy(state, section) {
  const handler = {
    get(_, prop) {
      if (prop === 'toJSON') {
        return () => {
          const result = {};
          Object.keys(state).forEach((key) => {
            if (key.startsWith(`${section}_`)) {
              const subPath = key.substring(section.length + 1);
              set(result, subPath, state[key]);
            }
          });
          return result;
        };
      }

      const flatKey = `${section}_${prop}`;
      if (flatKey in state) {
        return state[flatKey];
      }

      const subsectionPrefix = `${section}_${prop}_`;
      const hasSubsection = Object.keys(state).some((key) =>
        key.startsWith(subsectionPrefix)
      );

      if (hasSubsection) {
        return new Proxy(
          {},
          {
            get(_, subProp) {
              const subKey = `${section}_${prop}_${subProp}`;
              return state[subKey];
            },
          }
        );
      }

      return undefined;
    },

    set(_, prop, value) {
      const flatKey = `${section}_${prop}`;
      state[flatKey] = value;
      return true;
    },
  };

  return new Proxy({}, handler);
}
