const { MongoClient } = require('mongodb');
require('dotenv').config();

let _db;

const initDb = async (callback) => {
    if (_db) {
        console.log('Database is already initialized!');
        return callback(null, _db);
    }

    try {
        // Changed MONGODB_URI to MONGODB_URL to match .env
        const client = await MongoClient.connect(process.env.MONGODB_URL);
        _db = client.db(process.env.DB_NAME);
        callback(null, _db);
    } catch (err) {
        callback(err);
    }
};

const getDb = () => {
    if (!_db) {
        throw Error('Database not initialized');
    }
    return _db;  // _db is already the database instance
};

module.exports = {
    initDb,
    getDb
};