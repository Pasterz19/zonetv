const Database = require("better-sqlite3");

const db = new Database("dev.db");

const email = "zonetv@o2.pl";

const stmt = db.prepare("UPDATE User SET role = 'ADMIN' WHERE email = ?");
const info = stmt.run(email);

console.log(`Updated role to ADMIN for ${info.changes} user(s) with email ${email}`);

