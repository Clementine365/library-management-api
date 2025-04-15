const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

const collection = () => getDb().collection('books');

// Create a new book
exports.createBook = async (req, res) => {
  //#swagger.tags=['Books']
  const { title, author, status, location } = req.body;

  try {
    const result = await collection().insertOne({ title, author, status, location });
    res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, title, author, status, location });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all books with optional filters
exports.getBooks = async (req, res) => {
  //#swagger.tags=['Books']
  const { title, author, status } = req.query;

  try {
    const query = {};
    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (status) query.status = status;

    const books = await collection().find(query).toArray();
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get a book by ID
exports.getBookById = async (req, res) => {
  //#swagger.tags=['Books']
  try {
    const book = await collection().findOne({ _id: new ObjectId(req.params.bookId) });
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  //#swagger.tags=['Books']
  try {
    const bookId = new ObjectId(req.params.bookId);
    const book = {
      title: req.body.title,
      author: req.body.author,
      status: req.body.status,
      location: req.body.location,
      // Add more fields here if your Book schema includes them
    };

    const response = await collection().replaceOne({ _id: bookId }, book);

    if (response.matchedCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (response.modifiedCount > 0) {
      return res.status(204).send();
    } else {
      return res
        .status(200)
        .json({ message: "No changes made to the book" });
    }
  } catch (err) {
    res.status(400).json({
      message: "Error updating book",
      error: err.message,
    });
  }
};


// Delete a book
exports.deleteBook = async (req, res) => {
  //#swagger.tags=['Books']
  try {
    const result = await collection().deleteOne({ _id: new ObjectId(req.params.bookId) });
    if (result.deletedCount === 0) return res.status(404).json({ msg: 'Book not found' });

    res.json({ msg: 'Book deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
