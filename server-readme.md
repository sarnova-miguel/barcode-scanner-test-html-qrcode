# BarcodeLookup API Proxy Server

## Overview
This Express.js server acts as a secure proxy between your frontend application and the BarcodeLookup.com API.

## Benefits
- **Security**: Keeps API key secure (not exposed to frontend)
- **CORS Handling**: Properly configured CORS for cross-origin requests
- **Extensibility**: Easy to add caching, rate limiting, and logging
- **Centralized Control**: Single point of control for all API calls
- **Error Handling**: Comprehensive error handling and standardized responses

## Prerequisites
- Node.js (v12 or higher)
- npm or yarn package manager

## Dependencies
```json
{
  "express": "^4.x",
  "cors": "^2.x",
  "axios": "^1.x",
  "dotenv": "^16.x"
}
```

## Installation

1. Install dependencies:
```bash
npm install express cors axios dotenv
```

2. Create a `.env` file in the project root:
```env
PORT=3000
BARCODE_LOOKUP_API_KEY=your-api-key-here
```

3. Start the server:
```bash
node server.js
```

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `BARCODE_LOOKUP_API_KEY`: Your BarcodeLookup.com API key

### API Configuration
```javascript
const BARCODE_LOOKUP_API = {
  BASE_URL: 'https://api.barcodelookup.com/v3/products',
  API_KEY: process.env.BARCODE_LOOKUP_API_KEY
};
```

### CORS Settings
```javascript
cors({
  origin: '*', // Allow all origins (change to specific domain in production)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

**⚠️ Production Note:** Change `origin: '*'` to your specific domain for security.

## API Endpoints

### 1. Server Info
**GET /** 

Returns server status and available endpoints.

**Response:**
```json
{
  "status": "ok",
  "message": "BarcodeLookup API Proxy Server",
  "version": "1.0.0",
  "endpoints": {
    "health": "GET /",
    "lookup": "GET /api/lookup/:barcode",
    "search": "GET /api/search?q=keyword&page=1"
  }
}
```

### 2. Health Check
**GET /health**

Returns server health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-26T10:30:00.000Z"
}
```

### 3. Lookup Product by Barcode
**GET /api/lookup/:barcode**

Lookup product information using a barcode.

**Parameters:**
- `barcode` (path parameter): UPC/EAN/ISBN barcode number

**Example Request:**
```bash
curl http://localhost:3000/api/lookup/049000050103
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { /* full API response */ },
  "product": { /* first product object */ },
  "totalProducts": 1
}
```

**Error Responses:**
- `400 Bad Request`: Invalid or missing barcode
- `404 Not Found`: No product found for barcode
- `503 Service Unavailable`: BarcodeLookup API not responding
- `500 Internal Server Error`: Server error

### 4. Search Products by Keyword
**GET /api/search**

Search for products using keywords.

**Query Parameters:**
- `q` (required): Search query/keyword
- `page` (optional): Page number (default: 1)

**Example Request:**
```bash
curl "http://localhost:3000/api/search?q=iPhone&page=1"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { /* full API response */ },
  "products": [ /* array of products */ ],
  "totalProducts": 10
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_BARCODE` | 400 | Barcode parameter is missing or empty |
| `INVALID_QUERY` | 400 | Search query parameter is missing or empty |
| `NOT_FOUND` | 404 | No product found or endpoint not found |
| `API_ERROR` | varies | Error from BarcodeLookup API |
| `SERVICE_UNAVAILABLE` | 503 | BarcodeLookup API is not responding |
| `INTERNAL_ERROR` | 500 | Internal server error |

## Error Response Format

All errors follow this standardized format:
```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "statusCode": 404  // Optional: HTTP status from upstream API
}
```

## Features

### Request Logging
All requests are logged with timestamp:
```
[2025-12-26T10:30:00.000Z] GET /api/lookup/049000050103
```

### Timeout Protection
All API requests have a 10-second timeout to prevent hanging requests.

### Comprehensive Error Handling
Three types of errors are handled:
1. **Response errors**: API returned an error
2. **Request errors**: No response received from API
3. **Internal errors**: Server-side errors

## Usage Examples

### JavaScript/Fetch
```javascript
// Lookup by barcode
const response = await fetch('http://localhost:3000/api/lookup/049000050103');
const data = await response.json();

if (data.success) {
  console.log('Product:', data.product);
}
```

### cURL
```bash
# Lookup product
curl http://localhost:3000/api/lookup/049000050103

# Search products
curl "http://localhost:3000/api/search?q=laptop&page=1"

# Health check
curl http://localhost:3000/health
```

## Production Deployment

### Security Checklist
- [ ] Set `BARCODE_LOOKUP_API_KEY` in environment variables
- [ ] Change CORS `origin` from `'*'` to your specific domain
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Add request authentication if needed
- [ ] Set up proper logging and monitoring
- [ ] Use process manager (PM2, systemd)

### Recommended Enhancements
- Add Redis caching for frequently requested barcodes
- Implement rate limiting middleware
- Add request authentication/API keys
- Set up monitoring and alerting
- Add request/response logging to file
- Implement retry logic for failed API calls

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify all dependencies are installed
- Check `.env` file exists and is properly formatted

### API calls failing
- Verify `BARCODE_LOOKUP_API_KEY` is set correctly
- Check BarcodeLookup API status
- Review server logs for error messages
- Ensure internet connectivity

### CORS errors
- Verify CORS middleware is properly configured
- Check browser console for specific CORS errors
- Update `origin` setting if needed

## License
This is a proxy server implementation for educational and development purposes.

