const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");

const collection = () => getDb().collection("books");

// Create a new book
exports.createBook = async (req, res) => {
  //#swagger.tags=['Books']
  const { title, author, status, location } = req.body;

  try {
    const result = await collection().insertOne({
      title,
      author,
      status,
      location,
    });
    res
      .status(201)
      .json(
        result.ops
          ? result.ops[0]
          : { _id: result.insertedId, title, author, status, location }
      );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all books with optional filters
exports.getBooks = async (req, res) => {
  //#swagger.tags=['Books']
  const { title, author, status } = req.query;

  try {
    const query = {};
    if (title) query.title = { $regex: title, $options: "i" };
    if (author) query.author = { $regex: author, $options: "i" };
    if (status) query.status = status;

    const books = await collection().find(query).toArray();
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get a book by ID
exports.getBookById = async (req, res) => {
  //#swagger.tags=['Books']
  try {
    // Get ID from either bookId or id parameter
    const bookId = req.params.bookId || req.params.id;

    // Validate that we have an ID
    if (!bookId) {
      return res.status(400).json({ msg: "Book ID is required" });
    }

    // Validate that the ID is a valid ObjectId
    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ msg: "Invalid book ID format" });
    }

    const book = await collection().findOne({ _id: new ObjectId(bookId) });
    if (!book) return res.status(404).json({ msg: "Book not found" });
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  //#swagger.tags=['Books']
  const { title, author, status, location } = req.body;

  try {
    // Get ID from either bookId or id parameter
    const bookId = req.params.bookId || req.params.id;

    // Validate that we have an ID
    if (!bookId) {
      return res.status(400).json({ msg: "Book ID is required" });
    }

    // Validate that the ID is a valid ObjectId
    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ msg: "Invalid book ID format" });
    }

    const result = await collection().findOneAndUpdate(
      { _id: new ObjectId(bookId) },
      { $set: { title, author, status, location } },
      { returnDocument: "after" }
    );

    if (!result.value) return res.status(404).json({ msg: "Book not found" });

    res.json(result.value);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  //#swagger.tags=['Books']
  try {
    // Get ID from either bookId or id parameter
    const bookId = req.params.bookId || req.params.id;

    // Validate that we have an ID
    if (!bookId) {
      return res.status(400).json({ msg: "Book ID is required" });
    }

    // Validate that the ID is a valid ObjectId
    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ msg: "Invalid book ID format" });
    }

    const result = await collection().deleteOne({ _id: new ObjectId(bookId) });
    if (result.deletedCount === 0)
      return res.status(404).json({ msg: "Book not found" });

    res.json({ msg: "Book deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};
