/**
 * Utility Functions for Form Validation, Data Sanitization, Currency Formatting, and Security
 * Created: 2025-12-09
 */

// ============================================================================
// FORM VALIDATION UTILITIES
// ============================================================================

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} Object with isValid boolean and feedback array
 */
export function validatePassword(password) {
  const feedback = [];
  let strength = 0;

  if (!password) {
    return { isValid: false, strength: 0, feedback: ['Password is required'] };
  }

  if (password.length >= 8) strength++;
  else feedback.push('Password must be at least 8 characters long');

  if (password.length >= 12) strength++;
  else feedback.push('Consider using 12+ characters for better security');

  if (/[a-z]/.test(password)) strength++;
  else feedback.push('Password must contain lowercase letters');

  if (/[A-Z]/.test(password)) strength++;
  else feedback.push('Password must contain uppercase letters');

  if (/[0-9]/.test(password)) strength++;
  else feedback.push('Password must contain numbers');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
  else feedback.push('Password should contain special characters');

  const isValid = strength >= 4;
  return { isValid, strength, feedback };
}

/**
 * Validates phone number format (supports common formats)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid
 */
export function validatePhone(phone) {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validates that a value is not empty
 * @param {*} value - Value to validate
 * @returns {boolean} True if value is not empty
 */
export function validateRequired(value) {
  return value !== null && value !== undefined && value.toString().trim() !== '';
}

/**
 * Validates number is within range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} True if value is within range
 */
export function validateRange(value, min, max) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validates credit card number using Luhn algorithm
 * @param {string} cardNumber - Credit card number
 * @returns {boolean} True if card number is valid
 */
export function validateCreditCard(cardNumber) {
  const sanitized = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(sanitized)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// ============================================================================
// DATA SANITIZATION UTILITIES
// ============================================================================

/**
 * Removes HTML tags and special characters from string
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeHTML(input) {
  const element = document.createElement('div');
  element.textContent = input;
  return element.innerHTML;
}

/**
 * Trims whitespace from both ends and normalizes internal spaces
 * @param {string} input - String to trim
 * @returns {string} Trimmed string
 */
export function trimWhitespace(input) {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Removes all non-alphanumeric characters except specified ones
 * @param {string} input - String to sanitize
 * @param {string} allowedChars - Characters to keep (e.g., '-._')
 * @returns {string} Sanitized string
 */
export function removeSpecialCharacters(input, allowedChars = '') {
  const regex = new RegExp(`[^a-zA-Z0-9${allowedChars}]`, 'g');
  return input.replace(regex, '');
}

/**
 * Converts user input to prevent SQL injection
 * @param {string} input - User input to escape
 * @returns {string} Escaped string
 */
export function escapeSQLString(input) {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/"/g, '\\"')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

/**
 * Removes potentially dangerous characters and protocols
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Encodes string for safe use in URLs
 * @param {string} input - String to encode
 * @returns {string} URL-encoded string
 */
export function encodeForURL(input) {
  return encodeURIComponent(input);
}

/**
 * Decodes URL-encoded string
 * @param {string} input - URL-encoded string
 * @returns {string} Decoded string
 */
export function decodeFromURL(input) {
  try {
    return decodeURIComponent(input);
  } catch (e) {
    return input;
  }
}

// ============================================================================
// CURRENCY FORMATTING UTILITIES
// ============================================================================

/**
 * Formats number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (e.g., 'USD', 'EUR')
 * @param {string} locale - Locale code (e.g., 'en-US', 'de-DE')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  }
}

/**
 * Formats number with thousands separator
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(number, decimals = 2) {
  return parseFloat(number).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parses formatted currency string back to number
 * @param {string} currencyString - Formatted currency string
 * @returns {number} Parsed number
 */
export function parseCurrency(currencyString) {
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Calculates percentage of a total
 * @param {number} value - Value to calculate percentage for
 * @param {number} total - Total amount
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage string
 */
export function calculatePercentage(value, total, decimals = 2) {
  if (total === 0) return '0.00%';
  const percentage = (value / total) * 100;
  return parseFloat(percentage).toFixed(decimals) + '%';
}

/**
 * Applies discount to amount
 * @param {number} amount - Original amount
 * @param {number} discountPercent - Discount percentage
 * @returns {number} Amount after discount
 */
export function applyDiscount(amount, discountPercent) {
  return amount * (1 - discountPercent / 100);
}

/**
 * Calculates total with tax
 * @param {number} amount - Amount before tax
 * @param {number} taxPercent - Tax percentage
 * @returns {number} Total with tax
 */
export function calculateWithTax(amount, taxPercent) {
  return amount * (1 + taxPercent / 100);
}

// ============================================================================
// SECURITY HELPER UTILITIES
// ============================================================================

/**
 * Generates a random string of specified length
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a cryptographically secure random string
 * @param {number} length - Length of random string
 * @returns {string} Secure random string
 */
export function generateSecureRandomString(length = 32) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a hash of a string (SHA-256)
 * @param {string} input - String to hash
 * @returns {Promise<string>} Promise resolving to hex hash
 */
export async function hashString(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks if a value exists in an array safely
 * @param {*} value - Value to check
 * @param {array} array - Array to search
 * @returns {boolean} True if value exists
 */
export function safeIncludes(value, array) {
  try {
    return Array.isArray(array) && array.includes(value);
  } catch (e) {
    return false;
  }
}

/**
 * Deep clones an object safely
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error('Error cloning object:', e);
    return obj;
  }
}

/**
 * Validates and returns a safe object subset
 * @param {object} obj - Object to validate
 * @param {array} allowedKeys - Array of allowed keys
 * @returns {object} Object with only allowed keys
 */
export function getSafeObjectSubset(obj, allowedKeys) {
  const result = {};
  if (typeof obj !== 'object' || obj === null) return result;

  allowedKeys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });

  return result;
}

/**
 * Sets Content Security Policy headers (for server-side use)
 * @returns {object} CSP header configuration
 */
export function getCSPHeaders() {
  return {
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
  };
}

/**
 * Generates a CSRF token
 * @returns {string} CSRF token
 */
export function generateCSRFToken() {
  return generateSecureRandomString(32);
}

/**
 * Validates CSRF token
 * @param {string} token - Token to validate
 * @param {string} storedToken - Stored token to compare against
 * @returns {boolean} True if tokens match
 */
export function validateCSRFToken(token, storedToken) {
  return token === storedToken;
}

/**
 * Rate limiting utility - checks if action is allowed
 * @param {string} key - Unique identifier for rate limiting
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} Object with allowed boolean and remaining count
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const storage = window.rateLimitStorage || {};

  if (!storage[key]) {
    storage[key] = [];
  }

  // Remove old entries outside the time window
  storage[key] = storage[key].filter((timestamp) => now - timestamp < windowMs);

  const allowed = storage[key].length < maxAttempts;

  if (allowed) {
    storage[key].push(now);
  }

  window.rateLimitStorage = storage;

  return {
    allowed,
    remaining: Math.max(0, maxAttempts - storage[key].length),
  };
}

export default {
  // Form Validation
  validateEmail,
  validatePassword,
  validatePhone,
  validateURL,
  validateRequired,
  validateRange,
  validateCreditCard,
  // Data Sanitization
  sanitizeHTML,
  trimWhitespace,
  removeSpecialCharacters,
  escapeSQLString,
  sanitizeInput,
  encodeForURL,
  decodeFromURL,
  // Currency Formatting
  formatCurrency,
  formatNumber,
  parseCurrency,
  calculatePercentage,
  applyDiscount,
  calculateWithTax,
  // Security Helpers
  generateRandomString,
  generateSecureRandomString,
  hashString,
  safeIncludes,
  deepClone,
  getSafeObjectSubset,
  getCSPHeaders,
  generateCSRFToken,
  validateCSRFToken,
  checkRateLimit,
};
