const express = require('express');
const mongoose = require('mongoose');
const booksRoutes = require('./routes/books');//this will import the books route




// Routes
app.use('/books', booksRoutes); 