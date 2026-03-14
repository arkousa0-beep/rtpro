export const barcodeRegex = /^[A-Za-z0-9\-_]+$/;

export function isValidBarcode(barcode: string): boolean {
  return barcodeRegex.test(barcode);
}

export function validateBarcodes(barcodes: string[]): string[] {
  return barcodes.filter(barcode => !isValidBarcode(barcode));
}
