const validator = require("../helpers/validate");

/**
 * Sanitize input data to prevent injection attacks
 */
const sanitizeInput = (data) => {
  const sanitized = {};

  // Process each field to sanitize
  for (const [key, value] of Object.entries(data)) {
    // Skip null or undefined values
    if (value == null) {
      sanitized[key] = value;
      continue;
    }

    // Sanitize strings
    if (typeof value === "string") {
      // Remove any potentially dangerous characters or patterns
      // This is a basic example - production code would need more thorough sanitization
      sanitized[key] = value
        .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
        .trim(); // Remove leading/trailing whitespace
    } else if (typeof value === "object" && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeInput(value);
    } else {
      // For other types (numbers, booleans, arrays), keep as is
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Validates staff data when creating or updating staff records
 */
const validateStaff = async (req, res, next) => {
  try {
    // Sanitize the input data first
    req.body = sanitizeInput(req.body);

    // Define the validation rules
    const validationRule = {
      first_name: "required|string|min:2|max:50",
      last_name: "required|string|min:2|max:50",
      email: "required|email",
      phone: "string",
      position: "required|string",
      department: "required|string",
      hire_date: "date",
      salary: "numeric|min:0",
      is_admin: "boolean",
      status: "string|in:Active,On Leave,Terminated",
    };

    // Custom messages for specific validation errors
    const customMessages = {
      required: ":attribute is required",
      email: ":attribute must be a valid email address",
      min: {
        numeric: ":attribute must be at least :min",
        string: ":attribute must be at least :min characters",
      },
      max: {
        string: ":attribute cannot exceed :max characters",
      },
      in: ":attribute must be one of: :values",
    };

    // Use the validator to validate the request body
    await validator(req.body, validationRule, customMessages);
    next(); // Proceed to the next middleware if validation passes
  } catch (err) {
    // If validation fails, return an error response
    console.log("Staff validation failed:", err);
    res.status(412).json({
      success: false,
      error_code: "VALIDATION_ERROR",
      message: "Staff data validation failed",
      validation_errors: err,
    });
  }
};

/**
 * Validates optional fields for partial updates to staff records
 */
const validatePartialStaffUpdate = async (req, res, next) => {
  try {
    // Sanitize the input data first
    req.body = sanitizeInput(req.body);

    // Ensure at least one field is provided
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error_code: "NO_UPDATE_DATA",
        message: "At least one field must be provided for update",
      });
    }

    // Define validation rules for partial updates (all fields optional)
    const validationRule = {
      first_name: "string|min:2|max:50",
      last_name: "string|min:2|max:50",
      email: "email",
      phone: "string",
      position: "string",
      department: "string",
      hire_date: "date",
      salary: "numeric|min:0",
      is_admin: "boolean",
      status: "string|in:Active,On Leave,Terminated",
    };

    // Custom messages for specific validation errors
    const customMessages = {
      email: ":attribute must be a valid email address",
      min: {
        numeric: ":attribute must be at least :min",
        string: ":attribute must be at least :min characters",
      },
      max: {
        string: ":attribute cannot exceed :max characters",
      },
      in: ":attribute must be one of: :values",
    };

    // Validate the provided fields
    await validator(req.body, validationRule, customMessages);
    next();
  } catch (err) {
    console.log("Staff validation failed:", err);
    res.status(412).json({
      success: false,
      error_code: "VALIDATION_ERROR",
      message: "Staff data validation failed",
      validation_errors: err,
    });
  }
};

module.exports = {
  validateStaff,
  validatePartialStaffUpdate,
};
