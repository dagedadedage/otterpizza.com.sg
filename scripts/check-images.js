const { PrismaClient } = require("@prisma/client");
(async () => {
  const p = new PrismaClient();
  const prods = await p.product.findMany({
    take: 3,
    select: { sku: true, name: true, imageUrl: true },
  });
  console.log(JSON.stringify(prods, null, 2));
  await p.$disconnect();
})();
