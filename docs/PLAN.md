# NutriScan - Project Plan

## Requirements

### Core Functionality
1. **Nutrition Label Scanning**: Users take photos of product nutrition tables (like the ones in the provided images)
2. **OCR Extraction**: Extract text from images using AI-powered OCR (Tesseract.js)
3. **Nutrition Parsing**: Deterministically parse nutrition table data from OCR text
4. **Meal Planning**: Track meals by specifying gram amounts of scanned products
5. **Custom Tracking**: Track any nutrient (calories, sodium, saturated fats, etc.)

### Key Characteristics
- **Free and open-source** - no paywalls, no ads
- **Customizable** - not focused on a single diet goal (weight loss, heart health, etc.)
- **Multi-language** - handles nutrition tables in Dutch, German, French, Italian, English, Spanish
- **Privacy-first** - all data stored locally

## Shared Images Analysis

### Image 1 (Chocolate bar - German/Dutch/French/Italian)
- Nutrition table with columns: per 100g, per 30g (1 Melto)
- Languages: German (Nährwertdeklaration), French (Déclaration nutritionnelle), Dutch (Voedingswaarde), Italian (Dichiarazione nutrizionale)
- Fields: Energie, Fett, davon gesättigte Fettsäuren, Kohlenhydrate, davon Zucker, Ballaststoffe, Eiweiß, Salz
- Values in kJ and kcal for energy, grams for others

### Image 2 (Apple-orange-mango juice - Dutch)
- Nutrition table with columns: per 100ml, per glas (200ml)
- Language: Dutch (Voedingswaarde)
- Fields: energie, vetten, waarvan verzadigde vetzuren, koolhydraten, waarvan suikers, waarvan zoetstoffen, eiwitten, zout
- Also shows percentage of daily reference intake
- Per glass summary table at bottom

### Image 3 (Olive oil spray - Dutch)
- Nutrition table: per 100ml
- Language: Dutch
- Fields: energie, waarvan verzadigde vetzuren, koolhydraten, waarvan suikers, vezels, eiwitten, zout
- Also shows percentage of daily reference intake
- Contains hazard symbols and safety information

## Architecture

### Tech Stack
- **Frontend**: Vanilla JavaScript (no framework for simplicity)
- **OCR**: Tesseract.js (client-side, no API keys needed)
- **Storage**: LocalStorage API
- **Testing**: Node.js built-in test runner
- **CI**: GitHub Actions

### Module Structure

```
src/
  ocr.js              - OCR text extraction from images
  nutrition-parser.js - Parse nutrition tables from OCR text
  meal-planner.js     - Meal planning and nutrition calculation
  storage.js          - LocalStorage persistence
  app.js              - Main application entry point
public/
  index.html          - Main HTML page
  styles.css          - CSS styles
  app.js              - Frontend UI wiring
tests/
  ocr.test.js         - OCR module tests
  nutrition-parser.test.js - Nutrition parser tests
  meal-planner.test.js   - Meal planner tests
  storage.test.js         - Storage tests
```

## Data Model

### Product
```javascript
{
  id: string,
  name: string,
  brand: string,
  nutritionPer100: {
    energyKj: number,
    energyKcal: number,
    fat: number,
    saturatedFat: number,
    carbohydrates: number,
    sugars: number,
    fiber: number,
    protein: number,
    salt: number,
    [customNutrients]: number
  },
  servingSize: number, // grams or ml
  servingLabel: string, // e.g., "1 Melto", "200ml"
  language: string,
  imageUrl: string
}
```

### Meal
```javascript
{
  id: string,
  name: string,
  date: string,
  items: [{
    productId: string,
    productName: string,
    amountGrams: number,
    nutrition: { [nutrient]: number }
  }],
  totals: { [nutrient]: number }
}
```

## Parsing Strategy

### Nutrition Table Detection
1. Look for keywords like "Nährwertdeklaration", "Voedingswaarde", "Déclaration nutritionnelle", "Dichiarazione nutrizionale", "Nutrition Facts"
2. Find the table structure (rows with nutrient names, columns with values)
3. Parse each row: nutrient name → value(s) per column
4. Handle multi-language nutrient names (e.g., "Fett/matières grasses/vetten/grassi")

### Value Extraction
- Extract numeric values with optional units (g, ml, kJ, kcal)
- Handle decimal values (e.g., "33,9 g" → 33.9)
- Map nutrient names to standard keys

## Decisions

1. **Client-side OCR only**: No server needed, no API keys, works offline
2. **LocalStorage**: Simple, private, no backend required
3. **Vanilla JS**: No build step needed, easy to understand and modify
4. **Deterministic parsing**: After OCR, use regex-based parsing for reliability
5. **Custom nutrients**: Users can add any nutrient they want to track

## What Comes Next

- [ ] Real-time camera capture using getUserMedia API
- [ ] Barcode scanning for product lookup
- [ ] Recipe management
- [ ] Export/import data
- [ ] PWA support for mobile
- [ ] Dark mode
- [ ] Unit conversion
- [ ] Cloud sync option