import Dexie from "dexie";

const db = new Dexie('mathlly-db');

db.version(2).stores({
  history: '++id,timestamp',
  settings: 'id'
});

// Perform database upgrade
db.on("ready", async () => {
  // If there are no settings, create default settings
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: 1, // Use a fixed ID
      precision: 4,
      useFractions: false,
      useThousandsSeparator: true,
      formatBinary: true,
      formatHexadecimal: true,
      formatOctal: true,
      theme: 'system',
      mode: 'Standard',
      animationDisabled: false,
    });
  }
});

export default db;