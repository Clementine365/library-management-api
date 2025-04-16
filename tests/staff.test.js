const { describe, test, expect } = require('@jest/globals');
const request = require('supertest');
const app = require('../server');
let server;

beforeAll((done) => {
  server = app.listen(done);
});

afterAll((done) => {
  server.close(done);
});

describe('Staff Endpoints', () => {
  test('GET /staff should return all staff members', async () => {
    const response = await request(server).get('/staff');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test('GET /staff/:id should return a specific staff member', async () => {
    const allStaff = await request(server).get('/staff');
    if (allStaff.body.length > 0) {
      const staffId = allStaff.body[0]._id;
      const response = await request(server).get(`/staff/${staffId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('email');
    }
  });
});