/**
 * Test script for BarcodeLookup API Proxy Server
 * 
 * Run this after starting the server to verify it's working correctly
 * Usage: node test-server.js
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:3000';
const TEST_BARCODE = '049000050103'; // Coca-Cola
const TEST_SEARCH = 'iPhone';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log('\n' + '='.repeat(50));
  log(`Testing: ${name}`, 'cyan');
  console.log('='.repeat(50));
}

async function testHealthCheck() {
  logTest('Health Check');
  try {
    const response = await axios.get(`${SERVER_URL}/health`);
    log('✓ Health check passed', 'green');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    log('✗ Health check failed', 'red');
    console.error('Error:', error.message);
    return false;
  }
}

async function testServerInfo() {
  logTest('Server Info');
  try {
    const response = await axios.get(`${SERVER_URL}/`);
    log('✓ Server info retrieved', 'green');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    log('✗ Server info failed', 'red');
    console.error('Error:', error.message);
    return false;
  }
}

async function testBarcodeLookup() {
  logTest(`Barcode Lookup (${TEST_BARCODE})`);
  try {
    const response = await axios.get(`${SERVER_URL}/api/lookup/${TEST_BARCODE}`);
    
    if (response.data.success) {
      log('✓ Barcode lookup successful', 'green');
      console.log('Product:', response.data.product.title || 'Unknown');
      console.log('Brand:', response.data.product.brand || 'Unknown');
      return true;
    } else {
      log('✗ Barcode lookup returned error', 'yellow');
      console.log('Error:', response.data.error);
      return false;
    }
  } catch (error) {
    log('✗ Barcode lookup failed', 'red');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return false;
  }
}

async function testSearch() {
  logTest(`Product Search (${TEST_SEARCH})`);
  try {
    const response = await axios.get(`${SERVER_URL}/api/search`, {
      params: { q: TEST_SEARCH, page: 1 }
    });
    
    if (response.data.success) {
      log('✓ Product search successful', 'green');
      console.log('Products found:', response.data.totalProducts);
      if (response.data.products && response.data.products.length > 0) {
        console.log('First result:', response.data.products[0].title || 'Unknown');
      }
      return true;
    } else {
      log('✗ Product search returned error', 'yellow');
      console.log('Error:', response.data.error);
      return false;
    }
  } catch (error) {
    log('✗ Product search failed', 'red');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return false;
  }
}

async function testInvalidBarcode() {
  logTest('Invalid Barcode (Error Handling)');
  try {
    const response = await axios.get(`${SERVER_URL}/api/lookup/invalid123`);
    
    if (!response.data.success) {
      log('✓ Error handling works correctly', 'green');
      console.log('Error message:', response.data.error);
      return true;
    } else {
      log('✗ Should have returned an error', 'yellow');
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      log('✓ Error handling works correctly (404)', 'green');
      console.log('Error message:', error.response.data.error);
      return true;
    } else {
      log('✗ Unexpected error', 'red');
      console.error('Error:', error.message);
      return false;
    }
  }
}

async function runAllTests() {
  console.clear();
  log('\n🧪 BarcodeLookup API Proxy Server Tests\n', 'blue');
  log(`Server URL: ${SERVER_URL}`, 'cyan');
  log(`Test Barcode: ${TEST_BARCODE}`, 'cyan');
  log(`Test Search: ${TEST_SEARCH}`, 'cyan');

  const results = {
    healthCheck: await testHealthCheck(),
    serverInfo: await testServerInfo(),
    barcodeLookup: await testBarcodeLookup(),
    search: await testSearch(),
    errorHandling: await testInvalidBarcode()
  };

  // Summary
  console.log('\n' + '='.repeat(50));
  log('Test Summary', 'blue');
  console.log('='.repeat(50));

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✓' : '✗';
    const color = result ? 'green' : 'red';
    log(`${status} ${test}`, color);
  });

  console.log('\n' + '='.repeat(50));
  if (passed === total) {
    log(`All tests passed! (${passed}/${total})`, 'green');
  } else {
    log(`Some tests failed (${passed}/${total})`, 'yellow');
  }
  console.log('='.repeat(50) + '\n');

  process.exit(passed === total ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  log('\n✗ Test suite failed', 'red');
  console.error(error);
  process.exit(1);
});

