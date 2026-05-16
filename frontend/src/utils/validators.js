/**
 * Form validation helpers
 * Used by ComplaintForm, Login, and other input forms
 */

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone) {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
}

export function validateRequired(value, fieldName = 'Field') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateMinLength(value, min, fieldName = 'Field') {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return null;
}

export function validateMaxLength(value, max, fieldName = 'Field') {
  if (value && value.length > max) {
    return `${fieldName} must be at most ${max} characters`;
  }
  return null;
}

/**
 * Validate complaint form data
 */
export function validateComplaint(data) {
  const errors = {};

  const categoryErr = validateRequired(data.category, 'Category');
  if (categoryErr) errors.category = categoryErr;

  const descErr = validateRequired(data.description, 'Description');
  if (descErr) errors.description = descErr;

  const descMinErr = validateMinLength(data.description, 10, 'Description');
  if (descMinErr) errors.description = descMinErr;

  if (!data.location || !data.location.lat || !data.location.lng) {
    errors.location = 'Location is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate coordinates
 */
export function isValidCoordinate(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}
