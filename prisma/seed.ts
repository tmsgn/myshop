// prisma/seed.ts

import { PrismaClient, ProductStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

function getRandomSubset<T>(array: T[], min: number, max: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return shuffled.slice(0, count);
}

function cartesian<T>(...arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
    [[]]
  );
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function main() {
  console.log("🚀 Start seeding...");

  console.log("🧹 Deleting existing data...");
  await prisma.$transaction([
    prisma.variantOption.deleteMany(),
    prisma.productOption.deleteMany(),
    prisma.variant.deleteMany(),
    prisma.image.deleteMany(),
    prisma.product.deleteMany(),
    prisma.optionValue.deleteMany(),
    prisma.option.deleteMany(),
    prisma.subcategory.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.category.deleteMany(),
  ]);

  console.log("🌱 Creating Categories and Brands...");
  const categoriesData = [
    { name: "Clothing" },
    { name: "Electronics" },
    { name: "Home & Garden" },
    { name: "Books" },
    { name: "Sports & Outdoors" },
    { name: "Beauty & Personal Care" },
    { name: "Toys & Games" },
    { name: "Automotive" },
    { name: "Health & Wellness" },
    { name: "Office Supplies" },
    { name: "Pet Supplies" }
  ].map((c) => ({ ...c, slug: slugify(c.name) }));

  const brandsData = [
    { name: "Nike", categories: ["Clothing", "Sports & Outdoors"] },
    { name: "Adidas", categories: ["Clothing", "Sports & Outdoors"] },
    { name: "Levi's", categories: ["Clothing"] },
    { name: "Apple", categories: ["Electronics"] },
    { name: "Samsung", categories: ["Electronics"] },
    { name: "Sony", categories: ["Electronics"] },
    { name: "IKEA", categories: ["Home & Garden"] },
    { name: "Weber", categories: ["Home & Garden"] },
    { name: "Penguin Random House", categories: ["Books"] },
    { name: "The North Face", categories: ["Clothing", "Sports & Outdoors"] },
    { name: "L'Oreal", categories: ["Beauty & Personal Care"] },
    { name: "Hot Wheels", categories: ["Toys & Games"] },
    { name: "Ford", categories: ["Automotive"] },
    { name: "Philips", categories: ["Health & Wellness", "Electronics"] },
    { name: "HP", categories: ["Office Supplies", "Electronics"] },
    { name: "Purina", categories: ["Pet Supplies"] }
  ];

  await prisma.category.createMany({ data: categoriesData });
  const createdCategories = await prisma.category.findMany();
  const categoryMap = new Map(createdCategories.map((c) => [c.name, c.id]));

  for (const brand of brandsData) {
    const categoryIds = brand.categories.map((name) => ({ id: categoryMap.get(name)! }));
    await prisma.brand.create({
      data: {
        name: brand.name,
        slug: slugify(brand.name),
        categories: { connect: categoryIds },
      },
    });
  }

  console.log("🌱 Creating Subcategories, Options, and Values...");
  const subcategoryDefinitions = {
    Clothing: [
      { name: "T-Shirts", options: ["Color", "Size", "Material"] },
      { name: "Jeans", options: ["Waist", "Length", "Color"] },
      { name: "Jackets", options: ["Size", "Material", "Color"] }
    ],
    Electronics: [
      { name: "Smartphones", options: ["Color", "Storage", "Finish"] },
      { name: "Laptops", options: ["RAM", "Storage", "Screen Size"] },
      { name: "Headphones", options: ["Type", "Color"] },
      { name: "Tablets", options: ["Storage", "Color"] }
    ],
    "Home & Garden": [
      { name: "Furniture", options: ["Material", "Color"] },
      { name: "Lighting", options: ["Type", "Wattage"] },
      { name: "Grills", options: ["Fuel Type", "Material"] }
    ],
    Books: [
      { name: "Fiction", options: ["Format"] },
      { name: "Non-fiction", options: ["Format"] },
      { name: "Textbooks", options: ["Format", "Edition"] }
    ],
    "Sports & Outdoors": [
      { name: "Tents", options: ["Capacity"] },
      { name: "Bikes", options: ["Frame Size", "Color"] },
      { name: "Fitness Equipment", options: ["Weight", "Type"] }
    ],
    "Beauty & Personal Care": [
      { name: "Skincare", options: ["Skin Type", "Volume"] },
      { name: "Makeup", options: ["Shade", "Type"] }
    ],
    "Toys & Games": [
      { name: "Building Sets", options: ["Age Range", "Pieces"] },
      { name: "Action Figures", options: ["Franchise"] }
    ],
    Automotive: [
      { name: "Car Accessories", options: ["Material", "Color"] },
      { name: "Tools", options: ["Type", "Size"] }
    ],
    "Health & Wellness": [
      { name: "Supplements", options: ["Type", "Volume"] },
      { name: "First Aid", options: ["Type"] }
    ],
    "Office Supplies": [
      { name: "Printers", options: ["Type", "Color"] },
      { name: "Stationery", options: ["Type", "Color"] }
    ],
    "Pet Supplies": [
      { name: "Pet Food", options: ["Flavor", "Weight"] },
      { name: "Toys", options: ["Type", "Material"] }
    ]
  };

  const optionValueDefinitions = {
    Color: ["Red", "Blue", "Black", "White", "Green", "Gray", "Yellow", "Pink"],
    Size: ["XS", "S", "M", "L", "XL", "XXL"],
    Material: ["Cotton", "Polyester", "Leather", "Wood", "Metal", "Plastic"],
    Waist: ["28", "30", "32", "34", "36"],
    Length: ["30", "32", "34"],
    "Shoe Size": ["6", "7", "8", "9", "10", "11", "12"],
    Storage: ["64GB", "128GB", "256GB", "512GB", "1TB"],
    Finish: ["Matte", "Glossy", "Titanium"],
    RAM: ["4GB", "8GB", "16GB", "32GB"],
    "Screen Size": ['11"', '13"', '15"', '17"'],
    Type: ["Over-Ear", "In-Ear", "On-Ear", "Inkjet", "Laser", "Resistance Band"],
    "Fuel Type": ["Gas", "Charcoal", "Electric"],
    Format: ["Hardcover", "Paperback", "E-book"],
    Capacity: ["1-person", "2-person", "4-person", "6-person"],
    Wattage: ["10W", "30W", "60W", "100W"],
    Edition: ["1st", "2nd", "3rd"],
    "Skin Type": ["Oily", "Dry", "Normal", "Combination"],
    Volume: ["50ml", "100ml", "250ml", "500ml"],
    Shade: ["Light", "Medium", "Dark"],
    "Age Range": ["3-5", "6-8", "9-12", "13+"],
    Pieces: ["50", "100", "200", "500"],
    Franchise: ["Marvel", "Star Wars", "DC"],
    "Frame Size": ["Small", "Medium", "Large"],
    Weight: ["1kg", "2kg", "5kg", "10kg"],
    Flavor: ["Chicken", "Beef", "Fish", "Lamb"]
  };

  for (const [catName, subcats] of Object.entries(subcategoryDefinitions)) {
    for (const subcatData of subcats) {
      const subcategory = await prisma.subcategory.create({
        data: { name: subcatData.name, categoryId: categoryMap.get(catName)! },
      });
      for (const optionName of subcatData.options) {
        const option = await prisma.option.create({
          data: { name: optionName, subcategoryId: subcategory.id },
        });
        const values = optionValueDefinitions[optionName as keyof typeof optionValueDefinitions];
        if (values) {
          await prisma.optionValue.createMany({
            data: values.map((value) => ({ value, optionId: option.id })),
          });
        }
      }
    }
  }

  console.log("✅ Catalog seeding finished successfully.");
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });