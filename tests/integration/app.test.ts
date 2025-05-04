import request from 'supertest';
import app from '../../src/app';

describe('Express App Integration Tests', () => {
  describe('Root Route', () => {
    it('should return welcome message on root route', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Welcome to SuperClip API');
    });
  });

  describe('Health Check', () => {
    it('should return status OK from health check endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });
  });

  describe('API Routes', () => {
    it('should return API version', async () => {
      const response = await request(app).get('/api/v1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('version');
      expect(response.body.version).toBe('1.0');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors for non-existent routes', async () => {
      const response = await request(app).get('/this-route-does-not-exist');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Not Found');
    });

    it('should return proper validation error for invalid requests', async () => {
      const response = await request(app)
        .post('/api/v1/data')
        .send({}) // Empty payload
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
    });

    it('should handle server errors gracefully', async () => {
      const response = await request(app).get('/api/v1/error-test');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('Content Type Handling', () => {
    it('should handle JSON requests properly', async () => {
      const testData = { name: 'test', value: 123 };

      const response = await request(app)
        .post('/api/v1/data')
        .send(testData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should reject requests with unsupported content types', async () => {
      const response = await request(app)
        .post('/api/v1/data')
        .send('<data>test</data>')
        .set('Content-Type', 'application/xml');

      expect(response.status).toBe(415);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in the response', async () => {
      const response = await request(app).get('/');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('CORS Support', () => {
    it('should include CORS headers in the response', async () => {
      const response = await request(app).get('/').set('Origin', 'http://example.com');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
