import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "prochee" },
    update: { name: "Прочее" },
    create: { slug: "prochee", name: "Прочее", sortOrder: 999 },
    select: { id: true, name: true, slug: true },
  });

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ category }, null, 2));
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

