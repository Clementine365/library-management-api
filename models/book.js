const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  status: { type: String, enum: ['available', 'borrowed'], default: 'available' },
  location: { type: String },
});

module.exports = mongoose.model('Book', bookSchema);
