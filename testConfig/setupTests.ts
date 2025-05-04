import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(() => {
  // Any global setup that needs to happen before all tests
  console.log('Starting test suite');
});

// Global test teardown
afterAll(() => {
  // Any global teardown that needs to happen after all tests
  console.log('Test suite completed');
});

// Set timeout for all tests (optional)
jest.setTimeout(10000); 