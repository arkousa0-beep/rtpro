import test from 'node:test';
import assert from 'node:assert';
import { isValidBarcode, validateBarcodes } from '../barcode-utils';

test('Barcode Utils - isValidBarcode', async (t) => {
  await t.test('should return true for alphanumeric barcodes', () => {
    assert.strictEqual(isValidBarcode('ABC123'), true);
  });

  await t.test('should return true for barcodes with hyphens and underscores', () => {
    assert.strictEqual(isValidBarcode('BAR-CODE_01'), true);
  });

  await t.test('should return false for barcodes with special characters', () => {
    assert.strictEqual(isValidBarcode('ABC@123'), false);
    assert.strictEqual(isValidBarcode('INVALID!'), false);
  });

  await t.test('should return false for barcodes with spaces', () => {
    assert.strictEqual(isValidBarcode('BAR CODE'), false);
  });

  await t.test('should return false for empty string', () => {
    assert.strictEqual(isValidBarcode(''), false);
  });
});

test('Barcode Utils - validateBarcodes', async (t) => {
  await t.test('should return empty array for all valid barcodes', () => {
    const barcodes = ['ABC123', 'BAR-CODE'];
    assert.deepStrictEqual(validateBarcodes(barcodes), []);
  });

  await t.test('should return only invalid barcodes', () => {
    const barcodes = ['VALID123', 'INVALID!', 'ALSO INVALID@', 'VALID-456'];
    assert.deepStrictEqual(validateBarcodes(barcodes), ['INVALID!', 'ALSO INVALID@']);
  });

  await t.test('should return all barcodes if all are invalid', () => {
    const barcodes = ['!', '@', '#'];
    assert.deepStrictEqual(validateBarcodes(barcodes), ['!', '@', '#']);
  });
});
