import { vl } from 'moondream';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const apiKey = process.env.MOONDREAM_API_KEY;

if (!apiKey) {
  throw new Error('MOONDREAM_API_KEY is not defined in the .env file');
}

// Create a single, global model instance
export const moondreamModel = new vl({ apiKey }); 