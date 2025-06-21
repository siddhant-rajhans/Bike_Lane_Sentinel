import fs from 'fs';
import path from 'path';
import { moondreamModel } from '../services/moondreamModel';

// This test suite will make real API calls to Moondream
describe('Moondream Integration Test', () => {

  it('should get a "no" answer for an image with no cars in the bike lane', async () => {
    // Path to the test image
    const imagePath = path.join(__dirname, 'fixtures', 'road_image.jpeg');
    
    // Check if the image file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Test image not found at: ${imagePath}. Make sure road_image.jpeg is in src/test/fixtures`);
    }

    // Read the image file into a buffer
    const imageBuffer = fs.readFileSync(imagePath);

    // Call the service to check for bike lane violations
    const response: any = await moondreamModel.query({
      image: imageBuffer,
      question: "Are there cars parking on the bike lane? Answer in yes or no.",
      stream: false
    });

    // Assertions
    expect(response).toBeDefined();
    expect(response.answer).toBeDefined();
    // Based on the image, the answer should be 'no' as there are no cars in the bike lane
    expect(response.answer.toLowerCase().trim()).toBe('no');
  }, 30000); // Increase timeout for real network request
}); 