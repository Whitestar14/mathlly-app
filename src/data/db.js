import Dexie from "dexie";

const db = new Dexie("CalculatorDB");
db.version(2).stores({
  history: "++id, expression, result, timestamp",
  settings: "id, precision, useFractions, useThousandsSeparator, theme, mode"
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
      theme: 'system',
      mode: 'Standard'
    });
  }
});

export default db;