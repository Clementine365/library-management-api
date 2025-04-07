const express = require('express');
const bodyParser = require('body-parser');
const booksRoutes = require('./routes/books');
const swagger = require('./config/swagger');
const mongodb = require('./config/db');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Z-key'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Add swagger documentation
swagger(app);

// Redirect root to API documentation
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

// Routes
app.use('/books', booksRoutes);
app.use('/', require('./routes'));

mongodb.initDb((err) => {
    if (err) {
        console.log(err);
    } else {
        app.listen(port, () => {
            console.log(`Database is connected and server is running on port ${port}`);
            console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
        });
    }
});
