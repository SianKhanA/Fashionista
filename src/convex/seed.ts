import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) return "Already seeded";

    // Create categories
    const cats: Record<string, Id<"categories">> = {};
    const categoryData = [
      { name: "Dresses", slug: "dresses", description: "Elegant dresses for every occasion", sortOrder: 1 },
      { name: "Tops & Blouses", slug: "tops", description: "Chic tops and blouses", sortOrder: 2 },
      { name: "Bottoms", slug: "bottoms", description: "Pants, skirts, and shorts", sortOrder: 3 },
      { name: "Outerwear", slug: "outerwear", description: "Coats, jackets, and wraps", sortOrder: 4 },
      { name: "Accessories", slug: "accessories", description: "Bags, scarves, and more", sortOrder: 5 },
      { name: "Shoes", slug: "shoes", description: "Step out in style", sortOrder: 6 },
      { name: "Jewelry", slug: "jewelry", description: "Finishing touches", sortOrder: 7 },
      { name: "Activewear", slug: "activewear", description: "Stylish workout wear", sortOrder: 8 },
    ];

    for (const cat of categoryData) {
      const id = await ctx.db.insert("categories", { ...cat, active: true });
      cats[cat.slug] = id;
    }

    // Create products
    const products = [
      {
        name: "Rose Quartz Midi Dress",
        slug: "rose-quartz-midi-dress",
        description: "A stunning midi dress in soft rose quartz with delicate pleating and a flattering silhouette. Perfect for brunch dates and garden parties. Features a sweetheart neckline and adjustable straps.",
        shortDescription: "Soft rose quartz midi with delicate pleating",
        price: 18900,
        compareAtPrice: 24900,
        categoryId: cats.dresses,
        images: [
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800",
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: [
          { name: "Rose Quartz", hex: "#f4a8bc" },
          { name: "Champagne", hex: "#f5e6c8" },
        ],
        materials: "100% Polyester",
        careInstructions: "Machine wash cold, hang dry",
        tags: ["midi", "dress", "elegant", "rosé", "date-night"],
        inventory: 45,
        sku: "FSD-RQM-001",
        featured: true,
      },
      {
        name: "Ivory Silk Camisole",
        slug: "ivory-silk-camisole",
        description: "Luxurious silk camisole with delicate lace trim. A versatile piece that transitions seamlessly from day to night. Pair with our high-waisted trousers for a sophisticated look.",
        shortDescription: "Luxurious silk camisole with lace trim",
        price: 12900,
        categoryId: cats.tops,
        images: [
          "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800",
        ],
        sizes: ["XS", "S", "M", "L"],
        colors: [
          { name: "Ivory", hex: "#fefdfb" },
          { name: "Blush", hex: "#f9d0da" },
        ],
        materials: "100% Mulberry Silk",
        careInstructions: "Dry clean only",
        tags: ["silk", "camisole", "versatile", "lace"],
        inventory: 30,
        sku: "FST-ISC-002",
        featured: true,
      },
      {
        name: "Midnight Velvet Blazer",
        slug: "midnight-velvet-blazer",
        description: "A show-stopping velvet blazer in deep midnight blue. Features satin-lined interior, structured shoulders, and a tailored fit. An investment piece for your wardrobe.",
        shortDescription: "Show-stopping velvet blazer in midnight blue",
        price: 29900,
        categoryId: cats.outerwear,
        images: [
          "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: [
          { name: "Midnight Blue", hex: "#1e3a5f" },
          { name: "Burgundy", hex: "#722f37" },
        ],
        materials: "95% Velvet, 5% Spandex",
        careInstructions: "Dry clean recommended",
        tags: ["blazer", "velvet", "structured", "evening"],
        inventory: 20,
        sku: "FSO-MVB-003",
        featured: true,
      },
      {
        name: "Cloud Nine Cashmere Sweater",
        slug: "cloud-nine-cashmere-sweater",
        description: "Indulge in pure comfort with our cloud-soft cashmere sweater. Relaxed fit with ribbed cuffs and hem. A timeless essential in your knitwear collection.",
        shortDescription: "Cloud-soft cashmere sweater, relaxed fit",
        price: 24900,
        categoryId: cats.tops,
        images: [
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: [
          { name: "Cream", hex: "#fdf8f0" },
          { name: "Oatmeal", hex: "#eddaae" },
          { name: "Dusty Rose", hex: "#d4a5a5" },
        ],
        materials: "100% Grade A Cashmere",
        careInstructions: "Hand wash cold, lay flat to dry",
        tags: ["cashmere", "sweater", "luxury", "cozy"],
        inventory: 25,
        sku: "FST-CNC-004",
        featured: true,
      },
      {
        name: "Parisian High-Waist Trousers",
        slug: "parisian-high-waist-trousers",
        description: "Effortlessly chic high-waisted trousers with a wide leg. Crafted from premium crepe for a fluid drape. The perfect foundation for any sophisticated ensemble.",
        shortDescription: "Chic wide-leg high-waisted trousers",
        price: 17900,
        categoryId: cats.bottoms,
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: [
          { name: "Black", hex: "#1a1a1a" },
          { name: "Camel", hex: "#c4a35a" },
          { name: "Ivory", hex: "#fefdfb" },
        ],
        materials: "98% Polyester, 2% Spandex",
        careInstructions: "Machine wash cold",
        tags: ["trousers", "wide-leg", "high-waist", "chic"],
        inventory: 40,
        sku: "FSB-PHT-005",
        featured: false,
      },
      {
        name: "Champagne Pearl Drop Earrings",
        slug: "champagne-pearl-drop-earrings",
        description: "Elegant pearl drop earrings with a champagne gold setting. A timeless accessory that adds sophistication to any outfit.",
        shortDescription: "Pearl drop earrings with champagne gold",
        price: 8900,
        categoryId: cats.jewelry,
        images: [
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
        ],
        sizes: ["One Size"],
        colors: [
          { name: "Champagne Gold", hex: "#d4a35a" },
        ],
        materials: "Freshwater Pearl, 14K Gold Plated",
        careInstructions: "Avoid contact with water and perfumes",
        tags: ["earrings", "pearl", "gold", "elegant"],
        inventory: 60,
        sku: "FSJ-CPE-006",
        featured: true,
      },
      {
        name: "Dawn Suede Stiletto Heels",
        slug: "dawn-suede-stiletto-heels",
        description: "Stunning suede stilettos in a soft dawn pink. Features a 4-inch heel and cushioned insole for comfort throughout the day and night.",
        shortDescription: "Soft suede stilettos in dawn pink",
        price: 21900,
        compareAtPrice: 27900,
        categoryId: cats.shoes,
        images: [
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800",
        ],
        sizes: ["5", "6", "7", "8", "9", "10"],
        colors: [
          { name: "Dawn Pink", hex: "#f4a8bc" },
          { name: "Nude", hex: "#e8c4a0" },
        ],
        materials: "100% Suede Leather",
        careInstructions: "Use suede protector spray",
        tags: ["heels", "stiletto", "suede", "pink"],
        inventory: 35,
        sku: "FSSH-DSH-007",
        featured: false,
      },
      {
        name: "Serene Wrap Dress",
        slug: "serene-wrap-dress",
        description: "A beautiful wrap dress in a serene sage green. The classic wrap silhouette flatters every body type. Features adjustable tie waist and flutter sleeves.",
        shortDescription: "Classic wrap dress in sage green",
        price: 16900,
        categoryId: cats.dresses,
        images: [
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800",
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: [
          { name: "Sage Green", hex: "#b2ac88" },
          { name: "Terracotta", hex: "#cc7755" },
        ],
        materials: "100% Viscose",
        careInstructions: "Machine wash cold, hang dry",
        tags: ["wrap", "dress", "sage", "flattering"],
        inventory: 50,
        sku: "FSD-SWD-008",
        featured: true,
      },
      {
        name: "Luxe Chain Link Bracelet",
        slug: "luxe-chain-link-bracelet",
        description: "Bold yet refined chain link bracelet in rose gold. A statement piece that elevates everyday looks and adds edge to evening ensembles.",
        shortDescription: "Rose gold chain link statement bracelet",
        price: 7900,
        categoryId: cats.jewelry,
        images: [
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800",
        ],
        sizes: ["One Size"],
        colors: [
          { name: "Rose Gold", hex: "#b76e79" },
          { name: "Silver", hex: "#c0c0c0" },
        ],
        materials: "Stainless Steel, 18K Rose Gold Plated",
        careInstructions: "Wipe with soft cloth",
        tags: ["bracelet", "chain", "rose-gold", "statement"],
        inventory: 80,
        sku: "FSJ-LCL-009",
        featured: false,
      },
      {
        name: "Bohemian Linen Maxi Skirt",
        slug: "bohemian-linen-maxi-skirt",
        description: "Flowing linen maxi skirt with a bohemian spirit. Features a comfortable elastic waist and side slit for easy movement. Perfect for resort wear.",
        shortDescription: "Flowing linen maxi with bohemian flair",
        price: 13900,
        categoryId: cats.bottoms,
        images: [
          "https://images.unsplash.com/photo-1583496661160-fb5886a0aff0?w=800",
        ],
        sizes: ["XS", "S", "M", "L"],
        colors: [
          { name: "Natural Linen", hex: "#e8dcc8" },
          { name: "Sage", hex: "#b2ac88" },
        ],
        materials: "100% Linen",
        careInstructions: "Machine wash cold, tumble dry low",
        tags: ["maxi", "skirt", "linen", "bohemian"],
        inventory: 35,
        sku: "FSB-BLM-010",
        featured: false,
      },
      {
        name: "Structured Leather Crossbody",
        slug: "structured-leather-crossbody",
        description: "A beautifully structured crossbody bag in butter-soft leather. Adjustable strap, gold hardware, and multiple compartments for organization.",
        shortDescription: "Butter-soft leather crossbody bag",
        price: 25900,
        compareAtPrice: 32900,
        categoryId: cats.accessories,
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
        ],
        sizes: ["One Size"],
        colors: [
          { name: "Cognac", hex: "#9a4e1c" },
          { name: "Black", hex: "#1a1a1a" },
          { name: "Blush", hex: "#f9d0da" },
        ],
        materials: "100% Genuine Leather",
        careInstructions: "Condition leather regularly",
        tags: ["bag", "crossbody", "leather", "structured"],
        inventory: 30,
        sku: "FSA-SLC-011",
        featured: true,
      },
      {
        name: "Athleisure Power Set",
        slug: "athleisure-power-set",
        description: "A matching crop top and high-waist leggings set in butter-soft fabric. Moisture-wicking and four-way stretch for maximum comfort. Available in gorgeous seasonal colors.",
        shortDescription: "Matching crop top and leggings set",
        price: 15900,
        categoryId: cats.activewear,
        images: [
          "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800",
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: [
          { name: "Lavender", hex: "#b8a9c9" },
          { name: "Sage", hex: "#b2ac88" },
          { name: "Dusty Rose", hex: "#d4a5a5" },
        ],
        materials: "78% Nylon, 22% Elastane",
        careInstructions: "Machine wash cold, no fabric softener",
        tags: ["activewear", "set", "leggings", "crop-top"],
        inventory: 55,
        sku: "FSAW-APS-012",
        featured: false,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", {
        ...product,
        active: true,
        averageRating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 50) + 5,
        salesCount: Math.floor(Math.random() * 200) + 10,
      });
    }

    return "Seeded successfully";
  },
});
