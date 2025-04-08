// const Validator = require('validatorjs');
// const validator = async (body, rules, customMessages, callback) => {
//     const validation = new Validator(body, rules, customMessages);
//     validation.passes(() => callback(null, true));
//     validation.fails(() => callback(validation.errors, false));
// };
// module.exports = validator;

// Ensure that validatorjs is required
const Validator = require('validatorjs');

// Create the validation function
const validator = async (body, rules, customMessages = {}) => {
    // Ensure Validator is loaded
    if (!Validator) {
        throw new Error('ValidatorJS is not properly imported');
    }

    const validation = new Validator(body, rules, customMessages);

    // Return a Promise to handle validation asynchronously
    return new Promise((resolve, reject) => {
        validation.passes(() => resolve(true));  // Resolve if validation passes
        validation.fails(() => reject(validation.errors));  // Reject if validation fails
    });
};

module.exports = validator;