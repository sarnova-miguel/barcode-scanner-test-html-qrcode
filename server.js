/**
 * BarcodeLookup API Proxy Server
 * 
 * This Express server acts as a proxy between your frontend and BarcodeLookup.com API
 * Benefits:
 * - Keeps API key secure (not exposed to frontend)
 * - Handles CORS properly
 * - Can add caching, rate limiting, logging
 * - Single point of control for API calls
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// BarcodeLookup API Configuration
const BARCODE_LOOKUP_API = {
  BASE_URL: 'https://api.barcodelookup.com/v3/products',
  API_KEY: process.env.BARCODE_LOOKUP_API_KEY || '0yinrnfohz7u0yqbpmfj6rrtbc9b7l'
};

// Middleware
app.use(cors({
  origin: '*', // Allow all origins (change to specific domain in production)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BarcodeLookup API Proxy Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /',
      lookup: 'GET /api/lookup/:barcode',
      search: 'GET /api/search?q=keyword&page=1'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

/**
 * Lookup product by barcode
 * GET /api/lookup/:barcode
 */
app.get('/api/lookup/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    
    // Validate barcode
    if (!barcode || barcode.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Barcode parameter is required',
        code: 'INVALID_BARCODE'
      });
    }

    // Build API URL with query parameters
    const apiUrl = `${BARCODE_LOOKUP_API.BASE_URL}`;
    const params = {
      barcode: barcode.trim(),
      formatted: 'y',
      key: BARCODE_LOOKUP_API.API_KEY
    };

    console.log(`Calling BarcodeLookup API for barcode: ${barcode}`);

    // Call BarcodeLookup API
    const response = await axios.get(apiUrl, {
      params: params,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BarcodeLookup-Proxy/1.0'
      },
      timeout: 10000 // 10 second timeout
    });

    // Check if products were found
    if (!response.data.products || response.data.products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No product found for this barcode',
        code: 'NOT_FOUND'
      });
    }

    // Return successful response
    res.json({
      success: true,
      data: response.data,
      product: response.data.products[0],
      totalProducts: response.data.products.length
    });

  } catch (error) {
    console.error('Error calling BarcodeLookup API:', error.message);
    
    // Handle different error types
    if (error.response) {
      // API returned an error response
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.message || error.response.statusText,
        code: 'API_ERROR',
        statusCode: error.response.status
      });
    } else if (error.request) {
      // Request was made but no response received
      return res.status(503).json({
        success: false,
        error: 'BarcodeLookup API is not responding',
        code: 'SERVICE_UNAVAILABLE'
      });
    } else {
      // Something else went wrong
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

/**
 * Search products by keyword
 * GET /api/search?q=keyword&page=1
 */
app.get('/api/search', async (req, res) => {
  try {
    const { q: query, page = 1 } = req.query;

    // Validate query
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
        code: 'INVALID_QUERY'
      });
    }

    console.log(`Searching for: ${query} (page ${page})`);

    // Build API URL with query parameters
    const apiUrl = `${BARCODE_LOOKUP_API.BASE_URL}`;
    const params = {
      search: query.trim(),
      formatted: 'y',
      page: page.toString(),
      key: BARCODE_LOOKUP_API.API_KEY
    };

    // Call BarcodeLookup API
    const response = await axios.get(apiUrl, {
      params: params,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BarcodeLookup-Proxy/1.0'
      },
      timeout: 10000
    });

    // Return successful response
    res.json({
      success: true,
      data: response.data,
      products: response.data.products || [],
      totalProducts: response.data.products ? response.data.products.length : 0
    });

  } catch (error) {
    console.error('Error searching BarcodeLookup API:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.message || error.response.statusText,
        code: 'API_ERROR'
      });
    } else if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'BarcodeLookup API is not responding',
        code: 'SERVICE_UNAVAILABLE'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    availableEndpoints: {
      health: 'GET /',
      lookup: 'GET /api/lookup/:barcode',
      search: 'GET /api/search?q=keyword&page=1'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 BarcodeLookup API Proxy Server');
  console.log('='.repeat(50));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🔑 API Key configured: ${BARCODE_LOOKUP_API.API_KEY ? 'Yes' : 'No'}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /                          - Server info`);
  console.log(`   GET  /health                    - Health check`);
  console.log(`   GET  /api/lookup/:barcode       - Lookup product by barcode`);
  console.log(`   GET  /api/search?q=keyword      - Search products`);
  console.log('='.repeat(50));
  console.log(`\n💡 Example requests:`);
  console.log(`   curl http://localhost:${PORT}/api/lookup/049000050103`);
  console.log(`   curl http://localhost:${PORT}/api/search?q=iPhone`);
  console.log('='.repeat(50));
});

