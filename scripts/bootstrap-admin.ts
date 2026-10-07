// Production bootstrap: creates ONE Super Admin from env. No demo data.
// Usage: ADMIN_EMAIL=you@forcepk.com ADMIN_PASSWORD='strong-pass' npx tsx scripts/bootstrap-admin.ts
import { PrismaClient, Role, AccountStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "ForcePK Owner";
  if (!email || !password || password.length < 8) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars).");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: Role.SUPER_ADMIN, status: AccountStatus.VERIFIED },
    create: { email, name, role: Role.SUPER_ADMIN, status: AccountStatus.VERIFIED, twoFactor: true, passwordHash },
  });
  console.log(`✅ Super Admin ready: ${user.email}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
