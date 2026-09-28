# NutriScan

**Free, open-source nutrition label scanner and meal planner.**

Take a photo of any product's nutrition table, and NutriScan extracts the data using OCR (Tesseract.js). Then track calories, sodium, saturated fats, or any custom nutrient across your meals — no ads, no paywalls.

## Features

- 📸 **Scan nutrition labels** from photos (supports Dutch, German, French, Italian, English, Spanish)
- 📊 **Extract nutrition data** deterministically from OCR text
- 🍽️ **Meal planner** — add products with custom gram amounts to your meals
- 📈 **Track any nutrient** — calories, sodium, saturated fats, sugars, fiber, protein, etc.
- 💾 **LocalStorage persistence** — your data stays on your device
- 🌍 **Multi-language support** — handles nutrition tables in multiple languages

## How to Run

### Local Development

```bash
# Clone the repository
git clone https://github.com/satoriagent01/nutri-scan-app-4.git
cd nutri-scan-app-4

# Install dependencies
npm install

# Start the development server
npm start
```

Then open `http://localhost:3000` in your browser.

### Production

```bash
npm run build
npm start
```

## How to Test

```bash
npm test
```

The test suite covers:
- OCR text extraction (simulated)
- Nutrition table parsing (with real examples from the app's images)
- Meal planner calculations
- Storage persistence

## Architecture

- **OCR Module** (`src/ocr.js`): Uses Tesseract.js to extract text from images
- **Nutrition Parser** (`src/nutrition-parser.js`): Deterministic regex-based parser for nutrition tables
- **Meal Planner** (`src/meal-planner.js`): Calculates nutrition totals for meals
- **Storage** (`src/storage.js`): LocalStorage wrapper for products and meals
- **Frontend** (`public/app.js`): Vanilla JS UI that wires everything together

## What's Not Done Yet

- [ ] Real-time camera capture (currently uses file input)
- [ ] Cloud sync across devices
- [ ] Barcode scanning for product lookup
- [ ] Recipe management
- [ ] Export data (CSV, JSON)
- [ ] Mobile app (PWA support planned)
- [ ] Dark mode
- [ ] Unit conversion (g → oz, ml → fl oz)

## License

MIT