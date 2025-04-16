const mongodb = require('../config/db');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const result = await db.collection('lending-records').find().toArray();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSingle = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const id = new ObjectId(req.params.id);
    const result = await db.collection('lending-records').findOne({ _id: id });
    if (!result) {
      return res.status(404).json({ message: 'Lending record not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getByUser = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const userId = new ObjectId(req.params.userId);
    const result = await db.collection('lending-records').find({ userId: userId }).toArray();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getByBook = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const bookId = new ObjectId(req.params.bookId);
    const result = await db.collection('lending-records').find({ bookId: bookId }).toArray();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getActive = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const result = await db.collection('lending-records')
      .find({ returnDate: null })
      .toArray();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOverdue = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const today = new Date();
    const result = await db.collection('lending-records')
      .find({
        returnDate: null,
        dueDate: { $lt: today }
      })
      .toArray();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createLendingRecord = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const lendingRecord = {
      userEmail: req.body.userEmail,
      bookTitle: req.body.bookTitle,
      lentDate: new Date(req.body.lentDate),
      dueDate: new Date(req.body.dueDate),
      returnDate: req.body.returnDate ? new Date(req.body.returnDate) : null,
      status: req.body.status
    };
    const result = await db.collection('lending-records').insertOne(lendingRecord);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateLendingRecord = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const id = new ObjectId(req.params.id);
    const updates = {
      userEmail: req.body.userEmail,
      bookTitle: req.body.bookTitle,
      lentDate: new Date(req.body.lentDate),
      dueDate: new Date(req.body.dueDate),
      returnDate: req.body.returnDate ? new Date(req.body.returnDate) : null,
      status: req.body.status
    };
    const result = await db.collection('lending-records').updateOne(
      { _id: id },
      { $set: updates }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Lending record not found' });
    }
    res.status(200).json({ message: 'Lending record updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteLendingRecord = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const id = new ObjectId(req.params.id);
    const result = await db.collection('lending-records').deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Lending record not found' });
    }
    res.status(200).json({ message: 'Lending record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAll,
  getSingle,
  getByUser,
  getByBook,
  getActive,
  getOverdue,
  createLendingRecord,
  updateLendingRecord,
  deleteLendingRecord
};