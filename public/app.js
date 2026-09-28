// NutriScan Frontend Application
import { scanImage, OCRResult } from '../src/ocr.js';
import { parseNutritionTable, NutritionData } from '../src/nutrition-parser.js';
import { MealPlanner, Meal } from '../src/meal-planner.js';
import { Storage } from '../src/storage.js';

// Initialize storage and meal planner
const storage = new Storage();
const mealPlanner = new MealPlanner(storage);

// Tab navigation
const tabs = document.querySelectorAll('.tab');
const mainContent = document.getElementById('main-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const tabName = tab.dataset.tab;
    renderView(tabName);
  });
});

// File input handling
const fileInput = document.getElementById('file-input');

// Current scan state
let currentScanResult = null;
let currentScanImage = null;

// Render views
function renderView(viewName) {
  switch (viewName) {
    case 'scan':
      renderScanView();
      break;
    case 'products':
      renderProductsView();
      break;
    case 'meals':
      renderMealsView();
      break;
  }
}

// Scan view
function renderScanView() {
  mainContent.innerHTML = `
    <div class="view">
      <h2>Scan Nutrition Label</h2>
      <p>Take a photo or upload an image of a nutrition label</p>
      
      <div class="scan-options">
        <button class="btn primary" id="take-photo">📷 Take Photo</button>
        <button class="btn secondary" id="upload-photo">📁 Upload</button>
      </div>
      
      <div class="scan-preview" id="scan-preview" style="display:none">
        <img id="preview-image" src="" alt="Scan preview">
        <button class="btn primary" id="scan-btn">🔍 Scan Label</button>
        <button class="btn" id="cancel-scan">Cancel</button>
      </div>
      
      <div id="scan-status"></div>
      <div id="scan-result" class="scan-result" style="display:none">
        <h3>Detected Nutrition Information</h3>
        <div id="nutrition-table-container"></div>
        <div id="product-save-form" style="margin-top: 20px;">
          <input type="text" id="product-name" placeholder="Product name (optional)" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid var(--border); border-radius: 8px;">
          <button class="btn primary" id="save-product">💾 Save Product</button>
        </div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('take-photo').addEventListener('click', () => {
    fileInput.setAttribute('capture', 'environment');
    fileInput.click();
  });

  document.getElementById('upload-photo').addEventListener('click', () => {
    fileInput.removeAttribute('capture');
    fileInput.click();
  });

  fileInput.addEventListener('change', handleFileSelect);

  document.getElementById('scan-btn')?.addEventListener('click', performScan);
  document.getElementById('cancel-scan')?.addEventListener('click', cancelScan);
  document.getElementById('save-product')?.addEventListener('click', saveProduct);
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    currentScanImage = e.target.result;
    document.getElementById('preview-image').src = currentScanImage;
    document.getElementById('scan-preview').style.display = 'block';
    document.getElementById('scan-result').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function performScan() {
  const statusEl = document.getElementById('scan-status');
  statusEl.innerHTML = '<div class="loading">Scanning image... This may take a moment.</div>';

  try {
    const result = await scanImage(currentScanImage);
    currentScanResult = result;
    
    statusEl.innerHTML = '<div class="success">Scan complete!</div>';
    displayScanResult(result);
  } catch (error) {
    statusEl.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
}

function displayScanResult(result) {
  const resultEl = document.getElementById('scan-result');
  const tableContainer = document.getElementById('nutrition-table-container');
  
  if (result.nutritionData) {
    const data = result.nutritionData;
    let html = '<table id="nutrition-table"><thead><tr>';
    html += '<th>Nutrient</th><th>Per 100g</th>';
    if (data.servingSize && data.servingSize !== '100g') {
      html += `<th>Per Serving (${data.servingSize})</th>`;
    }
    html += '</tr></thead><tbody>';
    
    const nutrients = [
      { key: 'energy', label: 'Energy' },
      { key: 'fat', label: 'Fat' },
      { key: 'saturatedFat', label: 'Saturated Fat' },
      { key: 'carbohydrates', label: 'Carbohydrates' },
      { key: 'sugars', label: 'Sugars' },
      { key: 'fiber', label: 'Fiber' },
      { key: 'protein', label: 'Protein' },
      { key: 'salt', label: 'Salt' }
    ];
    
    nutrients.forEach(nutrient => {
      if (data[nutrient.key] !== undefined) {
        html += `<tr><td>${nutrient.label}</td><td>${data[nutrient.key]}g</td>`;
        if (data.servingSize && data.servingSize !== '100g' && data[`${nutrient.key}Serving`]) {
          html += `<td>${data[`${nutrient.key}Serving`]}g</td>`;
        }
        html += '</tr>';
      }
    });
    
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
  } else {
    tableContainer.innerHTML = '<p>No nutrition table detected. Try another image.</p>';
  }
  
  resultEl.style.display = 'block';
}

function cancelScan() {
  currentScanImage = null;
  currentScanResult = null;
  fileInput.value = '';
  document.getElementById('scan-preview').style.display = 'none';
  document.getElementById('scan-result').style.display = 'none';
  document.getElementById('scan-status').innerHTML = '';
}

function saveProduct() {
  if (!currentScanResult?.nutritionData) return;
  
  const productName = document.getElementById('product-name')?.value || 'Unknown Product';
  const product = {
    id: Date.now().toString(),
    name: productName,
    nutritionData: currentScanResult.nutritionData,
    scannedAt: new Date().toISOString()
  };
  
  storage.saveProduct(product);
  alert('Product saved!');
  cancelScan();
  renderProductsView();
}

// Products view
function renderProductsView() {
  const products = storage.getProducts();
  
  if (products.length === 0) {
    mainContent.innerHTML = `
      <div class="view">
        <h2>Your Products</h2>
        <div class="empty-state">
          <p>No products scanned yet.</p>
          <button class="btn primary" onclick="document.querySelector('[data-tab=scan]').click()">Scan a Product</button>
        </div>
      </div>
    `;
    return;
  }
  
  let html = `
    <div class="view">
      <h2>Your Products</h2>
      <button class="btn primary" onclick="document.querySelector('[data-tab=scan]').click()">+ Scan New Product</button>
      <div class="product-grid">
  `;
  
  products.forEach(product => {
    const data = product.nutritionData;
    html += `
      <div class="product-card">
        <h3>${product.name}</h3>
        <div class="nutrition-summary">
          ${data.energy ? `<span class="nutrition-item">⚡ ${data.energy}kJ</span>` : ''}
          ${data.fat ? `<span class="nutrition-item">🥓 ${data.fat}g fat</span>` : ''}
          ${data.saturatedFat ? `<span class="nutrition-item">🔴 ${data.saturatedFat}g sat. fat</span>` : ''}
          ${data.carbohydrates ? `<span class="nutrition-item">🍞 ${data.carbohydrates}g carbs</span>` : ''}
          ${data.sugars ? `<span class="nutrition-item">🍬 ${data.sugars}g sugar</span>` : ''}
          ${data.protein ? `<span class="nutrition-item">💪 ${data.protein}g protein</span>` : ''}
          ${data.salt ? `<span class="nutrition-item">🧂 ${data.salt}g salt</span>` : ''}
        </div>
        <button class="btn small" onclick="deleteProduct('${product.id}')">🗑️ Delete</button>
      </div>
    `;
  });
  
  html += '</div></div>';
  mainContent.innerHTML = html;
}

function deleteProduct(productId) {
  if (confirm('Delete this product?')) {
    storage.deleteProduct(productId);
    renderProductsView();
  }
}

// Meals view
function renderMealsView() {
  const meals = mealPlanner.getAllMeals();
  
  if (meals.length === 0) {
    mainContent.innerHTML = `
      <div class="view">
        <h2>Your Meals</h2>
        <div class="empty-state">
          <p>No meals planned yet.</p>
          <button class="btn primary" onclick="showNewMealForm()">+ Create Meal</button>
        </div>
      </div>
    `;
    return;
  }
  
  let html = `
    <div class="view">
      <h2>Your Meals</h2>
      <button class="btn primary" onclick="showNewMealForm()">+ Create Meal</button>
      <div class="meal-list">
  `;
  
  meals.forEach(meal => {
    html += `
      <div class="meal-card">
        <h3>${meal.name}</h3>
        <div class="meal-products">
          ${meal.products.map(p => `
            <div class="meal-product">
              ${p.productName} - ${p.grams}g
            </div>
          `).join('')}
        </div>
        <div class="meal-totals">
          <strong>Totals:</strong>
          ${meal.totals ? `
            <div class="nutrition-summary">
              ${meal.totals.energy ? `<span class="nutrition-item">⚡ ${meal.totals.energy}kJ</span>` : ''}
              ${meal.totals.fat ? `<span class="nutrition-item">🥓 ${meal.totals.fat}g fat</span>` : ''}
              ${meal.totals.saturatedFat ? `<span class="nutrition-item">🔴 ${meal.totals.saturatedFat}g sat. fat</span>` : ''}
              ${meal.totals.carbohydrates ? `<span class="nutrition-item">🍞 ${meal.totals.carbohydrates}g carbs</span>` : ''}
              ${meal.totals.sugars ? `<span class="nutrition-item">🍬 ${meal.totals.sugars}g sugar</span>` : ''}
              ${meal.totals.protein ? `<span class="nutrition-item">💪 ${meal.totals.protein}g protein</span>` : ''}
              ${meal.totals.salt ? `<span class="nutrition-item">🧂 ${meal.totals.salt}g salt</span>` : ''}
            </div>
          ` : ''}
        </div>
        <button class="btn small" onclick="deleteMeal('${meal.id}')">🗑️ Delete</button>
      </div>
    `;
  });
  
  html += '</div></div>';
  mainContent.innerHTML = html;
}

function showNewMealForm() {
  const products = storage.getProducts();
  
  if (products.length === 0) {
    alert('Please scan some products first!');
    return;
  }
  
  let productOptions = products.map(p => 
    `<option value="${p.id}">${p.name}</option>`
  ).join('');
  
  mainContent.innerHTML = `
    <div class="view new-meal-view">
      <h2>Create New Meal</h2>
      <input type="text" id="meal-name" placeholder="Meal name (e.g., Breakfast)">
      
      <h3>Add Products</h3>
      <div class="product-selector">
        <select id="product-select">
          <option value="">Select product...</option>
          ${productOptions}
        </select>
        <input type="number" id="grams-input" placeholder="Grams" min="1">
        <button class="btn primary" id="add-product">Add</button>
      </div>
      
      <div id="selected-products"></div>
      
      <button class="btn primary" id="save-meal">💾 Save Meal</button>
      <button class="btn" id="cancel-meal">Cancel</button>
    </div>
  `;
  
  // Event listeners
  document.getElementById('add-product').addEventListener('click', addProductToMeal);
  document.getElementById('save-meal').addEventListener('click', saveMeal);
  document.getElementById('cancel-meal').addEventListener('click', () => renderMealsView());
}

let selectedProducts = [];

function addProductToMeal() {
  const select = document.getElementById('product-select');
  const gramsInput = document.getElementById('grams-input');
  const productId = select.value;
  const grams = parseFloat(gramsInput.value);
  
  if (!productId || !grams || grams <= 0) {
    alert('Please select a product and enter grams');
    return;
  }
  
  const product = storage.getProduct(productId);
  if (!product) return;
  
  selectedProducts.push({
    productId: productId,
    productName: product.name,
    grams: grams,
    nutritionData: product.nutritionData
  });
  
  renderSelectedProducts();
  select.value = '';
  gramsInput.value = '';
}

function renderSelectedProducts() {
  const container = document.getElementById('selected-products');
  if (!container) return;
  
  container.innerHTML = '<h4>Selected Products:</h4>';
  selectedProducts.forEach((item, index) => {
    container.innerHTML += `
      <div class="selected-product-item">
        <span>${item.productName} - ${item.grams}g</span>
        <button class="btn small" onclick="removeProductFromMeal(${index})">✕</button>
      </div>
    `;
  });
}

function removeProductFromMeal(index) {
  selectedProducts.splice(index, 1);
  renderSelectedProducts();
}

function saveMeal() {
  const mealName = document.getElementById('meal-name')?.value || 'Untitled Meal';
  
  if (selectedProducts.length === 0) {
    alert('Add at least one product to the meal');
    return;
  }
  
  const meal = mealPlanner.createMeal(mealName, selectedProducts);
  alert('Meal saved!');
  selectedProducts = [];
  renderMealsView();
}

function deleteMeal(mealId) {
  if (confirm('Delete this meal?')) {
    mealPlanner.deleteMeal(mealId);
    renderMealsView();
  }
}

// Initialize with scan view
renderView('scan');