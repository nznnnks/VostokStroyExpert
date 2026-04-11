import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { PrismaClient } from "@prisma/client";

const scryptAsync = promisify(scrypt);

async function hashPassword(value) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(value, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

async function main() {
  const prisma = new PrismaClient();
  const email = process.env.ADMIN_EMAIL ?? "admin@vostokstroyexpert.local";
  const password = process.env.ADMIN_PASSWORD ?? "admin12345";

  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (existing) {
    console.log("Admin user already exists:", email);
    return;
  }

  const passwordHash = await hashPassword(password);

  await prisma.adminUser.create({
    data: {
      email,
      firstName: "Администратор",
      lastName: "Системы",
      role: "SUPERADMIN",
      isActive: true,
      passwordHash,
    },
  });

  console.log("Admin user created:", email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });
