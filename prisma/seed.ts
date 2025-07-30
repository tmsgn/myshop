// prisma/seed.ts

import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

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
  console.log("🚀 Start seeding large-scale catalog structure...");

  console.log("🧹 Deleting existing data...");
  // This order respects foreign key constraints for a clean wipe.
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.orderProduct.deleteMany(),
    prisma.order.deleteMany(),
    prisma.variantOption.deleteMany(),
    prisma.productOption.deleteMany(),
    prisma.image.deleteMany(),
    prisma.variant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.optionValue.deleteMany(),
    prisma.option.deleteMany(),
    prisma.subcategory.deleteMany(),
    // Brands must be deleted before categories due to their relation
    prisma.brand.deleteMany(),
    prisma.category.deleteMany(),
    prisma.store.deleteMany(),
  ]);

  console.log("🌱 Creating 14 Top-Level Categories...");
  const categoriesData = [
    { name: "Men's Fashion" },
    { name: "Women's Fashion" },
    { name: "Electronics" },
    { name: "Home & Living" },
    { name: "Health & Beauty" },
    { name: "Sports & Outdoors" },
    { name: "Toys & Hobbies" },
    { name: "Books, Music & Media" },
    { name: "Groceries & Gourmet Food" },
    { name: "Automotive & Industrial" },
    { name: "Office & Stationery" },
    { name: "Pet Supplies" },
    { name: "Jewelry & Accessories" },
    { name: "Tools & Home Improvement" },
  ].map((c) => ({ ...c, slug: slugify(c.name) }));

  await prisma.category.createMany({ data: categoriesData });
  const createdCategories = await prisma.category.findMany();
  const categoryMap = new Map(createdCategories.map((c) => [c.name, c.id]));
  console.log(`✅ Created ${createdCategories.length} categories.`);

  console.log("🌱 Creating 125+ Brands and linking to categories...");
  const brandsData = [
    // Fashion
    {
      name: "Nike",
      categories: [
        "Men's Fashion",
        "Women's Fashion",
        "Sports & Outdoors",
        "Jewelry & Accessories",
      ],
    },
    {
      name: "Adidas",
      categories: ["Men's Fashion", "Women's Fashion", "Sports & Outdoors"],
    },
    { name: "Levi's", categories: ["Men's Fashion", "Women's Fashion"] },
    { name: "Zara", categories: ["Men's Fashion", "Women's Fashion"] },
    { name: "H&M", categories: ["Men's Fashion", "Women's Fashion"] },
    {
      name: "Gucci",
      categories: ["Men's Fashion", "Women's Fashion", "Jewelry & Accessories"],
    },
    { name: "Calvin Klein", categories: ["Men's Fashion", "Women's Fashion"] },
    {
      name: "The North Face",
      categories: ["Men's Fashion", "Women's Fashion", "Sports & Outdoors"],
    },
    { name: "Lululemon", categories: ["Women's Fashion", "Sports & Outdoors"] },
    {
      name: "Patagonia",
      categories: ["Men's Fashion", "Women's Fashion", "Sports & Outdoors"],
    },
    {
      name: "Under Armour",
      categories: ["Men's Fashion", "Women's Fashion", "Sports & Outdoors"],
    },
    {
      name: "Puma",
      categories: ["Men's Fashion", "Women's Fashion", "Sports & Outdoors"],
    },
    { name: "Rolex", categories: ["Jewelry & Accessories"] },
    { name: "Casio", categories: ["Jewelry & Accessories", "Electronics"] },
    {
      name: "Michael Kors",
      categories: ["Women's Fashion", "Jewelry & Accessories"],
    },
    { name: "Ray-Ban", categories: ["Jewelry & Accessories"] },

    // Electronics
    { name: "Apple", categories: ["Electronics", "Office & Stationery"] },
    { name: "Samsung", categories: ["Electronics", "Home & Living"] },
    { name: "Sony", categories: ["Electronics", "Books, Music & Media"] },
    { name: "Dell", categories: ["Electronics", "Office & Stationery"] },
    { name: "HP", categories: ["Electronics", "Office & Stationery"] },
    { name: "LG", categories: ["Electronics", "Home & Living"] },
    { name: "Bose", categories: ["Electronics"] },
    { name: "JBL", categories: ["Electronics"] },
    { name: "Canon", categories: ["Electronics", "Office & Stationery"] },
    { name: "Nikon", categories: ["Electronics"] },
    { name: "GoPro", categories: ["Electronics", "Sports & Outdoors"] },
    { name: "DJI", categories: ["Electronics", "Toys & Hobbies"] },
    { name: "Garmin", categories: ["Electronics", "Sports & Outdoors"] },
    { name: "Fitbit", categories: ["Electronics", "Sports & Outdoors"] },
    { name: "Microsoft", categories: ["Electronics", "Office & Stationery"] },
    { name: "Logitech", categories: ["Electronics", "Office & Stationery"] },
    { name: "Razer", categories: ["Electronics", "Toys & Hobbies"] },
    { name: "Intel", categories: ["Electronics"] },
    { name: "AMD", categories: ["Electronics"] },
    { name: "Nvidia", categories: ["Electronics"] },

    // Home, Tools & Garden
    { name: "IKEA", categories: ["Home & Living", "Office & Stationery"] },
    { name: "Dyson", categories: ["Home & Living"] },
    {
      name: "Philips",
      categories: ["Home & Living", "Health & Beauty", "Electronics"],
    },
    { name: "KitchenAid", categories: ["Home & Living"] },
    {
      name: "Nespresso",
      categories: ["Home & Living", "Groceries & Gourmet Food"],
    },
    { name: "Weber", categories: ["Home & Living", "Sports & Outdoors"] },
    { name: "DeWalt", categories: ["Tools & Home Improvement"] },
    { name: "Makita", categories: ["Tools & Home Improvement"] },
    {
      name: "Bosch",
      categories: ["Tools & Home improvement", "Automotive & Industrial"],
    },
    { name: "Stanley", categories: ["Tools & Home Improvement"] },
    {
      name: "Kärcher",
      categories: ["Tools & Home Improvement", "Automotive & Industrial"],
    },

    // Health & Beauty
    { name: "L'Oréal", categories: ["Health & Beauty"] },
    { name: "Gillette", categories: ["Health & Beauty"] },
    { name: "Nivea", categories: ["Health & Beauty"] },
    { name: "Maybelline", categories: ["Health & Beauty"] },
    { name: "Oral-B", categories: ["Health & Beauty"] },
    { name: "The Body Shop", categories: ["Health & Beauty"] },
    { name: "Sephora", categories: ["Health & Beauty"] },
    { name: "Dove", categories: ["Health & Beauty"] },

    // Toys, Books & Hobbies
    { name: "Lego", categories: ["Toys & Hobbies"] },
    { name: "Hasbro", categories: ["Toys & Hobbies"] },
    { name: "Mattel", categories: ["Toys & Hobbies"] },
    { name: "Hot Wheels", categories: ["Toys & Hobbies"] },
    { name: "Barbie", categories: ["Toys & Hobbies"] },
    { name: "Nintendo", categories: ["Electronics", "Toys & Hobbies"] },
    { name: "PlayStation", categories: ["Electronics", "Toys & Hobbies"] },
    { name: "Xbox", categories: ["Electronics", "Toys & Hobbies"] },
    { name: "Penguin Random House", categories: ["Books, Music & Media"] },
    { name: "HarperCollins", categories: ["Books, Music & Media"] },
    { name: "Universal Music Group", categories: ["Books, Music & Media"] },
    { name: "Fender", categories: ["Books, Music & Media", "Toys & Hobbies"] },
    { name: "Gibson", categories: ["Books, Music & Media", "Toys & Hobbies"] },

    // Food & Pet
    {
      name: "Nestlé",
      categories: ["Groceries & Gourmet Food", "Pet Supplies"],
    },
    { name: "Coca-Cola", categories: ["Groceries & Gourmet Food"] },
    { name: "PepsiCo", categories: ["Groceries & Gourmet Food"] },
    { name: "Starbucks", categories: ["Groceries & Gourmet Food"] },
    { name: "Kraft Heinz", categories: ["Groceries & Gourmet Food"] },
    { name: "Purina", categories: ["Pet Supplies"] },
    { name: "Royal Canin", categories: ["Pet Supplies"] },
    { name: "Hill's Science Diet", categories: ["Pet Supplies"] },
    { name: "Kong", categories: ["Pet Supplies"] },

    // Automotive & Office
    { name: "Michelin", categories: ["Automotive & Industrial"] },
    { name: "Goodyear", categories: ["Automotive & Industrial"] },
    {
      name: "3M",
      categories: [
        "Automotive & Industrial",
        "Office & Stationery",
        "Tools & Home Improvement",
      ],
    },
    {
      name: "WD-40",
      categories: ["Automotive & Industrial", "Tools & Home Improvement"],
    },
    { name: "Bic", categories: ["Office & Stationery"] },
    { name: "Faber-Castell", categories: ["Office & Stationery"] },
    { name: "Moleskine", categories: ["Office & Stationery"] },
  ];

  for (const brand of brandsData) {
    const categoryIds = brand.categories
      .map((name) => categoryMap.get(name))
      .filter((id): id is string => Boolean(id))
      .map((id) => ({ id }));
    if (categoryIds.length > 0) {
      await prisma.brand.create({
        data: {
          name: brand.name,
          slug: slugify(brand.name),
          categories: { connect: categoryIds },
        },
      });
    }
  }
  console.log(`✅ Created ${brandsData.length} brands.`);

  console.log("🌱 Creating 78 Subcategories with deep Options and Values...");
  const subcategoryDefinitions = {
    "Men's Fashion": [
      {
        name: "Tops",
        options: ["Color", "Size", "Material", "Fit", "Sleeve Style"],
      },
      {
        name: "Bottoms",
        options: ["Color", "Waist", "Length", "Material", "Fit"],
      },
      {
        name: "Outerwear",
        options: ["Color", "Size", "Material", "Weather Resistance"],
      },
      {
        name: "Footwear",
        options: ["Color", "Shoe Size", "Material", "Shoe Type"],
      },
      {
        name: "Suits & Blazers",
        options: ["Color", "Jacket Size", "Material", "Fit"],
      },
    ],
    "Women's Fashion": [
      {
        name: "Dresses",
        options: ["Color", "Size", "Material", "Dress Style", "Length"],
      },
      {
        name: "Tops & Blouses",
        options: ["Color", "Size", "Material", "Sleeve Style"],
      },
      {
        name: "Skirts & Jeans",
        options: ["Color", "Waist", "Length", "Material", "Fit"],
      },
      {
        name: "Lingerie & Sleepwear",
        options: ["Color", "Bra Size", "Size", "Material"],
      },
      { name: "Handbags", options: ["Color", "Material", "Bag Size"] },
    ],
    Electronics: [
      {
        name: "Computers & Laptops",
        options: [
          "RAM",
          "Storage",
          "Processor",
          "Screen Size",
          "Operating System",
        ],
      },
      {
        name: "Smartphones & Tablets",
        options: [
          "Color",
          "Storage",
          "Screen Size",
          "Operating System",
          "Connectivity",
        ],
      },
      {
        name: "TV & Home Theater",
        options: [
          "Screen Size",
          "Resolution",
          "Smart TV Platform",
          "HDR Format",
        ],
      },
      {
        name: "Cameras & Drones",
        options: ["Resolution", "Sensor Size", "Connectivity", "Type"],
      },
      {
        name: "Audio & Headphones",
        options: ["Color", "Type", "Connectivity", "Noise Cancelling"],
      },
      {
        name: "Wearable Technology",
        options: ["Color", "Band Material", "Case Size", "Compatibility"],
      },
    ],
    "Home & Living": [
      {
        name: "Furniture",
        options: ["Material", "Color", "Finish", "Dimensions"],
      },
      {
        name: "Bedding & Bath",
        options: ["Material", "Color", "Size", "Thread Count"],
      },
      {
        name: "Kitchen & Dining",
        options: ["Material", "Color", "Capacity", "Type"],
      },
      {
        name: "Home Decor",
        options: ["Material", "Color", "Style", "Dimensions"],
      },
      {
        name: "Appliances",
        options: ["Type", "Color", "Energy Efficiency", "Capacity"],
      },
      {
        name: "Lighting",
        options: ["Type", "Wattage", "Color Temperature", "Finish"],
      },
    ],
    "Health & Beauty": [
      {
        name: "Skincare",
        options: ["Skin Type", "Formulation", "Volume", "Scent"],
      },
      { name: "Makeup", options: ["Shade", "Finish", "Formulation", "Type"] },
      {
        name: "Hair Care",
        options: ["Hair Type", "Formulation", "Volume", "Scent"],
      },
      { name: "Fragrance", options: ["Scent", "Volume", "Type"] },
      {
        name: "Wellness & Supplements",
        options: ["Type", "Form", "Dietary Feature"],
      },
    ],
    "Sports & Outdoors": [
      {
        name: "Athletic Apparel",
        options: ["Color", "Size", "Material", "Sport"],
      },
      { name: "Exercise & Fitness", options: ["Weight", "Type", "Material"] },
      {
        name: "Camping & Hiking",
        options: ["Capacity", "Weather Resistance", "Type"],
      },
      {
        name: "Cycling",
        options: ["Frame Size", "Color", "Type", "Brake Type"],
      },
      { name: "Team Sports", options: ["Sport", "Size", "Team"] },
    ],
    "Toys & Hobbies": [
      {
        name: "Action Figures & Playsets",
        options: ["Franchise", "Character", "Age Range"],
      },
      {
        name: "Building Sets & Blocks",
        options: ["Pieces", "Age Range", "Franchise"],
      },
      {
        name: "Dolls & Accessories",
        options: ["Franchise", "Age Range", "Material"],
      },
      {
        name: "Games & Puzzles",
        options: ["Game Type", "Player Count", "Age Range"],
      },
      {
        name: "RC Vehicles & Drones",
        options: ["Type", "Scale", "Power Source"],
      },
    ],
    "Books, Music & Media": [
      { name: "Books", options: ["Format", "Genre", "Author", "Language"] },
      { name: "Movies & TV Shows", options: ["Format", "Genre", "Rating"] },
      { name: "Music", options: ["Format", "Artist", "Genre"] },
      {
        name: "Musical Instruments",
        options: ["Type", "Brand", "Skill Level"],
      },
    ],
    "Groceries & Gourmet Food": [
      {
        name: "Beverages",
        options: ["Type", "Flavor", "Caffeine", "Package Size"],
      },
      {
        name: "Snacks",
        options: ["Flavor", "Dietary Feature", "Package Size"],
      },
      {
        name: "Pantry Staples",
        options: ["Type", "Package Size", "Dietary Feature"],
      },
      {
        name: "Coffee & Tea",
        options: ["Type", "Roast Level", "Flavor", "Format"],
      },
    ],
    "Automotive & Industrial": [
      {
        name: "Car Care & Detailing",
        options: ["Type", "Volume", "Application"],
      },
      { name: "Oils & Fluids", options: ["Type", "Viscosity", "Volume"] },
      { name: "Tires & Wheels", options: ["Tire Size", "Season", "Brand"] },
      {
        name: "Performance Parts",
        options: ["Vehicle Model", "Part Type", "Brand"],
      },
    ],
    "Office & Stationery": [
      { name: "Pens & Pencils", options: ["Type", "Ink Color", "Point Size"] },
      { name: "Notebooks & Paper", options: ["Size", "Paper Type", "Binding"] },
      { name: "Printers & Ink", options: ["Type", "Connectivity", "Color"] },
      {
        name: "Office Furniture",
        options: ["Type", "Material", "Color", "Dimensions"],
      },
    ],
    "Pet Supplies": [
      {
        name: "Dog Food & Treats",
        options: ["Flavor", "Life Stage", "Special Diet", "Weight"],
      },
      {
        name: "Cat Food & Treats",
        options: ["Flavor", "Life Stage", "Special Diet", "Weight"],
      },
      {
        name: "Fish & Aquatic Pets",
        options: ["Type", "Tank Size", "Water Type"],
      },
      { name: "Pet Toys", options: ["Pet Type", "Material", "Size"] },
    ],
    "Jewelry & Accessories": [
      {
        name: "Watches",
        options: ["Movement", "Case Material", "Band Material", "Case Size"],
      },
      { name: "Fine Jewelry", options: ["Metal Type", "Stone Type", "Style"] },
      { name: "Fashion Jewelry", options: ["Material", "Plating", "Style"] },
      {
        name: "Sunglasses & Eyewear",
        options: ["Frame Material", "Lens Color", "Frame Shape"],
      },
      { name: "Belts & Wallets", options: ["Material", "Color", "Size"] },
    ],
    "Tools & Home Improvement": [
      {
        name: "Power Tools",
        options: ["Power Source", "Voltage", "Brand", "Type"],
      },
      { name: "Hand Tools", options: ["Type", "Material", "Size"] },
      { name: "Hardware", options: ["Type", "Material", "Finish", "Size"] },
      { name: "Plumbing & Faucets", options: ["Type", "Finish", "Material"] },
      {
        name: "Paint & Supplies",
        options: ["Color", "Finish", "Volume", "Base"],
      },
    ],
  };

  const optionValueDefinitions = {
    // Universal
    Color: [
      "Black",
      "White",
      "Gray",
      "Red",
      "Blue",
      "Green",
      "Yellow",
      "Pink",
      "Purple",
      "Orange",
      "Brown",
      "Beige",
      "Silver",
      "Gold",
      "Multi-color",
    ],
    Material: [
      "Cotton",
      "Polyester",
      "Leather",
      "Denim",
      "Silk",
      "Wool",
      "Wood",
      "Metal",
      "Plastic",
      "Glass",
      "Ceramic",
      "Titanium",
      "Stainless Steel",
      "Canvas",
    ],
    Size: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "One Size", "3XL", "4XL"],
    Type: [
      "Over-Ear",
      "In-Ear",
      "On-Ear",
      "Inkjet",
      "Laser",
      "LED",
      "OLED",
      "Sofa",
      "Chair",
      "Table",
      "Bed",
      "Moisturizer",
      "Serum",
      "Cleanser",
      "Shampoo",
      "Conditioner",
      "Espresso",
      "Drip Coffee",
      "Drill",
      "Sander",
      "Wrench",
      "Screwdriver",
      "Interior",
      "Exterior",
      "Faucet",
      "Shower Head",
    ],
    Brand: [], // Populated by brandsData

    // Fashion Specific
    Fit: ["Slim", "Regular", "Relaxed", "Athletic", "Loose", "Skinny"],
    "Sleeve Style": [
      "Short Sleeve",
      "Long Sleeve",
      "Sleeveless",
      "3/4 Sleeve",
      "Cap Sleeve",
    ],
    Waist: ["28", "29", "30", "31", "32", "33", "34", "36", "38", "40"],
    Length: [
      "28",
      "30",
      "32",
      "34",
      "36",
      "Short",
      "Regular",
      "Long",
      "Maxi",
      "Midi",
      "Mini",
    ],
    "Shoe Size": ["5", "6", "7", "8", "9", "10", "11", "12", "13", "14"],
    "Shoe Type": [
      "Sneakers",
      "Boots",
      "Formal Shoes",
      "Sandals",
      "Loafers",
      "Heels",
      "Flats",
    ],
    "Jacket Size": ["36R", "38R", "40R", "42R", "44R", "38S", "40S", "42L"],
    "Dress Style": ["A-Line", "Bodycon", "Sheath", "Shift", "Wrap", "Maxi"],
    "Bra Size": ["32A", "32B", "34B", "34C", "36C", "36D", "38D"],
    "Bag Size": ["Small", "Medium", "Large", "Tote", "Crossbody"],

    // Electronics Specific
    Storage: ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB", "4TB"],
    RAM: ["4GB", "8GB", "16GB", "32GB", "64GB"],
    Processor: [
      "Intel i5",
      "Intel i7",
      "Intel i9",
      "AMD Ryzen 5",
      "AMD Ryzen 7",
      "Apple M2",
      "Apple M3",
    ],
    "Screen Size": [
      '11"',
      '13"',
      '14"',
      '15"',
      '16"',
      '17"',
      '24"',
      '27"',
      '32"',
      '55"',
      '65"',
      '75"',
    ],
    "Operating System": ["Windows", "macOS", "ChromeOS", "iOS", "Android"],
    Connectivity: ["Wi-Fi", "Bluetooth", "5G", "LTE", "HDMI", "USB-C", "NFC"],
    Resolution: [
      "HD",
      "Full HD (1080p)",
      "QHD (1440p)",
      "4K UHD",
      "8K UHD",
      "12MP",
      "48MP",
      "108MP",
    ],
    "Smart TV Platform": ["Google TV", "Roku TV", "Fire TV", "webOS", "Tizen"],
    "HDR Format": ["HDR10", "Dolby Vision", "HLG"],
    "Sensor Size": ["Full-Frame", "APS-C", "Micro Four Thirds", '1"'],
    "Noise Cancelling": ["Yes", "No", "Adaptive"],
    "Band Material": ["Silicone", "Stainless Steel", "Leather", "Nylon"],
    "Case Size": ["38mm", "40mm", "41mm", "44mm", "45mm", "49mm"],
    Compatibility: ["iOS", "Android", "Both"],

    // Home Specific
    Finish: [
      "Matte",
      "Glossy",
      "Satin",
      "Brushed Nickel",
      "Chrome",
      "Oil-Rubbed Bronze",
      "Natural Wood",
    ],
    Dimensions: ["Varies"],
    "Thread Count": ["200", "400", "600", "800", "1000"],
    Capacity: ["1-Person", "2-Person", "4-Person", "6-Quart", "8-Quart", "25L"],
    Style: ["Modern", "Traditional", "Farmhouse", "Industrial", "Minimalist"],
    "Energy Efficiency": ["A+", "A++", "Energy Star Certified"],
    Wattage: ["10W", "30W", "60W", "100W", "1500W"],
    "Color Temperature": [
      "Warm White (2700K)",
      "Cool White (4000K)",
      "Daylight (6500K)",
    ],

    // Health & Beauty Specific
    "Skin Type": ["Oily", "Dry", "Normal", "Combination", "Sensitive"],
    Formulation: [
      "Cream",
      "Serum",
      "Lotion",
      "Gel",
      "Oil",
      "Liquid",
      "Powder",
      "Stick",
    ],
    Volume: ["30ml", "50ml", "100ml", "250ml", "500ml", "1L"],
    Scent: ["Unscented", "Floral", "Citrus", "Woody", "Fresh", "Lavender"],
    Shade: [
      "Light",
      "Fair",
      "Medium",
      "Tan",
      "Dark",
      "Deep",
      "Porcelain",
      "Ivory",
    ],
    "Hair Type": ["Fine", "Thick", "Curly", "Straight", "Color-Treated"],
    Form: ["Capsule", "Tablet", "Powder", "Gummy", "Liquid"],
    "Dietary Feature": [
      "Vegan",
      "Gluten-Free",
      "Organic",
      "Non-GMO",
      "Sugar-Free",
      "Keto",
    ],

    // And many more...
    "Weather Resistance": ["Water-Resistant", "Waterproof", "Windproof"],
    Sport: ["Running", "Basketball", "Soccer", "Yoga", "Tennis"],
    "Brake Type": ["Disc", "Rim"],
    Franchise: ["Marvel", "Star Wars", "DC", "Harry Potter", "Disney"],
    Character: ["Spider-Man", "Darth Vader", "Batman", "Elsa"],
    "Age Range": ["0-2 years", "3-5 years", "6-8 years", "9-12 years", "13+"],
    Pieces: ["<100", "100-250", "251-500", "501-1000", "1000+"],
    "Game Type": ["Board Game", "Card Game", "Strategy", "Family", "Puzzle"],
    "Player Count": ["1", "2", "2-4", "4+"],
    Scale: ["1:10", "1:18", "1:24", "1:64"],
    "Power Source": ["Battery", "Corded-Electric", "Gas"],
    Format: [
      "Hardcover",
      "Paperback",
      "E-book",
      "Audiobook",
      "Vinyl",
      "CD",
      "Blu-ray",
      "DVD",
      "4K UHD",
    ],
    Genre: [
      "Fiction",
      "Non-fiction",
      "Sci-Fi",
      "Fantasy",
      "Rock",
      "Pop",
      "Hip-Hop",
      "Classical",
    ],
    Author: [],
    Language: ["English", "Spanish", "French", "German"],
    Rating: ["G", "PG", "PG-13", "R", "Not Rated"],
    Artist: [],
    "Skill Level": ["Beginner", "Intermediate", "Professional"],
    Flavor: [
      "Chicken",
      "Beef",
      "Fish",
      "Lamb",
      "Vanilla",
      "Chocolate",
      "Strawberry",
      "Unflavored",
    ],
    Caffeine: ["Caffeinated", "Decaf"],
    "Package Size": ["12oz", "16oz", "1L", "2L", "Family Pack"],
    "Roast Level": ["Light", "Medium", "Dark", "Espresso"],
    Application: ["Wash", "Wax", "Polish", "Tire Shine"],
    Viscosity: ["5W-30", "10W-40", "0W-20"],
    "Tire Size": [],
    Season: ["All-Season", "Summer", "Winter"],
    "Vehicle Model": [],
    "Part Type": ["Brake Pads", "Air Filter", "Spark Plugs"],
    "Ink Color": ["Black", "Blue", "Red", "Green"],
    "Point Size": ["Fine", "Medium", "Bold"],
    "Paper Type": ["Lined", "Grid", "Dotted", "Blank"],
    Binding: ["Spiral", "Hardbound", "Stitched"],
    "Life Stage": ["Puppy", "Adult", "Senior", "Kitten"],
    "Special Diet": ["Grain-Free", "Weight Control", "Sensitive Stomach"],
    "Tank Size": ["<10 Gallon", "10-20 Gallon", "20-50 Gallon", "50+ Gallon"],
    "Water Type": ["Freshwater", "Saltwater"],
    "Pet Type": ["Dog", "Cat", "Bird", "Small Animal"],
    Movement: ["Quartz", "Automatic", "Mechanical", "Smartwatch"],
    "Case Material": ["Stainless Steel", "Titanium", "Gold", "Ceramic"],
    "Metal Type": ["Sterling Silver", "14K Gold", "18K Gold", "Platinum"],
    "Stone Type": ["Diamond", "Sapphire", "Ruby", "Emerald", "None"],
    Plating: ["Gold-Plated", "Silver-Plated", "Rhodium-Plated"],
    "Frame Material": ["Acetate", "Metal", "Titanium"],
    "Lens Color": ["Black", "Brown", "Green G-15", "Mirrored"],
    "Frame Shape": ["Aviator", "Wayfarer", "Round", "Cat-Eye"],
    Voltage: ["12V", "18V", "20V", "40V"],
    Base: ["Water-Based", "Oil-Based"],
  };

  let subcategoryCount = 0;
  for (const [catName, subcats] of Object.entries(subcategoryDefinitions)) {
    for (const subcatData of subcats) {
      const subcategory = await prisma.subcategory.create({
        data: { name: subcatData.name, categoryId: categoryMap.get(catName)! },
      });
      subcategoryCount++;
      for (const optionName of subcatData.options) {
        // Find or create the option at the subcategory level
        const option = await prisma.option.create({
          data: { name: optionName, subcategoryId: subcategory.id },
        });

        // Get the values for this option name
        const values =
          optionValueDefinitions[
            optionName as keyof typeof optionValueDefinitions
          ];

        // If we have defined values, create them and link them to the option
        if (values && values.length > 0) {
          await prisma.optionValue.createMany({
            data: values.map((value) => ({ value, optionId: option.id })),
          });
        }
      }
    }
  }

  console.log(
    `✅ Created ${subcategoryCount} subcategories with their associated options and values.`
  );
  console.log(
    "✅ Catalog structure seeding finished successfully. The database is ready for products."
  );
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
