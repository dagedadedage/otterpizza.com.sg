const { PrismaClient } = require("@prisma/client");
(async () => {
  const p = new PrismaClient();
  const prod = await p.product.findUnique({ where: { sku: "203" }, select: { sku: true, name: true, inStock: true, imageUrl: true } });
  console.log(JSON.stringify(prod, null, 2));
  await p.$disconnect();
})();
