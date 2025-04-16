const request = require('supertest');
const app = require('../server');
let server;

beforeAll((done) => {
  server = app.listen(done);
});

afterAll((done) => {
  server.close(done);
});

describe('User Endpoints', () => {
  test('GET /users should return all users', async () => {
    const response = await request(server).get('/users');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test('GET /users/:id should return a specific user', async () => {
    const allUsers = await request(server).get('/users');
    if (allUsers.body.length > 0) {
      const userId = allUsers.body[0]._id;
      const response = await request(server).get(`/users/${userId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('email');
    }
  });
});