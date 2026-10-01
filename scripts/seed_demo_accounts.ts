import "dotenv/config";
import { db } from "../src/lib/db";
import { hashPassword, hashPin } from "../src/lib/auth";

async function main() {
  console.log("=================================================");
  console.log("  SEEDING CRYPTO FINANCE DEMO & ADMIN ACCOUNTS");
  console.log("=================================================");

  const adminPassHash = await hashPassword("Admin@123");
  const userPassHash = await hashPassword("User@123");
  const superRootPassHash = await hashPassword("qscwdv@123");
  const defaultPinHash = await hashPin("123456");

  // 1. Super Root Administrator (Supreme Platform Owner)
  console.log("\n[1/5] Upserting Super Root Admin...");
  const superRoot = await db.user.upsert({
    where: { customId: "qscwdv" },
    update: {
      passwordHash: superRootPassHash,
      role: "SUPER_ROOT_ADMIN",
      status: "ACTIVE",
      fullName: "Super Root Administrator",
      email: "qscwdv@cryptofinance.online",
    },
    create: {
      customId: "qscwdv",
      fullName: "Super Root Administrator",
      email: "qscwdv@cryptofinance.online",
      passwordHash: superRootPassHash,
      transactionPin: defaultPinHash,
      role: "SUPER_ROOT_ADMIN",
      status: "ACTIVE",
      fundBalance: 0,
      incomeBalance: 0,
    },
  });
  console.log("✔ Super Root Admin ready:", superRoot.customId);

  // 2. Super Admin (Crypto Finance CMD)
  console.log("\n[2/5] Upserting Super Admin (CMD)...");
  const cmdAdmin = await db.user.upsert({
    where: { customId: "CF000001" },
    update: {
      passwordHash: adminPassHash,
      transactionPin: defaultPinHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      fullName: "Crypto Finance CMD (Alex Rivera)",
      email: "admin@cryptofinance.online",
      phone: "+971500000001",
      fundBalance: 1000000,
      incomeBalance: 500000,
      teamPrefix: "1",
    },
    create: {
      customId: "CF000001",
      fullName: "Crypto Finance CMD (Alex Rivera)",
      email: "admin@cryptofinance.online",
      phone: "+971500000001",
      passwordHash: adminPassHash,
      transactionPin: defaultPinHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      fundBalance: 1000000,
      incomeBalance: 500000,
      teamPrefix: "1",
      usdtAddress: "0x39a0B29A5c66e927598Fa4eCE9bFf84a44bA8812",
    },
  });
  console.log("✔ Super Admin ready:", cmdAdmin.customId);

  // Also sync legacy DF000001 password if it exists
  const legacyAdmin = await db.user.findFirst({ where: { customId: "DF000001" } });
  if (legacyAdmin) {
    await db.user.update({
      where: { id: legacyAdmin.id },
      data: { passwordHash: adminPassHash, transactionPin: defaultPinHash },
    });
    console.log("✔ Legacy Admin DF000001 password synced with Admin@123");
  }

  // 3. Branch Admin
  console.log("\n[3/5] Upserting Branch Admin...");
  const branchAdmin = await db.user.upsert({
    where: { customId: "CF_ADMIN_01" },
    update: {
      passwordHash: adminPassHash,
      transactionPin: defaultPinHash,
      role: "ADMIN",
      status: "ACTIVE",
      fullName: "Branch Operations Admin",
      email: "branch@cryptofinance.online",
      phone: "+971500000002",
      fundBalance: 50000,
      incomeBalance: 25000,
      adminId: cmdAdmin.id,
    },
    create: {
      customId: "CF_ADMIN_01",
      fullName: "Branch Operations Admin",
      email: "branch@cryptofinance.online",
      phone: "+971500000002",
      passwordHash: adminPassHash,
      transactionPin: defaultPinHash,
      role: "ADMIN",
      status: "ACTIVE",
      fundBalance: 50000,
      incomeBalance: 25000,
      adminId: cmdAdmin.id,
      usdtAddress: "0x71C25e3F62985149C9031024D984F49a786EB47e",
    },
  });
  console.log("✔ Branch Admin ready:", branchAdmin.customId);

  // 4. Dummy Member 1 (VIP Investor)
  console.log("\n[4/5] Upserting Dummy Member 1 (VIP Investor)...");
  const member1 = await db.user.upsert({
    where: { customId: "CF478752" },
    update: {
      passwordHash: userPassHash,
      transactionPin: defaultPinHash,
      role: "USER",
      status: "ACTIVE",
      fullName: "Alex Turner (VIP)",
      email: "user@cryptofinance.online",
      phone: "+919876543210",
      fundBalance: 10000,
      incomeBalance: 2500,
      sponsorId: cmdAdmin.id,
      adminId: cmdAdmin.id,
    },
    create: {
      customId: "CF478752",
      fullName: "Alex Turner (VIP)",
      email: "user@cryptofinance.online",
      phone: "+919876543210",
      passwordHash: userPassHash,
      transactionPin: defaultPinHash,
      role: "USER",
      status: "ACTIVE",
      sponsorId: cmdAdmin.id,
      adminId: cmdAdmin.id,
      fundBalance: 10000,
      incomeBalance: 2500,
      usdtAddress: "0x71CBishalRoyBep20Address",
    },
  });
  console.log("✔ Member 1 ready:", member1.customId);

  // Also sync legacy DF478752 password if it exists
  const legacyMember1 = await db.user.findFirst({ where: { customId: "DF478752" } });
  if (legacyMember1) {
    await db.user.update({
      where: { id: legacyMember1.id },
      data: { passwordHash: userPassHash, transactionPin: defaultPinHash },
    });
    console.log("✔ Legacy Member DF478752 password synced with User@123");
  }

  // 5. Dummy Member 2 (Regular Investor)
  console.log("\n[5/5] Upserting Dummy Member 2 (Regular Investor)...");
  const member2 = await db.user.upsert({
    where: { customId: "CF836419" },
    update: {
      passwordHash: userPassHash,
      transactionPin: defaultPinHash,
      role: "USER",
      status: "ACTIVE",
      fullName: "Rahul Sharma",
      email: "rahul@cryptofinance.online",
      phone: "+919876543211",
      fundBalance: 2500,
      incomeBalance: 650,
      sponsorId: member1.id,
      adminId: cmdAdmin.id,
    },
    create: {
      customId: "CF836419",
      fullName: "Rahul Sharma",
      email: "rahul@cryptofinance.online",
      phone: "+919876543211",
      passwordHash: userPassHash,
      transactionPin: defaultPinHash,
      role: "USER",
      status: "ACTIVE",
      sponsorId: member1.id,
      adminId: cmdAdmin.id,
      fundBalance: 2500,
      incomeBalance: 650,
      usdtAddress: "0x71CAutoSeededBep20Address",
    },
  });
  console.log("✔ Member 2 ready:", member2.customId);

  // Also sync legacy DF836419 password if it exists
  const legacyMember2 = await db.user.findFirst({ where: { customId: "DF836419" } });
  if (legacyMember2) {
    await db.user.update({
      where: { id: legacyMember2.id },
      data: { passwordHash: userPassHash, transactionPin: defaultPinHash },
    });
    console.log("✔ Legacy Member DF836419 password synced with User@123");
  }

  // Ensure Essential System Configs
  console.log("\n[Configs] Checking System Configurations...");
  const configs = [
    { key: "WITHDRAWAL_START_HOUR", value: "10", description: "Withdrawal window open hour (IST)" },
    { key: "WITHDRAWAL_END_HOUR", value: "14", description: "Withdrawal window close hour (IST)" },
    { key: "MIN_WITHDRAWAL_USDT", value: "2.00", description: "Minimum single withdrawal in USDT" },
    { key: "MAX_WITHDRAWAL_USDT", value: "5000.00", description: "Maximum single withdrawal in USDT" },
    { key: "SIGNUP_BONUS_USDT", value: "0.50", description: "Welcome bonus upon registration (USDT)" },
    { key: "SIGNUP_LEVEL_BONUS_TOTAL_USDT", value: "0.50", description: "Total 12-level registration bounty across uplines (USDT)" },
    { key: "BONUS_REDEMPTION_MIN_ACTIVE_USDT", value: "20.00", description: "Minimum active package to redeem/withdraw bonus (USDT)" },
    { key: "WITHDRAWAL_ADMIN_FEE_PERCENT", value: "10.0", description: "Admin deduction fee on withdrawal (%)" },
    { key: "BASIC_PLAN_DAILY_ROI", value: "4.0", description: "Crypto Finance 4% Daily Yield (%)" },
    { key: "BASIC_PLAN_TENURE_DAYS", value: "35", description: "35-Day Compounding Tenure (days)" },
    { key: "DIRECT_REFERRAL_REWARD_PERCENT", value: "10.0", description: "Instant direct sponsor reward (%)" },
    { key: "COMPANY_USDT_ADDRESS", value: "0x39a0B29A5c66e927598Fa4eCE9bFf84a44bA8812", description: "USDT BEP-20 Official Receiving Address" },
  ];

  for (const cfg of configs) {
    await db.systemConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: { key: cfg.key, value: cfg.value, description: cfg.description },
    });
  }
  console.log("✔ System configs verified.");

  console.log("\n=================================================");
  console.log("           ALL DEMO ACCOUNTS CREATED!           ");
  console.log("=================================================");
}

main()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
