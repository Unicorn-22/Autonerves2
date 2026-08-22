// client/src/utils/validation.js
/**
 * Email validation regex pattern
 * @type {RegExp}
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Phone number validation regex pattern (Indian format)
 * @type {RegExp}
 */
export const PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Password validation - minimum 6 characters
 * @param {string} password - Password to validate
 * @returns {boolean} Whether the password is valid
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

/**
 * Phone number validation
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export const isValidPhone = (phone) => {
  return PHONE_REGEX.test(phone);
};

/**
 * Required field validation
 * @param {string} value - Field value
 * @returns {boolean} Whether the field has a value
 */
export const isRequired = (value) => {
  return value !== undefined && value !== null && value.trim() !== '';
};

/**
 * Form validation helper
 * @param {Object} values - Form values
 * @param {Object} rules - Validation rules
 * @returns {Object} Object containing errors and isValid flag
 */
export const validateForm = (values, rules) => {
  const errors = {};
  let isValid = true;
  
  Object.entries(rules).forEach(([field, fieldRules]) => {
    // Skip validation if no value and field is not required
    if (!values[field] && !fieldRules.required) {
      return;
    }
    
    // Required validation
    if (fieldRules.required && !isRequired(values[field])) {
      errors[field] = 'This field is required';
      isValid = false;
      return;
    }
    
    // Email validation
    if (fieldRules.email && !isValidEmail(values[field])) {
      errors[field] = 'Please enter a valid email address';
      isValid = false;
      return;
    }
    
    // Phone validation
    if (fieldRules.phone && !isValidPhone(values[field])) {
      errors[field] = 'Please enter a valid 10-digit phone number';
      isValid = false;
      return;
    }
    
    // Password validation
    if (fieldRules.password && !isValidPassword(values[field])) {
      errors[field] = 'Password must be at least 6 characters long';
      isValid = false;
      return;
    }
    
    // Min length validation
    if (fieldRules.minLength && values[field].length < fieldRules.minLength) {
      errors[field] = `Must be at least ${fieldRules.minLength} characters`;
      isValid = false;
      return;
    }
    
    // Max length validation
    if (fieldRules.maxLength && values[field].length > fieldRules.maxLength) {
      errors[field] = `Cannot exceed ${fieldRules.maxLength} characters`;
      isValid = false;
      return;
    }
    
    // Custom validation
    if (fieldRules.validate && typeof fieldRules.validate === 'function') {
      const customError = fieldRules.validate(values[field], values);
      if (customError) {
        errors[field] = customError;
        isValid = false;
      }
    }
  });
  
  return { errors, isValid };
};
