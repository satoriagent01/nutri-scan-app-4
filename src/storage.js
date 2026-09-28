/**
 * LocalStorage-based persistence layer for products and meals.
 * Provides CRUD operations for storing and retrieving data.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'nutriscan_products',
  MEALS: 'nutriscan_meals',
};

/**
 * Saves an array of products to localStorage.
 * @param {Object[]} products - Array of product objects.
 */
export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

/**
 * Loads products from localStorage.
 * @returns {Object[]} Array of product objects.
 */
export function loadProducts() {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
}

/**
 * Adds a product to storage.
 * @param {Object} product - The product object to add.
 * @returns {Object[]} Updated products array.
 */
export function addProduct(product) {
  const products = loadProducts();
  products.push(product);
  saveProducts(products);
  return products;
}

/**
 * Removes a product from storage.
 * @param {string} productId - The ID of the product to remove.
 * @returns {Object[]} Updated products array.
 */
export function removeProduct(productId) {
  const products = loadProducts().filter((p) => p.id !== productId);
  saveProducts(products);
  return products;
}

/**
 * Saves an array of meals to localStorage.
 * @param {Object[]} meals - Array of meal objects.
 */
export function saveMeals(meals) {
  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
}

/**
 * Loads meals from localStorage.
 * @returns {Object[]} Array of meal objects.
 */
export function loadMeals() {
  const data = localStorage.getItem(STORAGE_KEYS.MEALS);
  return data ? JSON.parse(data) : [];
}

/**
 * Adds a meal to storage.
 * @param {Object} meal - The meal object to add.
 * @returns {Object[]} Updated meals array.
 */
export function addMeal(meal) {
  const meals = loadMeals();
  meals.push(meal);
  saveMeals(meals);
  return meals;
}

/**
 * Removes a meal from storage.
 * @param {string} mealId - The ID of the meal to remove.
 * @returns {Object[]} Updated meals array.
 */
export function removeMeal(mealId) {
  const meals = loadMeals().filter((m) => m.id !== mealId);
  saveMeals(meals);
  return meals;
}

/**
 * Updates a meal in storage.
 * @param {Object} meal - The updated meal object.
 * @returns {Object[]} Updated meals array.
 */
export function updateMeal(meal) {
  const meals = loadMeals();
  const index = meals.findIndex((m) => m.id === meal.id);
  if (index !== -1) {
    meals[index] = meal;
    saveMeals(meals);
  }
  return meals;
}

/**
 * Clears all stored data.
 */
export function clearAll() {
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.MEALS);
}

/**
 * Gets products by date (for filtering).
 * @returns {Object[]} All products.
 */
export function getAllProducts() {
  return loadProducts();
}

/**
 * Gets meals by date.
 * @param {string} date - Date string (YYYY-MM-DD).
 * @returns {Object[]} Array of meals for the given date.
 */
export function getMealsByDate(date) {
  return loadMeals().filter((m) => m.date === date);
}

/**
 * Gets all meals.
 * @returns {Object[]} All meals.
 */
export function getAllMeals() {
  return loadMeals();
}