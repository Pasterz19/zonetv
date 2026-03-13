const Database = require("better-sqlite3");

const db = new Database("dev.db", { readonly: true });

const email = "zonetv@o2.pl";

const user = db
  .prepare("SELECT id, email, role, createdAt, updatedAt FROM User WHERE email = ?")
  .get(email);

console.log("USER:", user);

if (!user) process.exit(0);

const subs = db
  .prepare(
    "SELECT id, userId, active, startedAt, endsAt FROM Subscription WHERE userId = ? ORDER BY startedAt DESC",
  )
  .all(user.id);

console.log("SUBSCRIPTIONS:", subs);

