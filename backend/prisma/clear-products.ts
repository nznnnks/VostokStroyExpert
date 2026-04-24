import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const confirm = (process.env.CONFIRM_DELETE_PRODUCTS ?? "").toLowerCase();
  if (confirm !== "yes") {
    throw new Error(
      "Refusing to delete products. Set CONFIRM_DELETE_PRODUCTS=yes to continue.",
    );
  }

  if (process.env.NODE_ENV === "production" && process.env.FORCE_PROD_DELETE !== "1") {
    throw new Error(
      "Refusing to delete products in production. Set FORCE_PROD_DELETE=1 to continue.",
    );
  }

  const beforeProducts = await prisma.product.count();
  const beforeFilterValues = await prisma.productFilterValue.count();

  const [filterValuesResult, productsResult] = await prisma.$transaction([
    prisma.productFilterValue.deleteMany({}),
    prisma.product.deleteMany({}),
  ]);

  const afterProducts = await prisma.product.count();
  const afterFilterValues = await prisma.productFilterValue.count();

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        before: { products: beforeProducts, productFilterValues: beforeFilterValues },
        deleted: {
          productFilterValues: filterValuesResult.count,
          products: productsResult.count,
        },
        after: { products: afterProducts, productFilterValues: afterFilterValues },
      },
      null,
      2,
    ),
  );
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

