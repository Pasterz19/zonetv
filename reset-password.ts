// Skrypt do resetowania hasła użytkownika
// Uruchom: npx tsx reset-password.ts
// lub: bun run reset-password.ts

import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

// Ścieżka do bazy danych - dostosuj jeśli potrzeba
const dbPath = process.cwd() + "/dev.db";

const db = createClient({
  url: "file://" + dbPath
});

async function resetPassword() {
  console.log("=== RESET HASŁA ===\n");
  console.log("Baza danych:", dbPath);
  
  // 1. Pokaż wszystkich użytkowników
  const users = await db.execute({
    sql: `SELECT id, email, name, role FROM User`,
    args: []
  });
  
  console.log("\nUżytkownicy w bazie:");
  users.rows.forEach((u: any) => {
    console.log(`  - ${u.email} (${u.role})`);
  });
  
  // 2. Znajdź użytkownika zonetv@o2.pl
  const targetEmail = "zonetv@o2.pl";
  const user = await db.execute({
    sql: `SELECT * FROM User WHERE email = ?`,
    args: [targetEmail]
  });
  
  if (user.rows.length === 0) {
    console.log(`\n❌ Użytkownik ${targetEmail} nie istnieje!`);
    console.log("Tworzę nowego użytkownika ADMIN...");
    
    const newHash = await bcrypt.hash("123456", 10);
    const newId = crypto.randomUUID();
    
    await db.execute({
      sql: `INSERT INTO User (id, email, name, passwordHash, role, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'ADMIN', datetime('now'), datetime('now'))`,
      args: [newId, targetEmail, "Admin", newHash]
    });
    
    console.log(`✅ Utworzono użytkownika: ${targetEmail}`);
    console.log(`✅ Hasło: 123456`);
    return;
  }
  
  // 3. Zaktualizuj hasło
  console.log(`\nAktualizuję hasło dla ${targetEmail}...`);
  const newHash = await bcrypt.hash("123456", 10);
  
  await db.execute({
    sql: `UPDATE User SET passwordHash = ?, updatedAt = datetime('now') WHERE email = ?`,
    args: [newHash, targetEmail]
  });
  
  // 4. Weryfikacja
  const verify = await db.execute({
    sql: `SELECT passwordHash FROM User WHERE email = ?`,
    args: [targetEmail]
  });
  
  const storedHash = (verify.rows[0] as any).passwordHash;
  const isValid = await bcrypt.compare("123456", storedHash);
  
  if (isValid) {
    console.log("\n✅ SUKCES!");
    console.log(`   Email: ${targetEmail}`);
    console.log("   Hasło: 123456");
  } else {
    console.log("\n❌ Błąd weryfikacji hasła!");
  }
}

resetPassword().catch(err => {
  console.error("Błąd:", err);
  process.exit(1);
});
