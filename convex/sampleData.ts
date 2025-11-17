import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Initialize sample data for the coffee shop
export const initializeSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) {
      return "Sample data already exists";
    }

    // Create categories
    const beveragesId = await ctx.db.insert("categories", {
      name: "Hot Beverages",
      description: "Freshly brewed coffee and tea selections",
      isActive: true,
      sortOrder: 1,
    });

    const coldDrinksId = await ctx.db.insert("categories", {
      name: "Cold Drinks",
      description: "Iced coffees, teas, and refreshing beverages",
      isActive: true,
      sortOrder: 2,
    });

    const snacksId = await ctx.db.insert("categories", {
      name: "Snacks & Pastries",
      description: "Fresh baked goods and light snacks",
      isActive: true,
      sortOrder: 3,
    });

    const sandwichesId = await ctx.db.insert("categories", {
      name: "Sandwiches & Wraps",
      description: "Hearty meals and fresh sandwiches",
      isActive: true,
      sortOrder: 4,
    });

    // Create menu items
    const menuItems = [
      // Hot Beverages
      {
        name: "Classic Espresso",
        description: "Rich, bold espresso shot made from premium coffee beans",
        categoryId: beveragesId,
        basePrice: 2.50,
        ingredients: ["Espresso beans", "Water"],
        isAvailable: true,
        isVegetarian: true,
        isVegan: true,
        calories: 5,
        preparationTime: 2,
        variants: [
          { size: "single", priceModifier: 0 },
          { size: "double", priceModifier: 1.50 },
        ],
      },
      {
        name: "Cappuccino",
        description: "Perfect balance of espresso, steamed milk, and foam",
        categoryId: beveragesId,
        basePrice: 4.25,
        ingredients: ["Espresso", "Steamed milk", "Milk foam"],
        isAvailable: true,
        isVegetarian: true,
        calories: 120,
        preparationTime: 4,
        variants: [
          { size: "small", priceModifier: 0 },
          { size: "medium", priceModifier: 0.75 },
          { size: "large", priceModifier: 1.50 },
        ],
      },
      {
        name: "Caffe Latte",
        description: "Smooth espresso with steamed milk and light foam",
        categoryId: beveragesId,
        basePrice: 4.75,
        ingredients: ["Espresso", "Steamed milk", "Light foam"],
        isAvailable: true,
        isVegetarian: true,
        calories: 150,
        preparationTime: 4,
        variants: [
          { size: "small", priceModifier: 0 },
          { size: "medium", priceModifier: 0.75 },
          { size: "large", priceModifier: 1.50 },
        ],
      },
      {
        name: "Americano",
        description: "Espresso shots with hot water for a clean, strong taste",
        categoryId: beveragesId,
        basePrice: 3.25,
        ingredients: ["Espresso", "Hot water"],
        isAvailable: true,
        isVegetarian: true,
        isVegan: true,
        calories: 10,
        preparationTime: 3,
        variants: [
          { size: "small", priceModifier: 0 },
          { size: "medium", priceModifier: 0.50 },
          { size: "large", priceModifier: 1.00 },
        ],
      },
      {
        name: "Mocha",
        description: "Rich chocolate and espresso with steamed milk and whipped cream",
        categoryId: beveragesId,
        basePrice: 5.25,
        ingredients: ["Espresso", "Chocolate syrup", "Steamed milk", "Whipped cream"],
        isAvailable: true,
        isVegetarian: true,
        calories: 290,
        preparationTime: 5,
        variants: [
          { size: "small", priceModifier: 0 },
          { size: "medium", priceModifier: 0.75 },
          { size: "large", priceModifier: 1.50 },
        ],
      },

      // Cold Drinks
      {
        name: "Iced Coffee",
        description: "Refreshing cold brew coffee served over ice",
        categoryId: coldDrinksId,
        basePrice: 3.75,
        ingredients: ["Cold brew coffee", "Ice"],
        isAvailable: true,
        isVegetarian: true,
        isVegan: true,
        calories: 5,
        preparationTime: 2,
        variants: [
          { size: "small", priceModifier: 0 },
          { size: "medium", priceModifier: 0.50 },
          { size: "large", priceModifier: 1.00 },
        ],
      },
      {
        name: "Iced Latte",
        description: "Smooth espresso with cold milk over ice",
        categoryId: coldDrinksId,
        basePrice: 4.50,
        ingredients: ["Espresso", "Cold milk", "Ice"],
        isAvailable: true,
        isVegetarian: true,
        calories: 130,
        preparationTime: 3,
        variants: [
          { size: "small", priceModifier: 0 },
          { size: "medium", priceModifier: 0.75 },
          { size: "large", priceModifier: 1.50 },
        ],
      },
      {
        name: "Frappuccino",
        description: "Blended coffee drink with ice and whipped cream",
        categoryId: coldDrinksId,
        basePrice: 5.75,
        ingredients: ["Coffee", "Milk", "Ice", "Sugar", "Whipped cream"],
        isAvailable: true,
        isVegetarian: true,
        calories: 320,
        preparationTime: 4,
        variants: [
          { size: "small", priceModifier: 0 },
          { size: "medium", priceModifier: 0.75 },
          { size: "large", priceModifier: 1.50 },
        ],
      },

      // Snacks & Pastries
      {
        name: "Chocolate Croissant",
        description: "Buttery, flaky pastry filled with rich chocolate",
        categoryId: snacksId,
        basePrice: 3.25,
        ingredients: ["Butter", "Flour", "Chocolate", "Eggs"],
        isAvailable: true,
        isVegetarian: true,
        calories: 280,
        preparationTime: 1,
        variants: [
          { size: "regular", priceModifier: 0 },
        ],
      },
      {
        name: "Blueberry Muffin",
        description: "Fresh baked muffin bursting with juicy blueberries",
        categoryId: snacksId,
        basePrice: 2.75,
        ingredients: ["Flour", "Blueberries", "Sugar", "Eggs", "Butter"],
        isAvailable: true,
        isVegetarian: true,
        calories: 320,
        preparationTime: 1,
        variants: [
          { size: "regular", priceModifier: 0 },
        ],
      },
      {
        name: "Banana Bread",
        description: "Moist, homemade banana bread slice",
        categoryId: snacksId,
        basePrice: 3.50,
        ingredients: ["Bananas", "Flour", "Sugar", "Eggs", "Butter", "Walnuts"],
        isAvailable: true,
        isVegetarian: true,
        calories: 250,
        preparationTime: 1,
        variants: [
          { size: "slice", priceModifier: 0 },
          { size: "double slice", priceModifier: 2.00 },
        ],
      },

      // Sandwiches & Wraps
      {
        name: "Turkey Club Sandwich",
        description: "Sliced turkey, bacon, lettuce, tomato on toasted bread",
        categoryId: sandwichesId,
        basePrice: 8.95,
        ingredients: ["Turkey", "Bacon", "Lettuce", "Tomato", "Mayo", "Bread"],
        isAvailable: true,
        calories: 520,
        preparationTime: 6,
        variants: [
          { size: "half", priceModifier: -2.00 },
          { size: "whole", priceModifier: 0 },
        ],
      },
      {
        name: "Veggie Wrap",
        description: "Fresh vegetables with hummus in a spinach tortilla",
        categoryId: sandwichesId,
        basePrice: 7.50,
        ingredients: ["Spinach tortilla", "Hummus", "Lettuce", "Tomato", "Cucumber", "Carrots", "Sprouts"],
        isAvailable: true,
        isVegetarian: true,
        isVegan: true,
        calories: 380,
        preparationTime: 4,
        variants: [
          { size: "regular", priceModifier: 0 },
        ],
      },
    ];

    // Insert menu items
    for (const item of menuItems) {
      await ctx.db.insert("menuItems", item);
    }

    // Create sample promo codes
    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("promoCodes", {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 5.00,
      maxDiscount: 5.00,
      validFrom: now,
      validUntil: now + oneMonth,
      usageLimit: 100,
      usedCount: 0,
      isActive: true,
      createdBy: "system" as any, // This would be a real admin user ID in production
    });

    await ctx.db.insert("promoCodes", {
      code: "COFFEE5",
      description: "$5 off orders over $20",
      discountType: "fixed",
      discountValue: 5.00,
      minOrderAmount: 20.00,
      validFrom: now,
      validUntil: now + oneMonth,
      usageLimit: 50,
      usedCount: 0,
      isActive: true,
      createdBy: "system" as any,
    });

    // Create store settings
    const settings = [
      { key: "store_name", value: "Coffee Shop Pro", description: "Store display name" },
      { key: "store_phone", value: "(555) 123-4567", description: "Store contact phone" },
      { key: "store_email", value: "info@coffeeshoppro.com", description: "Store contact email" },
      { key: "store_address", value: "123 Main St, Coffee City, CC 12345", description: "Store address" },
      { key: "tax_rate", value: "0.08", description: "Sales tax rate (8%)" },
      { key: "loyalty_rate", value: "0.01", description: "Loyalty points per dollar (1 point = $0.01)" },
      { key: "delivery_fee", value: "2.99", description: "Delivery fee" },
      { key: "min_delivery_order", value: "15.00", description: "Minimum order for delivery" },
    ];

    for (const setting of settings) {
      await ctx.db.insert("storeSettings", {
        ...setting,
        updatedBy: "system" as any,
      });
    }

    return "Sample data initialized successfully";
  },
});
