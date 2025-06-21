const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Example usage of the Bike Lane Sentinel API
async function testBikeLaneAPI() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test health endpoint
    console.log('🔍 Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);
    
    // Test bike lane detection (you'll need an actual image file)
    console.log('\n🚗 Testing bike lane detection...');
    
    // Create form data with a test image
    const formData = new FormData();
    
    // You can replace this with an actual image file path
    // formData.append('image', fs.createReadStream('./test-image.jpg'));
    
    // For demonstration, we'll create a simple test
    console.log('Note: To test with a real image, uncomment the line above and provide an image file');
    
    const detectionResponse = await fetch(`${baseUrl}/api/detect-bike-lane-violations`, {
      method: 'POST',
      body: formData
    });
    
    if (detectionResponse.ok) {
      const detectionData = await detectionResponse.json();
      console.log('Detection result:', detectionData);
    } else {
      console.log('Detection failed:', await detectionResponse.text());
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

// Example with cURL commands
function showCurlExamples() {
  console.log('\n📋 cURL Examples:');
  console.log('\n1. Health Check:');
  console.log('curl -X GET http://localhost:3000/api/health');
  
  console.log('\n2. Basic Bike Lane Detection:');
  console.log('curl -X POST \\');
  console.log('  http://localhost:3000/api/detect-bike-lane-violations \\');
  console.log('  -H "Content-Type: multipart/form-data" \\');
  console.log('  -F "image=@/path/to/your/image.jpg"');
  
  console.log('\n3. Enhanced Bike Lane Detection:');
  console.log('curl -X POST \\');
  console.log('  http://localhost:3000/api/detect-bike-lane-violations/enhanced \\');
  console.log('  -H "Content-Type: multipart/form-data" \\');
  console.log('  -F "image=@/path/to/your/image.jpg"');
}

// Example Python code
function showPythonExample() {
  console.log('\n🐍 Python Example:');
  console.log(`
import requests

def test_bike_lane_detection():
    url = 'http://localhost:3000/api/detect-bike-lane-violations'
    
    with open('/path/to/your/image.jpg', 'rb') as f:
        files = {'image': f}
        response = requests.post(url, files=files)
        
    if response.status_code == 200:
        result = response.json()
        print(f"Has cars in bike lane: {result['data']['hasCarsInBikeLane']}")
        print(f"Car count: {result['data']['carCount']}")
        print(f"Confidence: {result['data']['confidence']}")
    else:
        print(f"Error: {response.text}")

test_bike_lane_detection()
  `);
}

// Example TypeScript/JavaScript code
function showTypeScriptExample() {
  console.log('\n📝 TypeScript/JavaScript Example:');
  console.log(`
import FormData from 'form-data';
import fs from 'fs';

async function detectBikeLaneViolations(imagePath: string) {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath));

  const response = await fetch('http://localhost:3000/api/detect-bike-lane-violations', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Detection Results:');
    console.log('- Has cars in bike lane:', result.data.hasCarsInBikeLane);
    console.log('- Car count:', result.data.carCount);
    console.log('- Confidence:', result.data.confidence);
    console.log('- Detected cars:', result.data.detectedCars);
  } else {
    console.error('Error:', result.error);
  }
}

detectBikeLaneViolations('/path/to/your/image.jpg');
  `);
}

// Run examples
if (require.main === module) {
  console.log('🚴 Bike Lane Sentinel API Examples\n');
  
  showCurlExamples();
  showPythonExample();
  showTypeScriptExample();
  
  console.log('\n⚠️  Note: Make sure the API server is running before testing!');
  console.log('   Run: npm run dev (after installing dependencies)');
}

module.exports = {
  testBikeLaneAPI,
  showCurlExamples,
  showPythonExample,
  showTypeScriptExample
}; 