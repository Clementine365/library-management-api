const express = require('express');
const Book = require('../models/Book');
const router = express.Router();

// POST /books: Add a new book to the library
router.post('/', async (req, res) => {
  const { title, author, status, location } = req.body;

  try {
    // Create a new book
    const newBook = new Book({
      title,
      author,
      status,
      location,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /books: Get a list of all books (with optional filters)
router.get('/', async (req, res) => {
  const { title, author, status } = req.query;

  try {
    // Build a query object for optional filters
    const query = {};
    if (title) query.title = { $regex: title, $options: 'i' };  // Case-insensitive search
    if (author) query.author = { $regex: author, $options: 'i' };
    if (status) query.status = status;

    // Fetch books matching the query
    const books = await Book.find(query);
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /books/:bookId: Get details of a specific book
router.get('/:bookId', async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /books/:bookId: Update book details
router.put('/:bookId', async (req, res) => {
  const { title, author, status, location } = req.body;

  try {
    // Find and update the book
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.bookId,
      { title, author, status, location },
      { new: true } // Return the updated book
    );

    if (!updatedBook) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    res.json(updatedBook);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /books/:bookId: Delete a book from the system
router.delete('/:bookId', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.bookId);
    if (!deletedBook) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.json({ msg: 'Book deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
