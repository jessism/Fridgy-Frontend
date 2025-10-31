/**
 * Format decimal quantities as fractions for display
 *
 * Examples:
 * - 1.5 → "1 1/2"
 * - 0.5 → "1/2"
 * - 2.25 → "2 1/4"
 * - 3 → "3"
 * - 0.33 → "1/3"
 *
 * @param {number|string} quantity - The quantity to format
 * @returns {string} Formatted quantity as fraction
 */
export function formatQuantityAsFraction(quantity) {
  // Handle invalid input
  if (quantity === null || quantity === undefined || quantity === '') {
    return '0';
  }

  const num = parseFloat(quantity);

  // Handle NaN
  if (isNaN(num)) {
    return '0';
  }

  // Get whole number and decimal parts
  const whole = Math.floor(Math.abs(num));
  const decimal = Math.abs(num) - whole;

  // If no decimal part, return whole number
  if (decimal < 0.01) {
    return whole.toString();
  }

  // Common fractions mapping (rounded to nearest)
  const fractionMap = [
    { decimal: 0.125, fraction: '1/8' },
    { decimal: 0.25, fraction: '1/4' },
    { decimal: 0.33, fraction: '1/3' },
    { decimal: 0.375, fraction: '3/8' },
    { decimal: 0.5, fraction: '1/2' },
    { decimal: 0.625, fraction: '5/8' },
    { decimal: 0.66, fraction: '2/3' },
    { decimal: 0.75, fraction: '3/4' },
    { decimal: 0.875, fraction: '7/8' }
  ];

  // Find the closest fraction
  let closestFraction = null;
  let minDiff = Infinity;

  for (const { decimal: fracDecimal, fraction } of fractionMap) {
    const diff = Math.abs(decimal - fracDecimal);
    if (diff < minDiff) {
      minDiff = diff;
      closestFraction = fraction;
    }
  }

  // Use fraction if close enough (within 0.05)
  if (minDiff < 0.05 && closestFraction) {
    return whole > 0 ? `${whole} ${closestFraction}` : closestFraction;
  }

  // For non-standard decimals, use decimal format but clean it up
  return num.toFixed(2).replace(/\.?0+$/, '');
}
