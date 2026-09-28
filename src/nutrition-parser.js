/**
 * Nutrition table parser - deterministic extraction from OCR text.
 * Handles multi-language nutrition labels (German, Dutch, French, Italian, English).
 * Parses nutrition tables with various column formats (per 100g, per serving, etc.)
 */

/**
 * Parses nutrition table data from OCR text.
 * @param {string} text - The OCR-extracted text from a nutrition label.
 * @returns {Object} Parsed nutrition data with fields and values.
 */
export function parseNutritionTable(text) {
  const lines = text.split('\n');
  let tableStart = -1;
  let tableEnd = -1;

  // Find the nutrition table by looking for common headers
  const headers = [
    /nahrwerts?deklaration/i,
    /d?claration\s+nutritionnelle/i,
    /voedingswaarde/i,
    /dichiarazione\s+nutrizionale/i,
    /nutrition\s+information/i,
    /nahrwert/i,
    /voedingswaarde\s+per/i,
    /energie|energy|energie/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    for (const header of headers) {
      if (header.test(line)) {
        tableStart = i;
        break;
      }
    }
    if (tableStart !== -1) break;
  }

  if (tableStart === -1) {
    // Try to find table by looking for numeric nutrition data
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*(energie|energy|fett|vet|eiwei[ßs]|protein|kohlhydrat|carbohydrat|zucker|sugar|faser|fiber|salz|salt)/i.test(lines[i])) {
        tableStart = i;
        break;
      }
    }
  }

  if (tableStart === -1) {
    return { fields: [], servingInfo: null, values: {} };
  }

  // Find table boundaries by looking for rows with numeric values
  let rowStart = tableStart;
  for (let i = tableStart; i < Math.min(tableStart + 20, lines.length); i++) {
    if (/^\s*\S.*\d/.test(lines[i])) {
      rowStart = i;
      break;
    }
  }

  // Find end of table
  for (let i = rowStart; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '' || i > rowStart + 20) {
      tableEnd = i;
      break;
    }
    // Check if this line has nutrition data
    if (/^\s*(energie|energy|fett|vet|eiwei[ßs]|protein|kohlhydrat|carbohydrat|zucker|sugar|faser|fiber|salz|salt|ballaststoff|fibre)/i.test(line)) {
      continue;
    }
    // If line doesn't look like nutrition data and has no numbers, end table
    if (!/\d/.test(line) && line.length > 0 && !/^\s*$/.test(line)) {
      tableEnd = i;
      break;
    }
  }

  if (tableEnd === -1) {
    tableEnd = Math.min(rowStart + 15, lines.length);
  }

  // Parse the table rows
  const fields = [];
  const values = {};
  let servingInfo = null;

  // Extract serving info from headers
  const servingMatch = text.match(/(\d+\s*(?:g|ml))\s*[=–-]\s*(\d+\s*(?:g|ml))/i);
  if (servingMatch) {
    servingInfo = {
      column1: servingMatch[1].trim(),
      column2: servingMatch[2].trim(),
    };
  }

  // Parse each row
  for (let i = rowStart; i < tableEnd; i++) {
    const line = lines[i].trim();
    if (!line || !/\d/.test(line)) continue;

    // Match nutrition field names (multi-language)
    const fieldPatterns = [
      { name: 'energy', pattern: /energie|energy/i },
      { name: 'fat', pattern: /fett|matières\s+grasses|vetten|grassi/i },
      { name: 'saturatedFat', pattern: /gesättigte\s+Fetts?äuren|acides\s+gras\s+saturés|verzadigde\s+vetzuren|acidi\s+grassi\s+saturi/i },
      { name: 'carbohydrates', pattern: /kohlhydrate|glucides|koolhydraten|carboi|rati/i },
      { name: 'sugars', pattern: /zucker|sucre|suikers|zuccheri|suikers/i },
      { name: 'fiber', pattern: /ballaststoff|fibres|vezels|fibre/i },
      { name: 'protein', pattern: /eiwei[ßs]|protéines|eiwitten|proteine/i },
      { name: 'salt', pattern: /salz|sel|zout|sale/i },
    ];

    let matchedField = null;
    for (const fp of fieldPatterns) {
      if (fp.pattern.test(line)) {
        matchedField = fp.name;
        break;
      }
    }

    if (matchedField) {
      // Extract values - look for numbers with optional decimals
      const valueMatches = line.match(/(\d+(?:\.\d+)?)\s*(?:g|kJ|kcal|mg)/g);
      if (valueMatches) {
        const valuesArr = valueMatches.map((v) => {
          const numMatch = v.match(/(\d+(?:\.\d+)?)/);
          return numMatch ? parseFloat(numMatch[1]) : 0;
        });

        fields.push(matchedField);
        values[matchedField] = {
          name: matchedField,
          values: valuesArr,
          raw: line,
        };
      }
    }
  }

  return { fields, servingInfo, values };
}

/**
 * Parses ingredients list from OCR text.
 * @param {string} text - The OCR-extracted text.
 * @returns {string[]} Array of ingredients.
 */
export function parseIngredients(text) {
  const lines = text.split('\n');
  let ingredientsStart = -1;

  // Find ingredients section
  const ingredientPatterns = [
    /ingrediente/i,
    /ingredients/i,
    /bestandteile/i,
    /ingredi/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    for (const pattern of ingredientPatterns) {
      if (pattern.test(lines[i])) {
        ingredientsStart = i;
        break;
      }
    }
    if (ingredientsStart !== -1) break;
  }

  if (ingredientsStart === -1) return [];

  // Get the ingredients line(s)
  let ingredientsText = '';
  for (let i = ingredientsStart; i < Math.min(ingredientsStart + 5, lines.length); i++) {
    ingredientsText += lines[i].trim() + ' ';
  }

  // Extract ingredients after the colon or "Ingredients:"
  const match = ingredientsText.match(/:\s*(.+?)(?=\n|$)/i);
  if (!match) return [];

  // Split by comma or semicolon and clean up
  const ingredients = match[1]
    .split(/[,;]/)
    .map((ing) => ing.trim())
    .filter((ing) => ing.length > 0 && !ing.match(/^(allergie|allerg|hinweis|hinweise|info)$/i));

  return ingredients;
}

/**
 * Extracts allergen information from OCR text.
 * @param {string} text - The OCR-extracted text.
 * @returns {string[]} Array of allergens found.
 */
export function parseAllergens(text) {
  const commonAllergens = [
    'gluten', 'glutenfrei', 'glutenfre',
    'laktose', 'milch', 'milchprodukt',
    'soja', 'sojaprodukt',
    'nüsse', 'erdnüsse', 'mandeln', 'walnüsse', 'pistazien',
    'schalenfrüchte',
    'eier',
    'fisch',
    'krebstiere',
    'schalenfrüchte',
    'celery', 'sellerie',
    'mustard', 'senf',
    'sesame', 'sesam',
    'sulphur', 'sulfur', 'sulfite',
    'lupin', 'lupine',
    'mollusc', 'mollusken',
  ];

  const found = [];
  const lowerText = text.toLowerCase();

  for (const allergen of commonAllergens) {
    if (lowerText.includes(allergen.toLowerCase())) {
      found.push(allergen);
    }
  }

  return [...new Set(found)];
}