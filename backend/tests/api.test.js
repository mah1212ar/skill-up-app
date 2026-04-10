const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('API Routes Testing', () => {
  
  describe('POST /api/users/profile', () => {
    it('Creates a new user profile when valid mapped Phase 1 data is provided', async () => {
      const payload = {
        firebaseUid: 'mock_uid_123',
        email: 'test@example.com',
        onboardingData: { basicInfo: { fullName: 'Test User' } }
      };

      const res = await request(app)
        .post('/api/users/profile')
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Profile created successfully');
      expect(res.body.user.firebaseUid).toBe('mock_uid_123');
      
      const userInDb = await User.findOne({ firebaseUid: 'mock_uid_123' });
      expect(userInDb).toBeTruthy();
      expect(userInDb.email).toBe('test@example.com');
    });

    it('Returns code 400 if firebaseUid payload requirement is missing', async () => {
      const res = await request(app)
        .post('/api/users/profile')
        .send({ onboardingData: {} });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/required/);
    });
  });

  describe('GET /api/courses', () => {
    it('Returns a pre-populated list of simulated courses', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].title).toBeTruthy();
    });
  });

  describe('GET /api/users/admin/all', () => {
    it('Secures and loops all users mapping for Admin demographic table', async () => {
      await User.create({ firebaseUid: 'A1', email: 'a@a.com', onboardingStatus: 'completed' });
      await User.create({ firebaseUid: 'B2', email: 'b@b.com', onboardingStatus: 'completed' });
      
      const res = await request(app).get('/api/users/admin/all');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].email).toBe('b@b.com'); // Checks default (-1) sorting
    });
  });
});
