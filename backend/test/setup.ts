// Test setup file
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables for testing from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  // console.log = jest.fn();
  // console.error = jest.fn();
  // console.warn = jest.fn();
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
}); 