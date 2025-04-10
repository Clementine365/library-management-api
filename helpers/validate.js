const Validator = require('validatorjs');

/**
 * Validates request data using validatorjs.
 *
 * @param {Object} body - The data object to validate.
 * @param {Object} rules - Validation rules.
 * @param {Object} [customMessages={}] - Optional custom error messages.
 * @returns {Promise<boolean>} Resolves if valid, rejects with errors if invalid.
 */
const validator = async (body, rules, customMessages = {}) => {
  if (!Validator) {
    throw new Error('ValidatorJS is not properly imported');
  }

  const validation = new Validator(body, rules, customMessages);

  return new Promise((resolve, reject) => {
    validation.passes(() => resolve(true));
    validation.fails(() => reject(validation.errors));
  });
};

module.exports = validator;