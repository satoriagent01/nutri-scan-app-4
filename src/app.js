/**
 * Main application entry point with UI rendering.
 * This module is designed for Node.js testing but provides
 * UI rendering functions that would be used in the browser.
 */

import { createMeal, addProductToMeal, calculateMealTotals, createProduct } from './meal-planner.js';
import { addProduct, addMeal, loadProducts, loadMeals } from './storage.js';

/**
 * Renders the main app view.
 * @returns {string} HTML string for the main view.
 */
export function renderApp() {
  return `
    <div id="app">
      <header>
        <h1>🍎 NutriScan</h1>
        <p class="subtitle">Scan nutrition labels, track your diet</p>
      </header>
      
      <nav class="tabs">
        <button class="tab active" data-tab="scan">📷 Scan</button>
        <button class="tab" data-tab="products">📦 Products</button>
        <button class="tab" data-tab="meals">🍽️ Meals</button>
      </nav>
      
      <main id="main-content">
        <!-- Dynamic content loaded here -->
      </main>
    </div>
  `;
}

/**
 * Renders the scan view with camera/upload options.
 * @returns {string} HTML string for the scan view.
 */
export function renderScanView() {
  return `
    <div class="view scan-view">
      <h2>Scan Nutrition Label</h2>
      <div class="scan-options">
        <button id="camera-btn" class="btn primary">📷 Take Photo</button>
        <button id="upload-btn" class="btn secondary">📁 Upload Image</button>
      </div>
      <input type="file" id="file-input" accept="image/*" style="display:none">
      <div id="scan-preview" class="scan-preview" style="display:none">
        <img id="preview-image" src="" alt="Preview">
        <button id="process-btn" class="btn primary">🔍 Process</button>
        <button id="cancel-scan-btn" class="btn secondary">✕ Cancel</button>
      </div>
      <div id="scan-result" class="scan-result" style="display:none">
        <h3>Detected Nutrition Data</h3>
        <div id="nutrition-table"></div>
        <input type="text" id="product-name" placeholder="Product name (optional)">
        <button id="save-product-btn" class="btn primary">💾 Save Product</button>
      </div>
      <div id="scan-loading" class="scan-loading" style="display:none">
        <p>Processing image...</p>
      </div>
    </div>
  `;
}

/**
 * Renders the products view.
 * @param {Object[]} products - Array of product objects.
 * @returns {string} HTML string for the products view.
 */
export function renderProductsView(products = []) {
  const productItems = products.map((product) => `
    <div class="product-card">
      <h3>${product.name || 'Unnamed Product'}</h3>
      <div class="nutrition-summary">
        ${Object.entries(product.nutrition || {})
          .filter(([key, value]) => typeof value === 'number')
          .map(([key, value]) => `<span class="nutrition-item">${key}: ${value}</span>`)
          .join('')}
      </div>
      <button class="btn small delete-btn" data-id="${product.id}">🗑️ Delete</button>
    </div>
  `).join('');

  return `
    <div class="view products-view">
      <h2>My Products (${products.length})</h2>
      ${products.length === 0 
        ? '<p class="empty-state">No products yet. Scan a nutrition label to add one!</p>'
        : `<div class="product-grid">${productItems}</div>`
      }
    </div>
  `;
}

/**
 * Renders the meals view.
 * @param {Object[]} meals - Array of meal objects.
 * @returns {string} HTML string for the meals view.
 */
export function renderMealsView(meals = []) {
  const mealItems = meals.map((meal) => {
    const totals = calculateMealTotals(meal);
    return `
      <div class="meal-card">
        <h3>${meal.name} (${meal.date})</h3>
        <div class="meal-products">
          ${meal.products.map((p) => `
            <div class="meal-product">
              <span>${p.productName} (${p.grams}g)</span>
            </div>
          `).join('')}
        </div>
        <div class="meal-totals">
          ${Object.entries(totals)
            .map(([key, value]) => `<span class="nutrition-item">${key}: ${value}</span>`)
            .join('')}
        </div>
        <button class="btn small delete-btn" data-meal-id="${meal.id}">🗑️ Delete</button>
      </div>
    `;
  }).join('');

  return `
    <div class="view meals-view">
      <h2>My Meals (${meals.length})</h2>
      <button id="new-meal-btn" class="btn primary">+ New Meal</button>
      ${meals.length === 0 
        ? '<p class="empty-state">No meals yet. Create a meal and add products!</p>'
        : `<div class="meal-list">${mealItems}</div>`
      }
    </div>
  `;
}

/**
 * Renders a new meal form.
 * @returns {string} HTML string for the new meal form.
 */
export function renderNewMealForm(products = []) {
  const productOptions = products.map((product) => `
    <option value="${product.id}">${product.name}</option>
  `).join('');

  return `
    <div class="view new-meal-view">
      <h2>New Meal</h2>
      <input type="text" id="meal-name" placeholder="Meal name (e.g., Breakfast)">
      <input type="date" id="meal-date" value="${new Date().toISOString().split('T')[0]}">
      
      <h3>Add Products</h3>
      <div id="meal-products-list">
        ${products.length === 0 
          ? '<p class="empty-state">No products saved yet. Scan a label first!</p>'
          : `
            <div class="product-selector">
              <select id="product-select">
                <option value="">Select a product...</option>
                ${productOptions}
              </select>
              <input type="number" id="product-grams" placeholder="Grams" min="0" step="1">
              <button id="add-product-btn" class="btn small">+ Add</button>
            </div>
            <div id="selected-products"></div>
          `
        }
      </div>
      
      <button id="save-meal-btn" class="btn primary">💾 Save Meal</button>
      <button id="cancel-meal-btn" class="btn secondary">Cancel</button>
    </div>
  `;
}

/**
 * Shows a loading state.
 * @param {string} message - Loading message.
 */
export function showLoading(message = 'Loading...') {
  return `<div class="loading"><p>${message}</p></div>`;
}

/**
 * Shows an error message.
 * @param {string} message - Error message.
 */
export function showError(message) {
  return `<div class="error"><p>${message}</p></div>`;
}

/**
 * Shows a success message.
 * @param {string} message - Success message.
 */
export function showSuccess(message) {
  return `<div class="success"><p>${message}</p></div>`;
}

// Export for testing
export default {
  renderApp,
  renderScanView,
  renderProductsView,
  renderMealsView,
  renderNewMealForm,
  showLoading,
  showError,
  showSuccess,
};