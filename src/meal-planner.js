/**
 * Meal planner module for tracking meals with custom gram amounts.
 * Allows users to create meals, add products with custom serving sizes,
 * and track total nutrition across all meals.
 */

/**
 * Creates a new meal.
 * @param {string} name - Name of the meal.
 * @param {string} [date] - Date of the meal (YYYY-MM-DD). Defaults to today.
 * @returns {Object} The created meal object.
 */
export function createMeal(name, date = new Date().toISOString().split('T')[0]) {
  return {
    id: generateId(),
    name,
    date,
    products: [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Adds a product to a meal with custom gram amount.
 * @param {Object} meal - The meal object.
 * @param {Object} product - The product with nutrition data.
 * @param {number} grams - Amount in grams (or ml for liquids).
 * @returns {Object} The updated meal.
 */
export function addProductToMeal(meal, product, grams) {
  const servingSize = product.servingSize || 100; // Default to 100g if not specified
  const ratio = grams / servingSize;

  const nutrition = {};
  for (const [key, value] of Object.entries(product.nutrition || {})) {
    if (typeof value === 'number') {
      nutrition[key] = Math.round(value * ratio * 100) / 100;
    }
  }

  const mealProduct = {
    productId: product.id,
    productName: product.name,
    grams,
    nutrition,
    addedAt: new Date().toISOString(),
  };

  meal.products.push(mealProduct);
  return meal;
}

/**
 * Removes a product from a meal.
 * @param {Object} meal - The meal object.
 * @param {string} productId - The ID of the product to remove.
 * @returns {Object} The updated meal.
 */
export function removeProductFromMeal(meal, productId) {
  meal.products = meal.products.filter((p) => p.productId !== productId);
  return meal;
}

/**
 * Calculates total nutrition for a meal.
 * @param {Object} meal - The meal object.
 * @returns {Object} Total nutrition values.
 */
export function calculateMealTotals(meal) {
  const totals = {};

  for (const product of meal.products) {
    for (const [key, value] of Object.entries(product.nutrition || {})) {
      if (typeof value === 'number') {
        totals[key] = (totals[key] || 0) + value;
      }
    }
  }

  // Round all values
  for (const key of Object.keys(totals)) {
    totals[key] = Math.round(totals[key] * 100) / 100;
  }

  return totals;
}

/**
 * Calculates total nutrition across multiple meals.
 * @param {Object[]} meals - Array of meal objects.
 * @returns {Object} Total nutrition values across all meals.
 */
export function calculateDailyTotals(meals) {
  const totals = {};

  for (const meal of meals) {
    const mealTotals = calculateMealTotals(meal);
    for (const [key, value] of Object.entries(mealTotals)) {
      if (typeof value === 'number') {
        totals[key] = (totals[key] || 0) + value;
      }
    }
  }

  // Round all values
  for (const key of Object.keys(totals)) {
    totals[key] = Math.round(totals[key] * 100) / 100;
  }

  return totals;
}

/**
 * Generates a unique ID.
 * @returns {string} A unique ID string.
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Creates a product object from scanned nutrition data.
 * @param {string} name - Product name.
 * @param {Object} nutrition - Nutrition data from parser.
 * @param {string} [servingSize='100'] - Default serving size.
 * @returns {Object} The product object.
 */
export function createProduct(name, nutrition, servingSize = '100') {
  return {
    id: generateId(),
    name,
    nutrition,
    servingSize,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Gets a summary of a meal.
 * @param {Object} meal - The meal object.
 * @returns {Object} Summary with product count and totals.
 */
export function getMealSummary(meal) {
  const totals = calculateMealTotals(meal);
  return {
    id: meal.id,
    name: meal.name,
    date: meal.date,
    productCount: meal.products.length,
    totals,
  };
}