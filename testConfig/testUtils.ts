import { Express } from 'express';
import supertest from 'supertest';

/**
 * Create a supertest agent for making HTTP requests in tests
 * @param app Express application
 * @returns Supertest request agent
 */
export const createTestAgent = (app: Express) => {
  return supertest(app);
};

/**
 * Helper to generate test data
 * @param overrides Optional properties to override defaults
 * @returns Test data object
 */
export const generateTestData = <T>(overrides: Partial<T> = {}): T => {
  return {
    ...overrides
  } as T;
}; 