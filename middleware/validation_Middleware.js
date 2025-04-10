const validator = require('../helpers/validate');

const saveUser = async (req, res, next) => {
    // Define the validation rules
    const validationRule = {
        first_name: "required|string",
        last_name: "required|string",         
        email: "required|string|email", 
        gender: " required|string|in:Male,Female",
        ip_address: "string"
    };

    try {
        // Use the validator to validate the request body
        await validator(req.body, validationRule);
        next();  // Proceed to the next middleware if validation passes
    } catch (err) {
        // If validation fails, return an error response
        res.status(412).send({
            success: false,
            message: 'Validation failed',
            data: err
        });
    }
};

const saveLendingRecord = (req, res, next) => {
    try {
      const validationRule = {
        userId: 'required|ObjectId',
        bookId: 'required|string',
        nationality: 'required|string',
        genres: 'required|array', // fixed typo: 'require' → 'required'
        bio: 'required|string',
      };
  
      validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
          return res.status(412).send({
            success: false,
            message: 'Validation failed',
            data: err,
          });
        }
        next();
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Middleware validation error',
        error: error.message,
      });
    }
  };



module.exports = {
    saveUser,
    saveLendingRecord
};