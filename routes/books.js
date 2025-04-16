

const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const bookController = require("../controllers/bookController");
const { saveBook } = require("../middleware/validationMiddleware");
const auth = require("../middleware/authenticate");

=======
const bookController = require('../controllers/bookController');
const { saveBook } = require('../middleware/validation_Middleware');
const auth = require('../middleware/authenticate'); 
>>>>>>> 17b773bb5cd2732c04a20648213bd759e99d4b5f

// Route to create a new book with authentication and validation
router.post(
  "/",
  auth.isAuthenticated, // Ensure the user is authenticated
  saveBook, // Validate the book data
  bookController.createBook
);

// Route to get all books
router.get("/", bookController.getBooks);

// Route to get a specific book by its ID
router.get("/:bookId", bookController.getBookById);

// Route to update a book by its ID with authentication and validation
router.put(
  "/:bookId",
  auth.isAuthenticated, // Ensure the user is authenticated
  saveBook, // Validate the updated book data
  bookController.updateBook
);

// Route to delete a book by its ID with authentication
router.delete("/:bookId", auth.isAuthenticated, bookController.deleteBook);

module.exports = router;
