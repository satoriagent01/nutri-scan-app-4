import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MealPlanner } from '../src/meal-planner.js';

describe('MealPlanner', () => {
  test('creates a new meal planner', () => {
    const planner = new MealPlanner();
    assert.ok(planner);
  });

  test('adds a product to the planner', () => {
    const planner = new MealPlanner();
    const product = {
      id: 'product-1',
      name: 'Hazelnut Chocolate',
      nutrition: {
        energy: 2292,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18
      }
    };
    
    planner.addProduct(product);
    assert.strictEqual(planner.products.size, 1);
    assert.ok(planner.products.has('product-1'));
  });

  test('adds a meal with a product and grams', () => {
    const planner = new MealPlanner();
    const product = {
      id: 'product-1',
      name: 'Hazelnut Chocolate',
      nutrition: {
        energy: 2292,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18
      }
    };
    
    planner.addProduct(product);
    planner.addMeal('Lunch', 'product-1', 60);
    
    assert.strictEqual(planner.meals.size, 1);
    assert.ok(planner.meals.has('Lunch'));
  });

  test('calculates nutrition for a meal based on grams', () => {
    const planner = new MealPlanner();
    const product = {
      id: 'product-1',
      name: 'Hazelnut Chocolate',
      nutrition: {
        energy: 2292,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18
      }
    };
    
    planner.addProduct(product);
    planner.addMeal('Lunch', 'product-1', 60);
    
    const mealNutrition = planner.getMealNutrition('Lunch');
    
    // 60g out of 100g = 0.6 multiplier
    assert.strictEqual(mealNutrition.energy, 1375.2);
    assert.strictEqual(mealNutrition.fat, 19.8);
    assert.strictEqual(mealNutrition.saturatedFat, 7.8);
    assert.strictEqual(mealNutrition.carbohydrates, 33);
    assert.strictEqual(mealNutrition.sugars, 27);
    assert.strictEqual(mealNutrition.fiber, 1.44);
    assert.strictEqual(mealNutrition.protein, 4.08);
    assert.strictEqual(mealNutrition.salt, 0.108);
  });

  test('calculates total daily nutrition from all meals', () => {
    const planner = new MealPlanner();
    
    const product1 = {
      id: 'product-1',
      name: 'Hazelnut Chocolate',
      nutrition: {
        energy: 2292,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18
      }
    };
    
    const product2 = {
      id: 'product-2',
      name: 'Apple Juice',
      nutrition: {
        energy: 199,
        fat: 0,
        saturatedFat: 0,
        carbohydrates: 11,
        sugars: 10,
        fiber: 0.7,
        protein: 0.4,
        salt: 0
      }
    };
    
    planner.addProduct(product1);
    planner.addProduct(product2);
    planner.addMeal('Lunch', 'product-1', 60);
    planner.addMeal('Lunch', 'product-2', 200);
    planner.addMeal('Snack', 'product-1', 30);
    
    const total = planner.getTotalNutrition();
    
    // Lunch: 60g product1 + 200g product2
    // Snack: 30g product1
    // Total product1: 90g (0.9 multiplier)
    // Total product2: 200g (2.0 multiplier)
    
    assert.strictEqual(total.energy, 1709.4);
    assert.strictEqual(total.fat, 31.5);
    assert.strictEqual(total.saturatedFat, 12.3);
    assert.strictEqual(total.carbohydrates, 66.5);
    assert.strictEqual(total.sugars, 57);
    assert.strictEqual(total.fiber, 2.82);
    assert.strictEqual(total.protein, 6.84);
    assert.strictEqual(total.salt, 0.216);
  });

  test('removes a meal', () => {
    const planner = new MealPlanner();
    const product = {
      id: 'product-1',
      name: 'Hazelnut Chocolate',
      nutrition: {
        energy: 2292,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18
      }
    };
    
    planner.addProduct(product);
    planner.addMeal('Lunch', 'product-1', 60);
    planner.removeMeal('Lunch');
    
    assert.strictEqual(planner.meals.size, 0);
  });

  test('removes a product', () => {
    const planner = new MealPlanner();
    const product = {
      id: 'product-1',
      name: 'Hazelnut Chocolate',
      nutrition: {
        energy: 2292,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18
      }
    };
    
    planner.addProduct(product);
    planner.removeProduct('product-1');
    
    assert.strictEqual(planner.products.size, 0);
  });

  test('handles multiple products in a single meal', () => {
    const planner = new MealPlanner();
    
    const product1 = {
      id: 'product-1',
      name: 'Rice',
      nutrition: {
        energy: 1300,
        fat: 3,
        saturatedFat: 0.8,
        carbohydrates: 28,
        sugars: 0.1,
        fiber: 1.5,
        protein: 2.5,
        salt: 0.01
      }
    };
    
    const product2 = {
      id: 'product-2',
      name: 'Chicken',
      nutrition: {
        energy: 1650,
        fat: 3.6,
        saturatedFat: 1,
        carbohydrates: 0,
        sugars: 0,
        fiber: 0,
        protein: 27,
        salt: 0.15
      }
    };
    
    planner.addProduct(product1);
    planner.addProduct(product2);
    planner.addMeal('Dinner', 'product-1', 150);
    planner.addMeal('Dinner', 'product-2', 200);
    
    const mealNutrition = planner.getMealNutrition('Dinner');
    
    // 150g rice (1.5x) + 200g chicken (2x)
    assert.strictEqual(mealNutrition.energy, 5575);
    assert.strictEqual(mealNutrition.fat, 8.1);
    assert.strictEqual(mealNutrition.saturatedFat, 2.6);
    assert.strictEqual(mealNutrition.carbohydrates, 42);
    assert.strictEqual(mealNutrition.sugars, 0.15);
    assert.strictEqual(mealNutrition.fiber, 2.25);
    assert.strictEqual(mealNutrition.protein, 60.5);
    assert.strictEqual(mealNutrition.salt, 0.31);
  });

  test('returns zero nutrition for empty meal', () => {
    const planner = new MealPlanner();
    const nutrition = planner.getMealNutrition('Empty');
    
    assert.strictEqual(nutrition.energy, 0);
    assert.strictEqual(nutrition.fat, 0);
    assert.strictEqual(nutrition.carbohydrates, 0);
    assert.strictEqual(nutrition.protein, 0);
  });
});