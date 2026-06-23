import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function tagsToJson(tags: string[]): string {
  return JSON.stringify(tags);
}

async function main() {
  console.log("🌱 Seeding database...");

  // === ADMIN USERS ===
  const adminHash = await bcrypt.hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@otterpizza.com.sg" },
    update: {},
    create: {
      email: "admin@otterpizza.com.sg",
      name: "Super Admin",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin user created");

  // === CATEGORIES ===
  const classic = await prisma.category.upsert({
    where: { slug: "classic-12" },
    update: {},
    create: { name: 'Classic 12"', slug: "classic-12", sortOrder: 1 },
  });
  const premium = await prisma.category.upsert({
    where: { slug: "premium-12" },
    update: {},
    create: { name: 'Premium 12"', slug: "premium-12", sortOrder: 2 },
  });
  const specialty = await prisma.category.upsert({
    where: { slug: "specialty-12" },
    update: {},
    create: { name: 'Specialty 12"', slug: "specialty-12", sortOrder: 3 },
  });
  const sides = await prisma.category.upsert({
    where: { slug: "sides" },
    update: {},
    create: { name: "Sides", slug: "sides", sortOrder: 4 },
  });
  const drinks = await prisma.category.upsert({
    where: { slug: "drinks" },
    update: {},
    create: { name: "Drinks", slug: "drinks", sortOrder: 5 },
  });
  console.log("✅ Categories created");

  // Wix CDN base URL for product images
  const productImg = (filename: string) => `/images/products/${filename}`;

  // === PRODUCTS ===
  const productData = [
    // Classic 12"
    { sku: "101", name: 'OTTER\'S HAWAIIAN 12"', slug: "otters-hawaiian-12", description: "Ham, Pineapple, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 16.80, imageUrl: productImg("101 Otter Hawaian.jpg"), categoryId: classic.id, tags: [], sortOrder: 1 },
    { sku: "102", name: 'HAM & CHEESE SPECIAL 12"', slug: "ham-cheese-special-12", description: "Ham, Cheddar Cheese, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 16.80, imageUrl: productImg("102 Ham and Cheese.jpg"), categoryId: classic.id, tags: [], sortOrder: 2 },
    { sku: "103", name: 'PEPPERONI CLASSIC 12"', slug: "pepperoni-classic-12", description: "Pepperoni, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 16.80, imageUrl: productImg("103 Pepperoni Classic.jpg"), categoryId: classic.id, tags: [], sortOrder: 3 },
    { sku: "104", name: 'BEEF & PINEAPPLE 12"', slug: "beef-pineapple-12", description: "Beef, Pineapple, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 22.80, imageUrl: productImg("104 Beef & Pineapple.jpg"), categoryId: classic.id, tags: [], sortOrder: 4 },
    { sku: "105", name: 'CHEESE MELT 12"', slug: "cheese-melt-12", description: "Mixed Cheeses, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 16.80, imageUrl: productImg("105 Cheese Melt.jpg"), categoryId: classic.id, tags: [], sortOrder: 5 },
    { sku: "106", name: 'MARGHERITA 12"', slug: "margherita-12", description: "Tomato, Basil, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 16.80, imageUrl: productImg("106 Margarita.jpg"), categoryId: classic.id, tags: [], sortOrder: 6 },
    { sku: "107", name: 'VEGGIE DELIGHT 12"', slug: "veggie-delight-12", description: "Mixed Vegetables, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 16.80, imageUrl: productImg("107 Veffie Delight.jpg"), categoryId: classic.id, tags: [], sortOrder: 7 },
    { sku: "108", name: 'MUSHROOM SPECIALITY 12"', slug: "mushroom-speciality-12", description: "Mixed Mushrooms, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 16.80, imageUrl: productImg("108 Mushroom Speciality.jpg"), categoryId: classic.id, tags: [], sortOrder: 8 },

    // Premium 12"
    { sku: "201", name: "OTTER'S ALL-IN SIGNATURE 12\"", slug: "otters-all-in-signature-12", description: "All Premium Toppings, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 22.80, imageUrl: productImg("201 Ottter All in.jpg"), categoryId: premium.id, tags: ["Signature"], sortOrder: 1, isFeatured: true },
    { sku: "202", name: "OTTERS' ALL-MEAT SIGNATURE 12\"", slug: "otters-all-meat-signature-12", description: "Mixed Meats, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 22.80, imageUrl: productImg("202 Otter All Meat.jpg"), categoryId: premium.id, tags: [], sortOrder: 2 },
    { sku: "203", name: 'FOUR CHEESE 12"', slug: "four-cheese-12", description: "Four Cheese Blend, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 22.80, imageUrl: productImg("203 Four Cheese.jpg"), categoryId: premium.id, tags: [], sortOrder: 3, inStock: false },
    { sku: "204", name: 'TERIYAKI CHICKEN 12"', slug: "teriyaki-chicken-12", description: "Chicken, Teriyaki Sauce, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 22.80, imageUrl: productImg("204 Teriyaki Chicken.jpg"), categoryId: premium.id, tags: [], sortOrder: 4 },
    { sku: "205", name: 'FLOSSY BBQ CHICKEN 12"', slug: "flossy-bbq-chicken-12", description: "Chicken, BBQ Sauce, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 22.80, imageUrl: productImg("205 BBQ Chicken.jpg"), categoryId: premium.id, tags: ["Signature"], sortOrder: 5, isFeatured: true },
    { sku: "206", name: 'BEEF UP 12"', slug: "beef-up-12", description: "Beef, Special Sauce, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 22.80, imageUrl: productImg("206 Beef up.jpg"), categoryId: premium.id, tags: [], sortOrder: 6 },
    { sku: "207", name: 'HAWAIIAN OVERLOAD 12"', slug: "hawaiian-overload-12", description: "Extra Ham, Extra Pineapple, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 25.80, imageUrl: productImg("207 Hawaian Over.jpg"), categoryId: premium.id, tags: ["Must-try"], sortOrder: 7, isFeatured: true },
    { sku: "208", name: 'PEPPERONI OVERLOAD 12"', slug: "pepperoni-overload-12", description: "Extra Pepperoni, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 25.80, imageUrl: productImg("208 Peppperoni Over.jpg"), categoryId: premium.id, tags: [], sortOrder: 8 },

    // Specialty 12"
    { sku: "301", name: 'CAJUN PRAWN DELIGHT 12"', slug: "cajun-prawn-delight-12", description: "Prawn, Cajun Spice, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 25.80, imageUrl: productImg("301 Cajun Prawn.jpg"), categoryId: specialty.id, tags: ["Signature"], sortOrder: 1, isFeatured: true },
    { sku: "302", name: 'SEAFOOD FAVOURITE 12"', slug: "seafood-favourite-12", description: "Mixed Seafood, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 22.80, imageUrl: productImg("302 Seafood.jpg"), categoryId: specialty.id, tags: [], sortOrder: 2 },
    { sku: "303", name: 'SMOKED SALMON SPECIAL 12"', slug: "smoked-salmon-special-12", description: "Smoked Salmon, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 25.80, imageUrl: productImg("303 smoked salmon.jpg"), categoryId: specialty.id, tags: [], sortOrder: 3 },
    { sku: "304", name: 'ROTI JOHN 12"', slug: "roti-john-12", description: "Roti John Style, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 22.80, imageUrl: productImg("304 Roti John.jpg"), categoryId: specialty.id, tags: [], sortOrder: 4 },
    { sku: "305", name: 'DELUXE PIZZA BURGER 12"', slug: "deluxe-pizza-burger-12", description: "Pizza-Burger Hybrid, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 22.80, imageUrl: productImg("305 Deluxe Pizza Burger.jpg"), categoryId: specialty.id, tags: [], sortOrder: 5 },
    { sku: "306", name: 'DURIAN MANGO FEAST 12"', slug: "durian-mango-feast-12", description: "Durian, Mango, Mozzarella Cheese, Otter Signature Pizza Sauce", price: 36.80, salePrice: 28.80, imageUrl: productImg("306 Otter Durian Feast.jpeg"), categoryId: specialty.id, tags: ["Must-try"], sortOrder: 6 },

    // Sides
    { sku: "401", name: "CHICKEN DRUMLETS 6PCS", slug: "chicken-drumlets-6pcs", description: "Crispy Chicken Drumlets (6 pieces)", price: 8.80, imageUrl: productImg("401 Chicken Drumlets.jpg"), categoryId: sides.id, tags: [], sortOrder: 1 },
    { sku: "402", name: "POTATO WEDGES WITH DIP", slug: "potato-wedges-with-dip", description: "Crispy Potato Wedges with Dipping Sauce", price: 5.80, imageUrl: productImg("402 Potato Wedges.jpg"), categoryId: sides.id, tags: [], sortOrder: 2 },
    { sku: "403", name: "CHICKEN NUGGETS", slug: "chicken-nuggets", description: "Crispy Chicken Nuggets", price: 5.80, imageUrl: productImg("403 Chicken Nugget.jpg"), categoryId: sides.id, tags: [], sortOrder: 3 },
    { sku: "404", name: "GARLIC BREAD", slug: "garlic-bread", description: "Toasted Garlic Bread", price: 5.80, imageUrl: productImg("404 Garlic Bread.jpg"), categoryId: sides.id, tags: [], sortOrder: 4 },
    { sku: "405", name: "CINNAMON BREAD", slug: "cinnamon-bread", description: "Sweet Cinnamon Bread with Icing", price: 6.80, imageUrl: productImg("405 Cinnamon Bread.jpg"), categoryId: sides.id, tags: [], sortOrder: 5 },

    // Drinks
    { sku: "501", name: "COKE", slug: "coke", description: "Coca-Cola (330ml)", price: 2.00, categoryId: drinks.id, tags: [], sortOrder: 1 },
    { sku: "502", name: "SPRITE", slug: "sprite", description: "Sprite (330ml)", price: 2.00, categoryId: drinks.id, tags: [], sortOrder: 2 },
    { sku: "503", name: "100PLUS", slug: "100plus", description: "100PLUS (330ml)", price: 2.00, categoryId: drinks.id, tags: [], sortOrder: 3 },
    { sku: "504", name: "ICE LEMON TEA", slug: "ice-lemon-tea", description: "Ice Lemon Tea (330ml)", price: 2.00, categoryId: drinks.id, tags: [], sortOrder: 4 },
    { sku: "505", name: "RIBENA SPARKLING", slug: "ribena-sparkling", description: "Ribena Sparkling (330ml)", price: 2.00, categoryId: drinks.id, tags: [], sortOrder: 5 },
  ];

  await prisma.product.deleteMany();

  for (const product of productData) {
    const { tags, inStock, ...rest } = product;
    await prisma.product.create({
      data: {
        ...rest,
        tags: tagsToJson(tags),
        inStock: inStock ?? true,
      },
    });
  }
  console.log(`✅ ${productData.length} products created`);

  // === STORES ===
  const storeData = [
    { name: "Hougang", address: "21 Hougang Street 51", unit: "#01-15", building: "Hougang Green", postalCode: "538719", latitude: 1.3725, longitude: 103.8936, grabUrl: "https://food.grab.com/sg/en/restaurant/otter-pizza-hougang-green-shopping-mall-delivery/4-C34ZRTNVDEDTEE", foodpandaUrl: "https://www.foodpanda.sg/restaurant/owl4/otter-pizza-hougang-green", sortOrder: 1 },
    { name: "Bukit Panjang", address: "1 Woodlands Road", unit: "#01-03", building: "Junction 10", postalCode: "677899", latitude: 1.3804, longitude: 103.7630, grabUrl: "https://food.grab.com/sg/en/restaurant/otter-pizza-junction-10-delivery/4-C6CGVGCZL32XSA", foodpandaUrl: "https://www.foodpanda.sg/restaurant/mqbe/otter-pizza-junction-10", sortOrder: 2 },
    { name: "Serangoon", address: "9 Yio Chu Kang Road", unit: "#01-01", building: "Space @ Kovan", postalCode: "545523", latitude: 1.3594, longitude: 103.8831, sortOrder: 3 },
    { name: "Bt Batok West", address: "4 Bukit Batok Street 41", unit: "#01-72", building: "Le Quest", postalCode: "657991", latitude: 1.3491, longitude: 103.7492, grabUrl: "https://food.grab.com/sg/en/restaurant/otter-pizza-le-quest-delivery/4-C63XAANEC262LJ", foodpandaUrl: "https://www.foodpanda.sg/restaurant/ldby/otter-pizza-le-quest-mall", sortOrder: 4 },
    { name: "Potong Pasir", address: "51 Upper Serangoon Road", unit: "#01-13", building: "Poiz Centre", postalCode: "347697", latitude: 1.3320, longitude: 103.8695, grabUrl: "https://food.grab.com/sg/en/restaurant/otter-pizza-the-poiz-centre-delivery/4-C3UWEKDVGFWKJ6", foodpandaUrl: "https://www.foodpanda.sg/restaurant/xe6u/otter-pizza-poiz-centre", sortOrder: 5 },
    { name: "Pasir Ris", address: "1 Pasir Ris Central Street 3", unit: "#03-K01", building: "White Sands", postalCode: "518457", latitude: 1.3721, longitude: 103.9496, sortOrder: 6 },
    { name: "Buona Vista", address: "35 Rochester Drive", unit: "#01-08", building: "Rochester Mall", postalCode: "138639", latitude: 1.3061, longitude: 103.7874, grabUrl: "https://food.grab.com/sg/en/restaurant/otter-pizza-the-rochester-delivery/4-C4LTABE3GNNKRX", foodpandaUrl: "https://www.foodpanda.sg/restaurant/qzzp/otter-pizza-rochester-mall", sortOrder: 7 },
    { name: "Novena", address: "10 Sinaran Drive", unit: "#01-22", building: "Square 2", postalCode: "307506", latitude: 1.3205, longitude: 103.8444, grabUrl: "https://food.grab.com/sg/en/restaurant/otter-pizza-square-2-delivery/4-C6DAR2JWT8DWV6", foodpandaUrl: "https://www.foodpanda.sg/restaurant/krxm/otter-pizza-square-2", sortOrder: 8 },
    { name: "Bukit Timah", address: "1 Jalan Anak Bukit", unit: "#B1-43", building: "Bukit Timah Plaza", postalCode: "588996", latitude: 1.3388, longitude: 103.7767, grabUrl: "https://food.grab.com/sg/en/restaurant/otter-pizza-bukit-timah-plaza-delivery/4-C7BERTBGNCMJVA", foodpandaUrl: "https://www.foodpanda.sg/restaurant/f3xg/otter-pizza-bukit-timah-plaza", sortOrder: 9 },
  ];

  await prisma.store.deleteMany();
  for (const store of storeData) {
    await prisma.store.create({ data: store });
  }
  console.log(`✅ ${storeData.length} stores created`);

  // === PROMOTIONS ===
  await prisma.promotion.createMany({
    data: [
      { name: "Free Delivery", description: "FREE DELIVERY for orders above $60", minAmount: 60.00, type: "FREE_DELIVERY", value: 0, isActive: true },
      { name: "10% Off", description: "10% OFF for orders above $200", minAmount: 200.00, type: "PERCENTAGE_DISCOUNT", value: 10, isActive: true },
      { name: "15% Off", description: "15% OFF for orders above $500", minAmount: 500.00, type: "PERCENTAGE_DISCOUNT", value: 15, isActive: true },
    ],
  });
  console.log("✅ Promotions created");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
