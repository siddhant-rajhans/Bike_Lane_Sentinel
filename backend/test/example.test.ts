import request from 'supertest';
import express from 'express';
import multer from 'multer';
import { BikeLaneController } from '../controllers/bikeLaneController';
import { moondreamModel } from '../services/moondreamModel';

// Mock the moondreamModel
jest.mock('../services/moondreamModel', () => ({
  moondreamModel: {
    query: jest.fn(),
  },
}));

const mockedMoondreamQuery = moondreamModel.query as jest.Mock;

// Setup express app for testing
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const bikeLaneController = new BikeLaneController();

app.post('/api/detect-bike-lane-violations', upload.single('image'), (req, res) => bikeLaneController.detectBikeLaneViolations(req, res));
app.get('/api/health', (req, res) => bikeLaneController.healthCheck(req, res));

describe('BikeLaneController', () => {

  beforeEach(() => {
    // Reset the mock before each test
    mockedMoondreamQuery.mockClear();
  });
  
  it('should return a violation when cars are detected', async () => {
    // Mock the service to return 'yes'
    mockedMoondreamQuery.mockResolvedValue({ answer: 'yes' });

    const mockImageBuffer = Buffer.from('fake-image-data');

    const response = await request(app)
      .post('/api/detect-bike-lane-violations')
      .attach('image', mockImageBuffer, 'test.jpg')
      .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('hasCarsInBikeLane');
      expect(response.body.data).toHaveProperty('answer');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data.hasCarsInBikeLane).toBe(true);
  });

  it('should return no violation when no cars are detected', async () => {
    // Mock the service to return 'no'
    mockedMoondreamQuery.mockResolvedValue({ answer: 'no' });

    const mockImageBuffer = Buffer.from('fake-image-data-no-cars');
    const response = await request(app)
      .post('/api/detect-bike-lane-violations')
      .attach('image', mockImageBuffer, 'test.jpg')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.hasCarsInBikeLane).toBe(false);
  });

  it('should handle invalid file types', async () => {
    const response = await request(app)
      .post('/api/detect-bike-lane-violations')
      .send({ some_other_field: 'value' }) // No image attached
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Image file is required.');
  });
});

// A simple health check test
describe('Health Check', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Bike Lane Sentinel API is running',
      timestamp: expect.any(String),
      version: '1.0.0'
    });
  });
}); 