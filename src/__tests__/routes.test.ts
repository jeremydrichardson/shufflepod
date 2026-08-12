import request from 'supertest';
import app from '../index';

describe('API Routes', () => {
  describe('GET /', () => {
    it('should return app info', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('app');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'healthy' });
    });
  });

  describe('GET /shuffle', () => {
    it('should return 400 when URL is missing', async () => {
      const response = await request(app).get('/shuffle');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when URL format is invalid', async () => {
      const response = await request(app).get('/shuffle?url=not_a_url');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid URL format');
    });

    it('should return 400 when seed is not a number', async () => {
      const response = await request(app).get('/shuffle?url=https://example.com/feed.xml&seed=abc');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Seed must be a number');
    });
  });
});
