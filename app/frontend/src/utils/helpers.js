/**
 * Formats a number into a currency string (e.g., USD).
 * @param {number} amount - The numeric amount to format.
 * @param {string} currency - The currency code (e.g., 'USD').
 * @param {string} locale - The locale string (e.g., 'en-US').
 * @returns {string} The formatted currency string.
 */
export const formatPrice = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Generates a simple random alphanumeric string of a given length.
 * @param {number} length - The desired length of the string.
 * @returns {string} The random alphanumeric string.
 */
export const generateRandomId = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length);
};