import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saveProducts, loadProducts, addProduct, removeProduct, saveMeals, loadMeals, addMeal, removeMeal, updateMeal, clearAll, getAllProducts, getMealsByDate, getAllMeals } from '../src/storage.js';

// Mock localStorage
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; },
};

test('saveProducts and loadProducts', () => {
  clearAll();
  const products = [
    { id: '1', name: 'Test Product', nutrition: { energy: 500, fat: 20 } },
  ];
  saveProducts(products);
  const loaded = loadProducts();
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].name, 'Test Product');
  assert.equal(loaded[0].nutrition.energy, 500);
});

test('addProduct', () => {
  clearAll();
  const product = { id: '2', name: 'Added Product', nutrition: { energy: 300 } };
  const products = addProduct(product);
  assert.equal(products.length, 1);
  assert.equal(products[0].name, 'Added Product');
});

test('removeProduct', () => {
  clearAll();
  addProduct({ id: '3', name: 'Remove Me', nutrition: { energy: 100 } });
  const products = removeProduct('3');
  assert.equal(products.length, 0);
});

test('saveMeals and loadMeals', () => {
  clearAll();
  const meals = [
    { id: 'm1', name: 'Breakfast', date: '2024-01-01', products: [] },
  ];
  saveMeals(meals);
  const loaded = loadMeals();
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].name, 'Breakfast');
});

test('addMeal', () => {
  clearAll();
  const meal = { id: 'm2', name: 'Lunch', date: '2024-01-01', products: [] };
  const meals = addMeal(meal);
  assert.equal(meals.length, 1);
  assert.equal(meals[0].name, 'Lunch');
});

test('removeMeal', () => {
  clearAll();
  addMeal({ id: 'm3', name: 'Dinner', date: '2024-01-01', products: [] });
  const meals = removeMeal('m3');
  assert.equal(meals.length, 0);
});

test('updateMeal', () => {
  clearAll();
  addMeal({ id: 'm4', name: 'Snack', date: '2024-01-01', products: [] });
  const updatedMeal = { id: 'm4', name: 'Updated Snack', date: '2024-01-01', products: [] };
  updateMeal(updatedMeal);
  const meals = loadMeals();
  assert.equal(meals[0].name, 'Updated Snack');
});

test('clearAll', () => {
  clearAll();
  addProduct({ id: '5', name: 'Test', nutrition: { energy: 100 } });
  addMeal({ id: 'm5', name: 'Test', date: '2024-01-01', products: [] });
  clearAll();
  assert.equal(loadProducts().length, 0);
  assert.equal(loadMeals().length, 0);
});

test('getAllProducts', () => {
  clearAll();
  addProduct({ id: '6', name: 'Product A', nutrition: { energy: 200 } });
  addProduct({ id: '7', name: 'Product B', nutrition: { energy: 300 } });
  const products = getAllProducts();
  assert.equal(products.length, 2);
});

test('getMealsByDate', () => {
  clearAll();
  addMeal({ id: 'm6', name: 'Morning', date: '2024-01-01', products: [] });
  addMeal({ id: 'm7', name: 'Evening', date: '2024-01-02', products: [] });
  const meals = getMealsByDate('2024-01-01');
  assert.equal(meals.length, 1);
  assert.equal(meals[0].name, 'Morning');
});

test('getAllMeals', () => {
  clearAll();
  addMeal({ id: 'm8', name: 'Meal 1', date: '2024-01-01', products: [] });
  addMeal({ id: 'm9', name: 'Meal 2', date: '2024-01-02', products: [] });
  const meals = getAllMeals();
  assert.equal(meals.length, 2);
});