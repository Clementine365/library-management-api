const mongodb = require('../config/db');

beforeAll(async () => {
  await new Promise((resolve, reject) => {
    mongodb.initDb((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
});

afterAll(async () => {
  const db = mongodb.getDb();
  if (db) {
    await db.client.close();
  }
});

