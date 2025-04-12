const mongodb = require('../config/db');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
  //#swagger.tags=['Lending Record']
  try {
    const result = await mongodb
      .getDb()
      .collection("lendingRecords")
      .find();

    const lendingRecords = await result.toArray(); 
    res.status(200).json(lendingRecords); 
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching Lending Record', error: err.message });
  }
};
  

  const getSingle = async (req, res) => {
    //#swagger.tags=['Lending Record']
    try {
      const recordId = new ObjectId(req.params.id);
      const result = await mongodb
        .getDb()
        .collection("lendingRecords")
        .find({ _id: recordId });

      const authors = await result.toArray();
      if (!authors.length) {
        return res.status(404).json({ message: 'Lending Record not found' });
      }
  
      res.status(200).json(authors[0]);
    } catch (err) {
      res.status(400).json({
        message: 'Invalid record ID or fetch error',
        error: err.message,
      });
    }
  };

  const createLendingRecord = async (req, res) => {
    //#swagger.tags=['Lending Record']
    try {
      const lendingRecord = {
        userEmail: req.body.userEmail,
        bookTitle: req.body.bookTitle,
        lentDate: req.body.lentDate,
        dueDate: req.body.dueDate,
        returnDate: req.body.returnDate,
        status: req.body.status
      };
  
      const response = await mongodb
        .getDb()
        .collection("lendingRecords")
        .insertOne(lendingRecord);

      if (response.acknowledged) {
        return res.status(201).json({ id: response.insertedId });
      } else {
        return res.status(500).json({ message: 'Failed to create Lending Record' });
      }
    } catch (err) {
      res
        .status(400)
        .json({ message: 'Error creating Lending Record', error: err.message });
    }
  };

  const updateLendingRecord = async (req, res) => {
    //#swagger.tags=['Lending Record']
    try {
      const recordId = new ObjectId(req.params.id);
      const lendingRecord = {
        userEmail: req.body.userEmail,
        bookTitle: req.body.bookTitle,
        lentDate: req.body.lentDate,
        dueDate: req.body.dueDate,
        returnDate: req.body.returnDate,
        status: req.body.status
      };
  
      const response = await mongodb
        .getDb()
        .collection("lendingRecords")
        .replaceOne({ _id: recordId }, lendingRecord);

      if (response.matchedCount === 0) {
        return res.status(404).json({ message: 'Lending Record not found' });
      }
  
      if (response.modifiedCount > 0) {
        return res.status(204).send();
      } else {
        return res.status(200).json({ message: 'No changes made to the Lending Record' });
      }
    } catch (err) {
      res
        .status(400)
        .json({ message: 'Error updating Lending Record', error: err.message });
    }
  };

  const deleteLendingRecord = async (req, res) => {
    //#swagger.tags=['Lending Record']
    try {
      const recordId = new ObjectId(req.params.id);
      const response = await mongodb
        .getDb()
        .collection("lendingRecords")
        .deleteOne({ _id: recordId });
  
      if (response.deletedCount > 0) {
        return res.status(204).send();
      } else {
        return res.status(404).json({ message: 'Lending Record not found' });
      }
    } catch (err) {
      res
        .status(400)
        .json({ message: 'Error deleting Lending Record', error: err.message });
    }
  };

  module.exports = {
    getAll,
    getSingle,
    createLendingRecord,
    updateLendingRecord,
    deleteLendingRecord,
  };