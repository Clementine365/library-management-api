const validator = require("../helpers/validate");

const saveUser = async (req, res, next) => {
  // Define the validation rules
  const validationRule = {
    first_name: "required|string",
    last_name: "required|string",
    email: "required|string|email",
    gender: "required|string|in:Male,Female",
    ip_address: "string",
  };

  try {
    // Use the validator to validate the request body
    await validator(req.body, validationRule);
    next(); // Proceed to the next middleware if validation passes
  } catch (err) {
    // If validation fails, return an error response
    res.status(412).send({
      success: false,
      message: "Validation failed",
      data: err,
    });
  }
};

const saveLendingRecord = async (req, res, next) => {
  try {
    const validationRule = {
      userId: "required|objectId",
      bookId: "required|objectId",
      lentDate: "required|date",
      dueDate: "required|date",
      returnDate: "date",
      status: "required|string|in:borrowed,returned,overdue",
    };

    try {
      await validator(req.body, validationRule);
      next();
    } catch (err) {
      return res.status(412).send({
        success: false,
        message: "Lending record validation failed",
        data: err,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Middleware validation error",
      error: error.message,
    });
  }
};

const saveStaff = async (req, res, next) => {
  // Define the validation rules for staff
  const validationRule = {
    first_name: "required|string",
    last_name: "required|string",
    email: "required|string|email",
    position: "required|string",
    department: "required|string",
    phone: "string",
    hire_date: "date",
    salary: "numeric",
    is_admin: "boolean",
    status: "string|in:Active,On Leave,Terminated",
  };

  try {
    // Use the validator to validate the request body
    await validator(req.body, validationRule);
    next(); // Proceed to the next middleware if validation passes
  } catch (err) {
    // If validation fails, return an error response
    res.status(412).send({
      success: false,
      message: "Staff validation failed",
      data: err,
    });
  }
};

//varidation rule for book
const saveBook = async (req, res, next) => {
  const validationRule = {
    title: "required|string",
    author: "required|string",
    status: "string|in:available,borrowed", // optional because default is 'available'
    location: "required|string",
  };

  try {
    await validator(req.body, validationRule);
    next(); // proceed if validation passes
  } catch (err) {
    res.status(412).send({
      success: false,
      message: "Book validation failed",
      data: err,
    });
  }
};

module.exports = {
  saveUser,
  saveLendingRecord,
  saveStaff,
  saveBook,
};
