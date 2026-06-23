const { PrismaClient } = require("@prisma/client");

async function main() {
  const p = new PrismaClient();
  const before = await p.store.count();
  console.log("Before:", before, "stores");
  await p.store.deleteMany();
  console.log("All stores cleared");
  await p.$disconnect();
}

main();
