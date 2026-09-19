// Ajaa TypeScript-skriptin sovelluksen @/-aliaksella: node scripts/run-ts.cjs scripts/<nimi>.ts
const { join, resolve } = require("node:path");
const jiti = require("jiti")(__filename, { alias: { "@": join(__dirname, "..") }, interopDefault: true });
jiti(resolve(process.argv[2]));
