import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseNutritionTable } from '../src/nutrition-parser.js';

describe('parseNutritionTable', () => {
  test('parses German nutrition table from image 1', () => {
    const text = `Nährwertdeklaration / Déclaration
nutritionnelle / Voedingswaarde /
Dichiarazione nutrizionale
100 g    30 g = 1 Melto
Energie / énergie / energie / energia    2292 kJ    688 kJ
549 kcal    165 kcal
Fett / matières grasses / vetten / grassi    33 g    10 g
davon gesättigte Fettsäuren / dont
acides gras saturés / waarvan verzadigde
vetzuren / di cui acidi grassi saturi    13 g    3,9 g
Kohlenhydrate / glucides / koolhydraten /
carboidrati    55 g    16 g
davon Zucker / dont sucres /
waarvan suikers / di cui zuccheri    45 g    14 g
Ballaststoffe / fibres alimentaires / vezels /
fibre    2,4 g    0,7 g
Eiweiß / protéines / eiwitten / proteine    6,8 g    2,0 g
Salz / sel / zout / sale    0,18 g    0,05 g`;

    const result = parseNutritionTable(text);
    
    assert.ok(result);
    assert.strictEqual(result.servingSize, '30 g = 1 Melto');
    assert.strictEqual(result.energy, 2292);
    assert.strictEqual(result.fat, 33);
    assert.strictEqual(result.saturatedFat, 13);
    assert.strictEqual(result.carbohydrates, 55);
    assert.strictEqual(result.sugars, 45);
    assert.strictEqual(result.fiber, 2.4);
    assert.strictEqual(result.protein, 6.8);
    assert.strictEqual(result.salt, 0.18);
  });

  test('parses Dutch nutrition table from image 2', () => {
    const text = `Voedingswaarde per    100 ml    glas (200 ml)
energie    199 kJ / 47 kcal    399 kJ / 94 kcal
vetten, waarvan    0 g    0 g
- verzadigde vetzuren    0 g    0 g
- onverzadigde vetzuren    0 g    0 g
koolhydraten, waarvan    11 g    22 g
- suikers    10 g    20 g
- zoetstoffen    0 g    0 g
vezels    0,7 g    1,4 g
eiwitten    0,4 g    0,8 g
zout    0 g    0 g`;

    const result = parseNutritionTable(text);
    
    assert.ok(result);
    assert.strictEqual(result.servingSize, 'glas (200 ml)');
    assert.strictEqual(result.energy, 199);
    assert.strictEqual(result.fat, 0);
    assert.strictEqual(result.saturatedFat, 0);
    assert.strictEqual(result.carbohydrates, 11);
    assert.strictEqual(result.sugars, 10);
    assert.strictEqual(result.fiber, 0.7);
    assert.strictEqual(result.protein, 0.4);
    assert.strictEqual(result.salt, 0);
  });

  test('parses simple nutrition table from image 3', () => {
    const text = `Voedingswaarde per 100 ml
energie    3404 kJ / 828 kcal    vetten    92 g
waarvan verzadigde vetzuren    14 g    koolhydraten    0 g
vezels    0 g    waarvan suikers    0 g
eiwitten    0 g    zout    0 g`;

    const result = parseNutritionTable(text);
    
    assert.ok(result);
    assert.strictEqual(result.energy, 3404);
    assert.strictEqual(result.fat, 92);
    assert.strictEqual(result.saturatedFat, 14);
    assert.strictEqual(result.carbohydrates, 0);
    assert.strictEqual(result.sugars, 0);
    assert.strictEqual(result.fiber, 0);
    assert.strictEqual(result.protein, 0);
    assert.strictEqual(result.salt, 0);
  });

  test('returns null when no nutrition table is found', () => {
    const text = `This is just regular text with no nutrition information.
It mentions calories but not in a table format.`;

    const result = parseNutritionTable(text);
    
    assert.strictEqual(result, null);
  });

  test('handles missing optional nutrients', () => {
    const text = `Nährwerttabelle
100 g
Energie    2000 kJ
Fett    20 g
Kohlenhydrate    50 g
Eiweiß    10 g`;

    const result = parseNutritionTable(text);
    
    assert.ok(result);
    assert.strictEqual(result.energy, 2000);
    assert.strictEqual(result.fat, 20);
    assert.strictEqual(result.carbohydrates, 50);
    assert.strictEqual(result.protein, 10);
    assert.strictEqual(result.saturatedFat, undefined);
    assert.strictEqual(result.sugars, undefined);
    assert.strictEqual(result.fiber, undefined);
    assert.strictEqual(result.salt, undefined);
  });

  test('parses with comma decimals correctly', () => {
    const text = `Voedingswaarden per 100g
Energie    1800 kJ
Vetten    12,5 g
waarvan verzadigd    3,2 g
Koolhydraten    45,8 g
waarvan suikers    22,3 g
Vezels    5,1 g
Eiwitten    8,7 g
Zout    0,95 g`;

    const result = parseNutritionTable(text);
    
    assert.ok(result);
    assert.strictEqual(result.fat, 12.5);
    assert.strictEqual(result.saturatedFat, 3.2);
    assert.strictEqual(result.carbohydrates, 45.8);
    assert.strictEqual(result.sugars, 22.3);
    assert.strictEqual(result.fiber, 5.1);
    assert.strictEqual(result.protein, 8.7);
    assert.strictEqual(result.salt, 0.95);
  });
});