import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { extractText } from '../src/ocr.js';

// Mock Tesseract.js for testing
const mockTesseract = {
  recognize: async () => ({
    data: {
      text: `Nährwerttabelle
100 g
Energie    2000 kJ
Fett    20 g
Kohlenhydrate    50 g
Eiweiß    10 g`
    }
  })
};

// We need to test the module, but Tesseract.js is a real dependency.
// For unit tests, we verify the module structure and error handling.
describe('extractText', () => {
  test('is an async function', async () => {
    assert.strictEqual(typeof extractText, 'function');
    const result = extractText(null);
    assert.ok(result instanceof Promise);
  });

  test('throws on invalid input', async () => {
    // Passing undefined should cause Tesseract to throw
    try {
      await extractText(undefined);
      assert.fail('Should have thrown');
    } catch (error) {
      assert.ok(error.message.includes('OCR extraction failed'));
    }
  });
});