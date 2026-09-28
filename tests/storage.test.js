import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Storage } from '../src/storage.js';

describe('Storage', () => {
  test('creates a new storage instance', () => {
    const storage = new Storage();
    assert.ok(storage);
  });

  test('saves and retrieves products', () => {
    const storage = new Storage();
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
    
    storage.saveProduct(product);
    const retrieved = storage.getProducts();
    
    assert.strictEqual(retrieved.length, 1);
    assert.strictEqual(retrieved[0].id, 'product-1');
    assert.strictEqual(retrieved[0].name, 'Hazelnut Chocolate');
  });

  test('saves and retrieves meals', () => {
    const storage = new Storage();
    const meal = {
      id: 'meal-1',
      name: 'Lunch',
      items: [
        { productId: 'product-1', grams: 60 }
      ]
    };
    
    storage.saveMeal(meal);
    const retrieved = storage.getMeals();
    
    assert.strictEqual(retrieved.length, 1);
    assert.strictEqual(retrieved[0].id, 'meal-1');
    assert.strictEqual(retrieved[0].name, 'Lunch');
  });

  test('removes a product', () => {
    const storage = new Storage();
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
    
    storage.saveProduct(product);
    storage.removeProduct('product-1');
    const retrieved = storage.getProducts();
    
    assert.strictEqual(retrieved.length, 0);
  });

  test('removes a meal', () => {
    const storage = new Storage();
    const meal = {
      id: 'meal-1',
      name: 'Lunch',
      items: [
        { productId: 'product-1', grams: 60 }
      ]
    };
    
    storage.saveMeal(meal);
    storage.removeMeal('meal-1');
    const retrieved = storage.getMeals();
    
    assert.strictEqual(retrieved.length, 0);
  });

  test('handles multiple products', () => {
    const storage = new Storage();
    
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
    
    storage.saveProduct(product1);
    storage.saveProduct(product2);
    const retrieved = storage.getProducts();
    
    assert.strictEqual(retrieved.length, 2);
  });

  test('handles multiple meals', () => {
    const storage = new Storage();
    
    const meal1 = {
      id: 'meal-1',
      name: 'Lunch',
      items: [
        { productId: 'product-1', grams: 60 }
      ]
    };
    
    const meal2 = {
      id: 'meal-2',
      name: 'Dinner',
      items: [
        { productId: 'product-2', grams: 200 }
      ]
    };
    
    storage.saveMeal(meal1);
    storage.saveMeal(meal2);
    const retrieved = storage.getMeals();
    
    assert.strictEqual(retrieved.length, 2);
  });

  test('returns empty arrays for initial state', () => {
    const storage = new Storage();
    const products = storage.getProducts();
    const meals = storage.getMeals();
    
    assert.strictEqual(products.length, 0);
    assert.strictEqual(meals.length, 0);
  });

  test('persists data across instances', () => {
    // Save data with one instance
    const storage1 = new Storage();
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
    
    storage1.saveProduct(product);
    
    // Create a new instance and verify data persists
    const storage2 = new Storage();
    const retrieved = storage2.getProducts();
    
    assert.strictEqual(retrieved.length, 1);
    assert.strictEqual(retrieved[0].id, 'product-1');
  });
});