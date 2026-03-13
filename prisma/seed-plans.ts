/**
 * Seed script for subscription plans and sample vouchers
 * Run: bunx tsx prisma/seed-plans.ts
 */

import "dotenv/config";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const databaseUrl = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), "dev.db")}`;
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding subscription plans and vouchers...\n");

  // ========================================
  // 1. SUBSCRIPTION PLANS
  // ========================================
  console.log("📋 Creating subscription plans...");

  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Idealny na start. Dostęp do starszych produkcji.",
      features: JSON.stringify([
        "Klasyki kina",
        "Seriale archiwalne",
        "Jakość HD (720p)",
        "1 profil",
        "1 urządzenie",
        "Reklamy co 30 minut",
      ]),
      tier: 0,
      maxProfiles: 1,
      maxDevices: 1,
      quality: "HD",
      isPromoted: false,
    },
    {
      name: "Silver",
      price: 29,
      description: "Pełna biblioteka VOD bez ograniczeń.",
      features: JSON.stringify([
        "Wszystkie filmy i seriale",
        "Jakość Full HD (1080p)",
        "2 profile",
        "2 urządzenia",
        "Bez reklam",
        "Pobieranie na mobile",
        "Historia oglądania",
      ]),
      tier: 1,
      maxProfiles: 2,
      maxDevices: 2,
      quality: "Full HD",
      isPromoted: true,
    },
    {
      name: "Gold",
      price: 49,
      description: "Kompletny pakiet rozrywki dla całej rodziny.",
      features: JSON.stringify([
        "Wszystkie filmy i seriale",
        "TV Live - ponad 100 kanałów",
        "Jakość 4K Ultra HD",
        "4 profile",
        "4 urządzenia",
        "Bez reklam",
        "Pobieranie na mobile",
        "Priorytetowe wsparcie",
        "Wczesny dostęp do premier",
      ]),
      tier: 2,
      maxProfiles: 4,
      maxDevices: 4,
      quality: "4K",
      isPromoted: false,
    },
    {
      name: "Live",
      price: 19,
      description: "Dla miłośników tradycyjnej telewizji.",
      features: JSON.stringify([
        "Tylko telewizja na żywo",
        "Ponad 100 kanałów polskich",
        "Jakość HD/4K",
        "1 profil",
        "2 urządzenia",
        "Przewodnik programowy EPG",
        "Funkcja timeshift",
      ]),
      tier: 3,
      maxProfiles: 1,
      maxDevices: 2,
      quality: "HD",
      isPromoted: false,
    },
  ];

  for (const plan of plans) {
    const result = await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`  ✅ Plan: ${result.name} (${Number(result.price)} PLN)`);
  }

  // ========================================
  // 2. VOUCHERS
  // ========================================
  console.log("\n🎫 Creating sample vouchers...");

  const vouchers = [
    {
      code: "WELCOME10",
      type: "PERCENTAGE" as const,
      value: 10,
      maxUses: 1000,
      maxPerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      description: "10% zniżki dla nowych użytkowników",
      isActive: true,
    },
    {
      code: "SILVER20",
      type: "PERCENTAGE" as const,
      value: 20,
      maxUses: 500,
      maxPerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      description: "20% zniżki na plan Silver",
      isActive: true,
    },
    {
      code: "GOLD50",
      type: "FIXED_AMOUNT" as const,
      value: 50,
      maxUses: 100,
      maxPerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      description: "50 PLN zniżki na plan Gold",
      isActive: true,
    },
    {
      code: "FREE7DAYS",
      type: "FREE_TRIAL" as const,
      value: 7,
      maxUses: 2000,
      maxPerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
      description: "7 dni darmowego okresu próbnego",
      isActive: true,
    },
    {
      code: "VIPACCESS",
      type: "FREE_TRIAL" as const,
      value: 30,
      maxUses: 50,
      maxPerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      description: "30 dni VIP - tylko dla wybranych",
      isActive: true,
    },
    {
      code: "BLACKFRIDAY",
      type: "PERCENTAGE" as const,
      value: 50,
      maxUses: 500,
      maxPerUser: 1,
      validFrom: new Date("2025-11-20"),
      validUntil: new Date("2025-12-01"),
      description: "Black Friday - 50% zniżki!",
      isActive: false, // Aktywuje się w odpowiednim czasie
    },
  ];

  for (const voucher of vouchers) {
    try {
      const result = await prisma.voucher.upsert({
        where: { code: voucher.code },
        update: voucher,
        create: voucher,
      });
      console.log(`  ✅ Voucher: ${result.code} (${voucher.type} - ${voucher.value}${voucher.type === 'PERCENTAGE' ? '%' : voucher.type === 'FIXED_AMOUNT' ? ' PLN' : ' dni'})`);
    } catch (error) {
      console.log(`  ⚠️ Voucher ${voucher.code} skipped`);
    }
  }

  // ========================================
  // 3. SAMPLE PAYMENT METHOD (Stripe test)
  // ========================================
  console.log("\n💳 Note: Stripe test cards for development:");
  console.log("  • 4242 4242 4242 4242 - Success");
  console.log("  • 4000 0000 0000 0002 - Decline");
  console.log("  • 4000 0000 0000 9995 - Insufficient funds");

  // ========================================
  // 4. SUMMARY
  // ========================================
  console.log("\n" + "=".repeat(50));
  console.log("✨ Seed completed successfully!");
  console.log("=".repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   Plans: ${plans.length}`);
  console.log(`   Vouchers: ${vouchers.length}`);
  console.log(`\n🔗 Test vouchers:`);
  vouchers.filter(v => v.isActive).forEach(v => {
    console.log(`   • ${v.code} - ${v.description}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
