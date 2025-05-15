// settings.js (Pinia Store)
// settings.js (Pinia Store)
import { defineStore } from 'pinia';
import db from '@/data/db';

// Custom utility functions instead of lodash
/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function cloneDeep(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  const clone = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = cloneDeep(obj[key]);
    }
  }
  
  return clone;
}

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 */
function merge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        merge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return merge(target, ...sources);
}

/**
 * Check if value is an object
 * @param {*} item - Value to check
 * @returns {boolean} True if object
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Get a value from an object by path
 * @param {Object} obj - Object to get value from
 * @param {string} path - Path to value (e.g. 'a.b.c')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Value at path or default value
 */
function get(obj, path, defaultValue = undefined) {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
}

/**
 * Set a value in an object by path
 * @param {Object} obj - Object to set value in
 * @param {string} path - Path to set value at (e.g. 'a.b.c')
 * @param {*} value - Value to set
 * @returns {Object} Modified object
 */
function set(obj, path, value) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined) {
      current[key] = {};
    } else if (typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return obj;
}

// Define a nested settings schema
const DEFAULT_SETTINGS = {
  // Rest of the code remains the same
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
    ...flattenSettings(DEFAULT_SETTINGS),
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
    defaultMode: (state) => state.calculator?.mode || 'Standard',
    activeMode: (state) => state.currentMode === null ? state.calculator?.mode : state.currentMode
  },

  actions: {
    async loadSettings() {
      try {
        const settings = await db.settings.get(1);
        if (settings) {
          // Merge saved settings with defaults to ensure all properties exist
          const mergedSettings = merge({}, DEFAULT_SETTINGS, settings);
          
          // Update state with merged settings (flattened for backward compatibility)
          Object.assign(this, flattenSettings(mergedSettings));
        } else {
          // If no settings exist, save defaults
          await this.saveSettings(DEFAULT_SETTINGS);
        }
        // Initialize currentMode as null to use default mode
        this.currentMode = null;
      } catch (error) {
        console.error('Error loading settings:', error);
        Object.assign(this, flattenSettings(DEFAULT_SETTINGS));
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
        Object.assign(this, flattenSettings(settingsToSave));
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
      this.currentMode = mode !== this.calculator?.mode ? mode : null;
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
      switch (this.startup?.navigation) {
        case 'calculator':
          return '/calculator';
        case 'last-visited':
          // Only use last visited if it's a valid path (not home or error)
          return (this.startup?.lastVisitedPath && 
                 this.startup?.lastVisitedPath !== '/' && 
                 !this.startup?.lastVisitedPath.includes('error'))
            ? this.startup.lastVisitedPath
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

/**
 * Flattens a nested settings object for backward compatibility
 * @param {Object} settings - The nested settings object
 * @returns {Object} A flattened object with underscore-separated keys
 */
function flattenSettings(settings) {
  const result = {};
  
  function flatten(obj, prefix = '') {
    for (const key in obj) {
      if (key === 'id') {
        result[key] = obj[key];
        continue;
      }
      
      const newPrefix = prefix ? `${prefix}_${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        flatten(obj[key], newPrefix);
      } else {
        result[newPrefix] = obj[key];
      }
    }
  }
  
  flatten(settings);
  return result;
}
