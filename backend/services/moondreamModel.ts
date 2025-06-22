import { vl } from 'moondream';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const apiKey = process.env.MOONDREAM_API_KEY;

if (!apiKey) {
  throw new Error('MOONDREAM_API_KEY is not defined in the .env file');
}

// Create a single, global model instance
export const moondreamModel = new vl({ apiKey }); 