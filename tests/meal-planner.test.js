import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMeal, addProductToMeal, calculateMealTotals, createProduct } from '../src/meal-planner.js';

test('creates a meal with default date', () => {
  const meal = createMeal('Desayuno');
  assert.equal(meal.name, 'Desayuno');
  assert.ok(meal.id);
  assert.ok(meal.products.length === 0);
  assert.ok(meal.date);
});

test('creates a meal with custom date', () => {
  const meal = createMeal('Almuerzo', '2024-01-15');
  assert.equal(meal.date, '2024-01-15');
});

test('adds a product to a meal', () => {
  const meal = createMeal('Cena');
  const product = createProduct('Chocolate Bar', {
    energy: 549,
    fat: 33,
    carbs: 55,
    sugar: 45,
    protein: 6.8,
    salt: 0.18,
  }, '30');

  addProductToMeal(meal, product, 30);

  assert.equal(meal.products.length, 1);
  assert.equal(meal.products[0].productName, 'Chocolate Bar');
  assert.equal(meal.products[0].grams, 30);
});

test('calculates meal totals correctly', () => {
  const meal = createMeal('Snack');
  const product = createProduct('Chocolate Bar', {
    energy: 549,
    fat: 33,
    carbs: 55,
    sugar: 45,
    protein: 6.8,
    salt: 0.18,
  }, '30');

  addProductToMeal(meal, product, 30);
  const totals = calculateMealTotals(meal);

  assert.equal(totals.energy, 549);
  assert.equal(totals.fat, 33);
  assert.equal(totals.carbs, 55);
  assert.equal(totals.sugar, 45);
  assert.equal(totals.protein, 6.8);
  assert.equal(totals.salt, 0.18);
});

test('scales nutrition by gram ratio', () => {
  const meal = createMeal('Prueba');
  const product = createProduct('Jugo', {
    energy: 199,
    fat: 0,
    carbs: 11,
    sugar: 10,
    protein: 0.7,
    salt: 0,
  }, '100');

  // Add 200ml (2x serving)
  addProductToMeal(meal, product, 200);
  const totals = calculateMealTotals(meal);

  assert.equal(totals.energy, 398);
  assert.equal(totals.carbs, 22);
  assert.equal(totals.sugar, 20);
});

test('creates a product with nutrition data', () => {
  const product = createProduct('Aceite de Oliva', {
    energy: 828,
    fat: 92,
    carbs: 0,
    protein: 0,
    salt: 0,
  }, '100');

  assert.equal(product.name, 'Aceite de Oliva');
  assert.equal(product.servingSize, '100');
  assert.ok(product.id);
  assert.equal(product.nutrition.energy, 828);
});