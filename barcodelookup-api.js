/**
 * BarcodeLookup.com API Integration
 * Documentation: https://www.barcodelookup.com/api-documentation
 *
 * API Features:
 * - Product search by barcode (UPC, EAN, ISBN)
 * - Detailed product information including images, pricing, and descriptions
 * - Store availability and online purchase links
 * - Category and brand information
 *
 * API Endpoint: https://api.barcodelookup.com/v3/products
 * Authentication: API Key required (passed as query parameter)
 */

// API Configuration
const BARCODE_LOOKUP_CONFIG = {
  // Use local proxy server instead of calling BarcodeLookup API directly
  // This keeps the API key secure on the backend
  USE_PROXY: true,
  PROXY_URL: 'http://localhost:3000/api',

  // Direct API configuration (only used if USE_PROXY is false)
  ENDPOINT: 'https://api.barcodelookup.com/v3/products',
  API_KEY: '', // Not needed when using proxy

  // Rate limiting info (Free tier: 100 requests/day, 3 requests/minute)
  RATE_LIMIT: {
    daily: 100,
    perMinute: 3
  }
};

/**
 * Lookup product by barcode using BarcodeLookup.com API
 * @param {string} barcode - The barcode/UPC/EAN/ISBN to lookup
 * @returns {Promise<Object>} Product data or error
 */
async function productBarcodeLookup(barcode) {
  try {
    // Clean and validate barcode
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) {
      return {
        success: false,
        error: 'Invalid barcode: barcode cannot be empty',
        code: 'INVALID_BARCODE'
      };
    }

    console.log(`Fetching product data for barcode: ${cleanBarcode}`);

    let url;
    let fetchOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    // Use proxy server if enabled (recommended for security)
    if (BARCODE_LOOKUP_CONFIG.USE_PROXY) {
      url = `${BARCODE_LOOKUP_CONFIG.PROXY_URL}/lookup/${cleanBarcode}`;
      console.log('Using proxy server:', url);
    } else {
      // Direct API call (requires API key in frontend - not recommended)
      if (!BARCODE_LOOKUP_CONFIG.API_KEY) {
        console.warn('BarcodeLookup API key not configured');
        return {
          success: false,
          error: 'API key not configured. Please use proxy server or add API key.',
          code: 'NO_API_KEY'
        };
      }

      const params = new URLSearchParams({
        barcode: cleanBarcode,
        formatted: 'y',
        key: BARCODE_LOOKUP_CONFIG.API_KEY
      });

      url = `${BARCODE_LOOKUP_CONFIG.ENDPOINT}?${params.toString()}`;
      console.log('Using direct API call');
    }

    // Make API request
    const response = await fetch(url, fetchOptions);

    // Parse response
    const data = await response.json();

    console.log('API Response:', data);

    // Check for errors (proxy returns standardized format)
    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        code: data.code || 'API_ERROR',
        statusCode: response.status
      };
    }

    // Return successful response
    return data;

  } catch (error) {
    console.error('Error fetching product data from BarcodeLookup:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch product data',
      code: 'NETWORK_ERROR'
    };
  }
}

/**
 * Format BarcodeLookup product data for display
 * @param {Object} product - Product object from BarcodeLookup API
 * @returns {Object} Formatted product information
 */
function formatBarcodeLookupProduct(product) {
  return {
    // Basic information
    title: product.title || product.product_name || 'Unknown Product',
    brand: product.brand || product.manufacturer || '',
    description: product.description || '',
    category: product.category || '',

    // Barcode identifiers
    upc: product.barcode_number || product.upc || '',
    ean: product.ean || '',
    asin: product.asin || '',

    // Images
    images: product.images || [],

    // Pricing information
    price: {
      lowest: product.lowest_recorded_price || null,
      highest: product.highest_recorded_price || null,
      currency: product.currency || 'USD'
    },

    // Product details
    details: {
      color: product.color || '',
      size: product.size || '',
      weight: product.weight || '',
      dimension: product.dimension || '',
      model: product.model || '',
      mpn: product.mpn || '' // Manufacturer Part Number
    },

    // Store and availability
    stores: product.stores || [],

    // Additional metadata
    reviews: product.reviews || [],
    rating: product.rating || null,

    // Raw data for advanced usage
    raw: product
  };
}

/**
 * Display BarcodeLookup product information in the UI
 * @param {Object} productData - Formatted product data
 * @param {HTMLElement} container - Container element to display in
 */
function displayBarcodeLookupProduct(productData, container) {
  let html = `
    <div class="product-info barcodelookup-product">
      <h3 class="product-title">${productData.title}</h3>
  `;

  // Manufacturer
  if (productData.manufacturer) {
    html += `<p class="product-manufacturer"><strong>Manufacturer:</strong> ${productData.manufacturer}</p>`;
  }

  // Brand
  if (productData.brand) {
    html += `<p class="product-brand"><strong>Brand:</strong> ${productData.brand}</p>`;
  }

  // Category
  if (productData.category) {
    html += `<p class="product-category"><strong>Category:</strong> ${productData.category}</p>`;
  }

  // Description
  if (productData.description) {
    html += `<p class="product-description">${productData.description}</p>`;
  }

  // Barcode numbers
  if (productData.upc) {
    html += `<p class="product-upc"><strong>UPC/EAN:</strong> ${productData.upc}</p>`;
  }

  // Pricing
  if (productData.price.lowest || productData.price.highest) {
    html += `<div class="product-pricing">`;
    if (productData.price.lowest) {
      html += `<p><strong>Lowest Price:</strong> ${productData.price.currency} ${productData.price.lowest}</p>`;
    }
    if (productData.price.highest) {
      html += `<p><strong>Highest Price:</strong> ${productData.price.currency} ${productData.price.highest}</p>`;
    }
    html += `</div>`;
  }

  // Product details
  const details = [];
  if (productData.details.color) details.push(`Color: ${productData.details.color}`);
  if (productData.details.size) details.push(`Size: ${productData.details.size}`);
  if (productData.details.weight) details.push(`Weight: ${productData.details.weight}`);
  if (productData.details.model) details.push(`Model: ${productData.details.model}`);

  if (details.length > 0) {
    html += `<div class="product-details"><strong>Details:</strong> ${details.join(' | ')}</div>`;
  }

  // Stores
  if (productData.stores && productData.stores.length > 0) {
    html += `<div class="product-stores">
      <strong>Available at:</strong>
      <ul>`;
    productData.stores.forEach(store => {
      html += `<li>${store.store_name || store}</li>`;
    });
    html += `</ul></div>`;
  }

  // Product image
  if (productData.images && productData.images.length > 0) {
    html += `<div class="product-images">`;
    productData.images.slice(0, 3).forEach(image => {
      html += `<img src="${image}" alt="${productData.title}" class="product-image" onerror="this.style.display='none'" />`;
    });
    html += `</div>`;
  }

  // Rating
  if (productData.rating) {
    html += `<p class="product-rating"><strong>Rating:</strong> ${productData.rating} / 5</p>`;
  }

  html += `
      <p class="api-source"><small>Data provided by <a href="https://www.barcodelookup.com" target="_blank">BarcodeLookup.com</a></small></p>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Search products by keyword using BarcodeLookup API
 * @param {string} query - Search query
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} Search results or error
 */
async function searchProductsByKeyword(query, page = 1) {
  try {
    console.log(`Searching for: ${query} (page ${page})`);

    let url;
    let fetchOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    // Use proxy server if enabled
    if (BARCODE_LOOKUP_CONFIG.USE_PROXY) {
      const params = new URLSearchParams({
        q: query,
        page: page.toString()
      });
      url = `${BARCODE_LOOKUP_CONFIG.PROXY_URL}/search?${params.toString()}`;
      console.log('Using proxy server:', url);
    } else {
      // Direct API call
      if (!BARCODE_LOOKUP_CONFIG.API_KEY) {
        return {
          success: false,
          error: 'API key not configured',
          code: 'NO_API_KEY'
        };
      }

      const params = new URLSearchParams({
        search: query,
        formatted: 'y',
        page: page.toString(),
        key: BARCODE_LOOKUP_CONFIG.API_KEY
      });

      url = `${BARCODE_LOOKUP_CONFIG.ENDPOINT}?${params.toString()}`;
      console.log('Using direct API call');
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
        code: data.code || 'API_ERROR'
      };
    }

    return data;

  } catch (error) {
    console.error('Error searching BarcodeLookup:', error);
    return {
      success: false,
      error: error.message,
      code: 'NETWORK_ERROR'
    };
  }
}

// Compatibility wrapper for scanner-script.js
// Maps the existing function names to BarcodeLookup functions
async function lookupProduct(barcode) {
  return await productBarcodeLookup(barcode);
}

function formatProductData(product) {
  return formatBarcodeLookupProduct(product);
}

function displayProductInfo(productData, container) {
  return displayBarcodeLookupProduct(productData, container);
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    productBarcodeLookup,
    formatBarcodeLookupProduct,
    displayBarcodeLookupProduct,
    searchProductsByKeyword,
    BARCODE_LOOKUP_CONFIG,
    // Compatibility exports
    lookupProduct,
    formatProductData,
    displayProductInfo
  };
}

