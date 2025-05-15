// settings.js (Pinia Store)
import { defineStore } from 'pinia';
import db from '@/data/db';
import { 
  cloneDeep, 
  merge,
  set, 
  flattenObject,
} from '@/utils/misc/objectUtils';

// Define a nested settings schema
const DEFAULT_SETTINGS = {
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
  },
  calculator: {
    mode: 'Standard', // Default calculator mode
    scientific: {
      // Scientific calculator specific settings
      angleUnit: 'degrees',
    },
    programmer: {
      // Programmer calculator specific settings
      defaultBase: 'decimal',
    },
  },
  appearance: {
    theme: 'system',
    animationDisabled: false,
  },
  startup: {
    navigation: 'home', // Options: 'home', 'calculator', 'last-visited'
    lastVisitedPath: '/',
  }
};

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // Flatten the settings for backward compatibility
    ...flattenObject(DEFAULT_SETTINGS),
    // Keep track of current mode separately
    currentMode: null
  }),

  getters: {
    // Computed properties to access nested settings
    display: (state) => createSettingsProxy(state, 'display'),
    calculator: (state) => createSettingsProxy(state, 'calculator'),
    appearance: (state) => createSettingsProxy(state, 'appearance'),
    startup: (state) => createSettingsProxy(state, 'startup'),
    
    // Backward compatibility getters
    defaultMode: (state) => state.calculator_mode || 'Standard',
    activeMode: (state) => state.currentMode === null ? state.calculator_mode : state.currentMode
  },

  actions: {
    async loadSettings() {
      try {
        const settings = await db.settings.get(1);
        if (settings) {
          // Merge saved settings with defaults to ensure all properties exist
          const mergedSettings = merge({}, DEFAULT_SETTINGS, settings);
          
          // Update state with merged settings (flattened for backward compatibility)
          Object.assign(this, flattenObject(mergedSettings));
        } else {
          // If no settings exist, save defaults
          await this.saveSettings(DEFAULT_SETTINGS);
        }
        // Initialize currentMode as null to use default mode
        this.currentMode = null;
      } catch (error) {
        console.error('Error loading settings:', error);
        Object.assign(this, flattenObject(DEFAULT_SETTINGS));
        this.currentMode = null;
      }
    },

    async saveSettings(newSettings) {
      try {
        // Get current settings from DB
        const currentSettings = await db.settings.get(1);
        
        // Create a deep copy of the default settings
        const baseSettings = cloneDeep(DEFAULT_SETTINGS);
        
        // Merge in this order: defaults <- current DB settings <- new settings
        const settingsToSave = merge(
          {},
          baseSettings,
          currentSettings || {},
          newSettings
        );
        
        // Ensure ID is preserved
        settingsToSave.id = 1;
        
        // Save to database
        if (!currentSettings) {
          await db.settings.add(settingsToSave);
        } else {
          await db.settings.update(1, settingsToSave);
        }
        
        // Update store state (flattened for backward compatibility)
        Object.assign(this, flattenObject(settingsToSave));
      } catch (error) {
        console.error('Error saving settings:', error);
        throw error; // Propagate error to UI for handling
      }
    },

    // Update a specific nested setting
    async updateSetting(path, value) {
      try {
        // Get current settings
        const currentSettings = await db.settings.get(1) || cloneDeep(DEFAULT_SETTINGS);
        
        // Set the value at the specified path
        set(currentSettings, path, value);
        
        // Save the updated settings
        await this.saveSettings(currentSettings);
        
        // Also update the local state for immediate reactivity
        // For the flat structure
        const flatKey = path.replace(/\./g, '_');
        this[flatKey] = value;
        
        // For the nested structure, we need to update the proxy
        // This happens automatically through the proxy mechanism
      } catch (error) {
        console.error(`Error updating setting at path ${path}:`, error);
        throw error;
      }
    },

    setCurrentMode(mode) {
      // Only set currentMode if it differs from default mode
      this.currentMode = mode !== this.calculator_mode ? mode : null;
    },

    async setDefaultMode(mode) {
      await this.updateSetting('calculator.mode', mode);
      // Reset currentMode when default mode changes
      this.currentMode = null;
    },

    // Update the last visited path
    async updateLastVisitedPath(path) {
      // Don't track error pages, home page, or settings pages
      const ignorePaths = ['/error', '/', '/settings'];
      if (!ignorePaths.includes(path) && !path.includes('error')) {
        await this.updateSetting('startup.lastVisitedPath', path);
      }
    },

    // Get the startup path based on settings
    getStartupPath() {
      switch (this.startup_navigation) {
        case 'calculator':
          return '/calculator';
        case 'last-visited':
          // Only use last visited if it's a valid path (not home or error)
          return (this.startup_lastVisitedPath && 
                 this.startup_lastVisitedPath !== '/' && 
                 !this.startup_lastVisitedPath.includes('error'))
            ? this.startup_lastVisitedPath
            : '/calculator'; // Fallback to calculator if no valid last path
        case 'home':
        default:
          return '/'; // Default to home
      }
    }
  }
});

/**
 * Creates a proxy for accessing nested settings with dot notation
 * @param {Object} state - The store state
 * @param {string} section - The top-level section (display, calculator, etc.)
 * @returns {Proxy} A proxy object for the section
 */
function createSettingsProxy(state, section) {
  // Create a handler that resolves nested paths from flattened state
  const handler = {
    get(target, prop) {
      if (prop === 'toJSON') {
        // Handle JSON serialization
        return () => {
          const result = {};
          // Collect all keys that start with section_
          Object.keys(state).forEach(key => {
            if (key.startsWith(`${section}_`)) {
              const subPath = key.substring(section.length + 1);
              set(result, subPath, state[key]);
            }
          });
          return result;
        };
      }
      
      // Check if we're accessing a nested property
      const flatKey = `${section}_${prop}`;
      if (flatKey in state) {
        return state[flatKey];
      }
      
      // Check if this might be a subsection
      const subsectionPrefix = `${section}_${prop}_`;
      const hasSubsection = Object.keys(state).some(key => key.startsWith(subsectionPrefix));
      
      if (hasSubsection) {
        // Return a new proxy for the subsection
        return new Proxy({}, {
          get(subTarget, subProp) {
            const subKey = `${section}_${prop}_${subProp}`;
            return state[subKey];
          }
        });
      }
      
      // If not found, return undefined
      return undefined;
    },
    
    set(target, prop, value) {
      const flatKey = `${section}_${prop}`;
      state[flatKey] = value;
      return true;
    }
  };
  
  return new Proxy({}, handler);
}
