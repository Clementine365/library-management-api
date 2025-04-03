const express = require('express');
const bodyParser = require('body-parser')

const app = express();
const port = process.env.PORT || 3000;

app
    .use(bodyParser.json())
    .use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader(
            'Access-Control-Allow-Origin',
            'Origin, X-Requested-With, Content-Type, Accept, Z-key'
        );
        res.setHeader('Access-Control-Allow-Origin', 'GET, POST, PUT, DELETE, OPTIONS');
        next();
    });
app.use('/', require('./routes'));

mongodb.initDb((err) => {
    if (err) {
        console.log(err);
    }
    else {
         // If the database initializes successfully, start the server and listen on the specified port.
         // If the database initializes successfully, start the server and listen on the specified port.
        app.listen(port, () => {console.log(`Database is listening and node Running on port ${port}`)});
    }
});
