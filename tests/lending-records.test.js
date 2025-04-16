const request = require('supertest');
const app = require('../server');
const { ObjectId } = require('mongodb');
let server;

beforeAll((done) => {
  server = app.listen(done);
});

afterAll((done) => {
  server.close(done);
});

describe('Lending Records Endpoints', () => {
  describe('GET /lending-records', () => {
    it('should return all lending records', async () => {
      const res = await request(app)
        .get('/lending-records')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('GET /lending-records/:id', () => {
    it('should return a single lending record', async () => {
      // First get all records to get a valid ID
      const allRecords = await request(app).get('/lending-records');
      if (allRecords.body.length > 0) {
        const recordId = allRecords.body[0]._id;
        const res = await request(app)
          .get(`/lending-records/${recordId}`)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('userEmail');
        expect(res.body).toHaveProperty('bookTitle');
      }
    });

    it('should return 404 for non-existent record', async () => {
      const res = await request(app)
        .get(`/lending-records/${new ObjectId()}`)
        .expect(404);
    });
  });

  test('GET /lending-records/user/:userId should return lending records for a specific user', async () => {
    const allUsers = await request(server).get('/users');
    if (allUsers.body.length > 0) {
      const userId = allUsers.body[0]._id;
      const response = await request(server).get(`/lending-records/user/${userId}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    }
  });

  test('GET /lending-records/book/:bookId should return lending records for a specific book', async () => {
    const allBooks = await request(server).get('/books');
    if (allBooks.body.length > 0) {
      const bookId = allBooks.body[0]._id;
      const response = await request(server).get(`/lending-records/book/${bookId}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    }
  });

  test('GET /lending-records/active should return all active lending records', async () => {
    const response = await request(server).get('/lending-records/active');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('returnDate', null);
    }
  });

  test('GET /lending-records/overdue should return all overdue lending records', async () => {
    const response = await request(server).get('/lending-records/overdue');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    if (response.body.length > 0) {
      const today = new Date();
      const dueDate = new Date(response.body[0].dueDate);
      expect(dueDate).toBeLessThan(today);
      expect(response.body[0].returnDate).toBeNull();
    }
  });
});