import Dexie from "dexie";

const db = new Dexie('mathlly-db');

db.version(4).stores({
  history: '++id,timestamp',
  settings: 'id'
}).upgrade(tx => {
  // This will run if upgrading from version 2 to 3
  return tx.settings.toCollection().modify(settings => {
    // Convert flat settings to nested structure if needed
    if (settings && !settings.display && settings.precision !== undefined) {
      // Create nested structure
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
          syntaxHighlighting: settings.syntaxHighlighting || true,
        },
        calculator: {
          mode: settings.mode,
        },
        appearance: {
          theme: settings.theme,
          animationDisabled: settings.animationDisabled,
        },
        startup: {
          navigation: settings.startupNavigation || 'home',
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

// Perform database upgrade
db.on("ready", async () => {
  // If there are no settings, create default settings
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
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
        mode: 'Standard',
      },
      appearance: {
        theme: 'system',
        animationDisabled: false,
      },
      startup: {
        navigation: 'home',
      }
    });
  }
});

export default db;
