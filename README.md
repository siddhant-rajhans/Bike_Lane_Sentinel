# Bike Lane Sentinel 🚴

Monitor illegal vehicle encroachment into bike lanes using AI-powered image analysis.

## Overview

Bike Lane Sentinel is a TypeScript API that uses [Moondream's Query API](https://moondream.ai/c/docs/advanced/api/query) to analyze images and detect vehicles illegally parked in bike lanes. The system asks a simple question: "Are there cars parking on the bike lane? Answer in yes or no." and provides a clear response.

## Features

- 🚗 **Simple Detection**: Uses Moondream's Query API to ask "Are there cars parking on the bike lane?"
- ✅ **Yes/No Answers**: Clear binary response (yes/no) for easy interpretation
- 🔒 **Security**: Rate limiting, CORS protection, and input validation
- 📈 **Scalable**: Built with Express.js and TypeScript for production use

## API Endpoints

### Health Check
```
GET /api/health
```
Returns API status and version information.

### Bike Lane Detection
```
POST /api/detect-bike-lane-violations
```
Analyzes an image to detect cars parked in bike lanes using Moondream's Query API.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file) - JPEG, PNG, or GIF image (max 10MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "hasCarsInBikeLane": true,
    "answer": "yes",
    "timestamp": "2024-08-01T12:34:56.789Z"
  }
}
```

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Bike_Lane_Sentinel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your Moondream API key:
   ```
   MOONDREAM_API_KEY=your_moondream_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Usage Examples

### Using cURL
```bash
# Bike lane detection
curl -X POST \
  http://localhost:3000/api/detect-bike-lane-violations \
  -H 'Content-Type: multipart/form-data' \
  -F 'image=@/path/to/your/image.jpg'
```

### Using JavaScript/TypeScript
```typescript
import FormData from 'form-data';
import fs from 'fs';

const formData = new FormData();
formData.append('image', fs.createReadStream('/path/to/your/image.jpg'));

const response = await fetch('http://localhost:3000/api/detect-bike-lane-violations', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Has cars in bike lane:', result.data.hasCarsInBikeLane);
console.log('Moondream answer:', result.data.answer);
```

### Using Python
```python
import requests

with open('/path/to/your/image.jpg', 'rb') as f:
    files = {'image': f}
    response = requests.post(
        'http://localhost:3000/api/detect-bike-lane-violations',
        files=files
    )
    
result = response.json()
print(f"Has cars in bike lane: {result['data']['hasCarsInBikeLane']}")
print(f"Moondream answer: {result['data']['answer']}")
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MOONDREAM_API_KEY` | Your Moondream API key | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `MAX_FILE_SIZE` | Maximum file size in bytes | 10485760 (10MB) |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests per window | 100 |

### Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- Configurable via environment variables

## Architecture

```
src/
├── controllers/
│   └── bikeLaneController.ts    # HTTP request handlers
├── services/
│   └── moondreamService.ts      # Moondream API integration
├── types/
│   └── index.ts                 # TypeScript type definitions
└── index.ts                     # Main application entry point
```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

### How It Works

1. **Image Upload**: Accepts JPEG, PNG, or GIF images (max 10MB)
2. **Moondream Query**: Sends the image to Moondream with the question "Are there cars parking on the bike lane? Answer in yes or no."
3. **Response Parsing**: Parses the yes/no answer from Moondream
4. **Result**: Returns a structured response with the violation status

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error description"
}
```

Common error codes:
- `400` - Bad Request (invalid file, missing image)
- `413` - Payload Too Large (file too big)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: File type and size validation
- **Error Handling**: Secure error messages

## Limitations

- Maximum image size: 10MB
- Supported formats: JPEG, PNG, GIF
- Detection accuracy depends on image quality and Moondream's AI model
- Requires clear visibility of bike lanes and vehicles in the image

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the [Moondream API documentation](https://moondream.ai/c/docs/advanced/api/query)
2. Review the error logs
3. Open an issue in the repository

---

**Note**: This API is designed for educational and demonstration purposes. For production use in NYC DOT systems, additional validation, security measures, and compliance checks may be required.

## Running Tests

To run tests, use the following command:
```bash
npm test
```
