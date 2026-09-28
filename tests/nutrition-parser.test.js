import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNutritionTable } from '../src/nutrition-parser.js';

test('parses German nutrition table from image 1', () => {
  const text = `Nährwertdeklaration / Déclaration nutritionnelle
/ Voedingswaarde / Dichiarazione nutrizionale
100 g    30 g = 1 Melto
Energie / énergie / energie / energia    2292 kJ  688 kJ
549 kcal   165 kcal
Fett / matières grasses / vetten / grassi    33 g   10 g
davon gesättigte Fettsäuren / dont acides gras saturés / waarvan verzadigde vetzuren / di cui acidi grassi saturi    13 g   3,9 g
Kohlenhydrate / glucides / koolhydraten / carboidrati    55 g   16 g
davon Zucker / dont sucres / waarvan suikers / di cui zuccheri    45 g   14 g
Ballaststoffe / fibres alimentaires / vezels / fibre    2,4 g  0,7 g
Eiweiß / protéines / eiwitten / proteine    6,8 g  2,0 g
Salz / sel / zout / sale    0,18 g  0,05 g`;

  const result = parseNutritionTable(text);

  assert.ok(result.fields.length > 0, 'Should find at least one field');
  assert.ok(result.values.energy, 'Should find energy');
  assert.ok(result.values.fat, 'Should find fat');
  assert.ok(result.values.carbohydrates, 'Should find carbohydrates');
  assert.ok(result.values.sugars, 'Should find sugars');
  assert.ok(result.values.protein, 'Should find protein');
  assert.ok(result.values.salt, 'Should find salt');
});

test('parses Dutch nutrition table from image 2', () => {
  const text = `Voedingswaarde per    100 ml    glas (200 ml)
energie    199 kJ / 47 kcal    399 kJ / 94 kcal
vetten, waarvan    0 g    0 g
- verzadigde vetzuren    0 g    0 g
- onverzadigde vetzuren    0 g    0 g
koolhydraten, waarvan    11 g    22 g
- suikers    10 g    20 g
- vezels    0,7 g    1,4 g
eiwitten    0,4 g    0,8 g
zout    0 g    0 g`;

  const result = parseNutritionTable(text);

  assert.ok(result.fields.length > 0, 'Should find at least one field');
  assert.ok(result.values.energy, 'Should find energy');
  assert.ok(result.values.fat, 'Should find fat');
  assert.ok(result.values.carbohydrates, 'Should find carbohydrates');
  assert.ok(result.values.sugars, 'Should find sugars');
  assert.ok(result.values.fiber, 'Should find fiber');
  assert.ok(result.values.protein, 'Should find protein');
  assert.ok(result.values.salt, 'Should find salt');
});

test('parses simple nutrition table from image 3', () => {
  const text = `Voedingswaarde per 100 ml
energie    3404 kJ / 828 kcal
vetten    92 g
waarvan verzadigde vetzuren    14 g
koolhydraten    0 g
waarvan suikers    0 g
vezels    0 g
eiwitten    0 g
zout    0 g`;

  const result = parseNutritionTable(text);

  assert.ok(result.fields.length > 0, 'Should find at least one field');
  assert.ok(result.values.energy, 'Should find energy');
  assert.ok(result.values.fat, 'Should find fat');
  assert.ok(result.values.carbohydrates, 'Should find carbohydrates');
  assert.ok(result.values.protein, 'Should find protein');
  assert.ok(result.values.salt, 'Should find salt');
});

test('returns empty result when no nutrition table is found', () => {
  const text = `This is just a random text with no nutrition information.
It has some numbers like 42 and 100 but no nutrition table.`;

  const result = parseNutritionTable(text);

  assert.deepEqual(result, { fields: [], servingInfo: null, values: {} });
});

test('handles missing optional nutrients', () => {
  const text = `Nährwerttabelle
Energie    500 kcal
Fett    20 g
Kohlenhydrate    50 g
Salz    1 g`;

  const result = parseNutritionTable(text);

  assert.ok(result.values.energy, 'Should find energy');
  assert.ok(result.values.fat, 'Should find fat');
  assert.ok(result.values.carbohydrates, 'Should find carbohydrates');
  assert.ok(result.values.salt, 'Should find salt');
  assert.ok(!result.values.sugars, 'Should not find sugars');
  assert.ok(!result.values.fiber, 'Should not find fiber');
  assert.ok(!result.values.protein, 'Should not find protein');
});

test('parses with comma decimals correctly', () => {
  const text = `Nährwerttabelle
Fett    33,5 g
Kohlenhydrate    55,2 g
Eiweiß    6,8 g`;

  const result = parseNutritionTable(text);

  assert.ok(result.values.fat, 'Should find fat');
  assert.ok(result.values.carbohydrates, 'Should find carbohydrates');
  assert.ok(result.values.protein, 'Should find protein');
  // Check that values are parsed correctly (comma as decimal separator)
  assert.ok(result.values.fat.values[0] > 33 && result.values.fat.values[0] < 34, 'Fat should be ~33.5');
  assert.ok(result.values.carbohydrates.values[0] > 55 && result.values.carbohydrates.values[0] < 56, 'Carbs should be ~55.2');
});