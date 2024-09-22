import Dexie from "dexie";

const db = new Dexie("CalculatorDB");
db.version(1).stores({
  history: "++id, expression, result, timestamp",
  settings: "++id, precision, useFractions, useThousandsSeparator",
});

export default db;
