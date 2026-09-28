/**
 * OCR module using Tesseract.js to extract text from nutrition label images.
 * Provides a function to process an image file and return the recognized text.
 */

import Tesseract from 'tesseract.js';

/**
 * Extracts text from an image using Tesseract.js OCR.
 * @param {File|Blob|string} image - Image file, blob, or URL to process.
 * @param {Object} [options] - Optional Tesseract configuration.
 * @param {string} [options.lang='deu+eng+nld'] - Languages to use for OCR.
 * @returns {Promise<string>} The recognized text.
 */
export async function extractText(image, options = {}) {
  const { lang = 'deu+eng+nld' } = options;

  try {
    const { data } = await Tesseract.recognize(image, lang, {
      logger: () => {}, // Suppress logging
    });
    return data.text;
  } catch (error) {
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
}

/**
 * Preprocesses an image for better OCR results.
 * In a browser environment, we can do basic canvas-based preprocessing.
 * @param {File|Blob|HTMLImageElement} image - The image to preprocess.
 * @returns {Promise<string>} A data URL of the preprocessed image.
 */
export async function preprocessImage(image) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Get image data and apply grayscale + contrast enhancement
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        // Apply threshold for better contrast
        const threshold = gray > 128 ? 255 : 0;
        data[i] = threshold;     // R
        data[i + 1] = threshold; // G
        data[i + 2] = threshold; // B
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));

    if (image instanceof File || image instanceof Blob) {
      img.src = URL.createObjectURL(image);
    } else if (image instanceof HTMLImageElement) {
      img.src = image.src;
    } else {
      img.src = image;
    }
  });
}

/**
 * Full OCR pipeline: preprocess and extract text.
 * @param {File|Blob|HTMLImageElement|string} image - The image to process.
 * @param {Object} [options] - Options for OCR.
 * @returns {Promise<string>} The extracted text.
 */
export async function processImage(image, options = {}) {
  const preprocessed = await preprocessImage(image);
  return extractText(preprocessed, options);
}