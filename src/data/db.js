import Dexie from "dexie";
import { DEFAULT_SETTINGS } from '@/stores/settings'

const db = new Dexie('mathlly-db');

db.version(4).stores({
  history: '++id,timestamp',
  settings: 'id'
}).upgrade(tx => {
  return tx.settings.toCollection().modify(settings => {
    if (settings && !settings.display && settings.precision !== undefined) {
      const newSettings = {
        id: settings.id,
        display: {
          precision: settings.precision,
          useFractions: settings.useFractions,
          formatting: {
            useThousandsSeparator: settings.useThousandsSeparator,
            formatBinary: settings.formatBinary,
            formatHexadecimal: settings.formatHexadecimal,
            formatOctal: settings.formatOctal,
          },
          syntaxHighlighting: settings.syntaxHighlighting,
          textSize: settings.textSize,
        },
        calculator: {
          mode: settings.mode,
        },
        appearance: {
          theme: settings.theme,
          animationDisabled: settings.animationDisabled,
          checkForUpdates: settings.checkForUpdates,
        },
        startup: {
          navigation: settings.navigation,
        }
      };
      
      // Replace the old settings with the new structure
      Object.keys(settings).forEach(key => {
        delete settings[key];
      });
      
      Object.assign(settings, newSettings);
    }
  });
});

// Function to reset the database
export async function resetDatabase() {
  try {
    // Close the current database connection
    await db.close();
    
    // Delete the database completely
    await Dexie.delete('mathlly-db');
    
    // Reload the page to reinitialize the database with defaults
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error("Error resetting database:", error);
    return false;
  }
}

// Perform database upgrade
db.on("ready", async () => {
  // If there are no settings, create default settings
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add(DEFAULT_SETTINGS);
  }
});

export default db;
