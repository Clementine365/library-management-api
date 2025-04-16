// tests/books.test.js
const request = require('supertest');
const app = require('../server');
let server;

beforeAll((done) => {
  server = app.listen(done);
});

afterAll((done) => {
  server.close(done);
});

describe('Book Endpoints', () => {
  test('GET /books should return all books', async () => {
    const response = await request(server).get('/books');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test('GET /books/:id should return a specific book', async () => {
    const allBooks = await request(server).get('/books');
    if (allBooks.body.length > 0) {
      const bookId = allBooks.body[0]._id;
      const response = await request(server).get(`/books/${bookId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title');
    }
  });
});