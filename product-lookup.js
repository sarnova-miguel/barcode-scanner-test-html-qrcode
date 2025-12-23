/**
 * Product Lookup API Integration
 * Uses UPC Item DB API to retrieve product information from barcodes
 * Documentation: https://www.upcitemdb.com/wp/docs/main/development/getting-started/
 */

// API Configuration
const API_CONFIG = {
  // For FREE trial plan - no API key required
  TRIAL_ENDPOINT: 'https://api.upcitemdb.com/prod/trial/lookup',
  
  // For paid plans (DEV/PRO) - requires API key
  PAID_ENDPOINT: 'https://api.upcitemdb.com/prod/v1/lookup',
  
  // Set to true if you have a paid plan and API key
  USE_PAID_PLAN: false,
  
  // Your API key (only needed for paid plans)
  API_KEY: '',
  
  // Key type for paid plans (usually '3scale')
  KEY_TYPE: '3scale'
};

/**
 * Fetch product data from UPC Item DB API
 * @param {string} barcode - The barcode/UPC to lookup
 * @returns {Promise<Object>} Product data or error
 */
async function lookupProduct(barcode) {
  try {
    // Determine which endpoint to use
    const endpoint = API_CONFIG.USE_PAID_PLAN 
      ? API_CONFIG.PAID_ENDPOINT 
      : API_CONFIG.TRIAL_ENDPOINT;
    
    // Build request URL
    const url = `${endpoint}?upc=${encodeURIComponent(barcode)}`;
    
    // Build headers
    const headers = {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate'
    };
    
    // Add authentication headers for paid plans
    if (API_CONFIG.USE_PAID_PLAN && API_CONFIG.API_KEY) {
      headers['user_key'] = API_CONFIG.API_KEY;
      headers['key_type'] = API_CONFIG.KEY_TYPE;
    }
    
    // Make API request
    console.log(`Fetching product data for barcode: ${barcode}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    
    // Parse response
    const data = await response.json();
    
    // Check for errors
    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        code: data.code || 'UNKNOWN_ERROR'
      };
    }
    
    // Check if items were found
    if (!data.items || data.items.length === 0) {
      return {
        success: false,
        error: 'No product found for this barcode',
        code: 'NOT_FOUND'
      };
    }
    
    // Return successful response with product data
    return {
      success: true,
      data: data,
      product: data.items[0] // First item is usually the best match
    };
    
  } catch (error) {
    console.error('Error fetching product data:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch product data',
      code: 'NETWORK_ERROR'
    };
  }
}

/**
 * Format product data for display
 * @param {Object} product - Product object from API
 * @returns {Object} Formatted product information
 */
function formatProductData(product) {
  return {
    title: product.title || 'Unknown Product',
    brand: product.brand || 'Unknown Brand',
    description: product.description || '',
    model: product.model || '',
    category: product.category || '',
    upc: product.upc || product.ean || '',
    ean: product.ean || '',
    images: product.images || [],
    price: {
      lowest: product.lowest_recorded_price || null,
      highest: product.highest_recorded_price || null,
      currency: product.currency || 'USD'
    },
    details: {
      color: product.color || '',
      size: product.size || '',
      weight: product.weight || '',
      dimension: product.dimension || ''
    },
    offers: product.offers || []
  };
}

/**
 * Display product information in the UI
 * @param {Object} productData - Formatted product data
 * @param {HTMLElement} container - Container element to display in
 */
function displayProductInfo(productData, container) {
  let html = `
    <div class="product-info">
      <h3 class="product-title">${productData.title}</h3>
      ${productData.brand ? `<p class="product-brand"><strong>Brand:</strong> ${productData.brand}</p>` : ''}
      ${productData.description ? `<p class="product-description">${productData.description}</p>` : ''}
      ${productData.model ? `<p class="product-model"><strong>Model:</strong> ${productData.model}</p>` : ''}
      ${productData.category ? `<p class="product-category"><strong>Category:</strong> ${productData.category}</p>` : ''}
  `;
  
  // Add price information if available
  if (productData.price.lowest || productData.price.highest) {
    html += `<div class="product-price">`;
    if (productData.price.lowest) {
      html += `<p><strong>Lowest Price:</strong> ${productData.price.currency} $${productData.price.lowest}</p>`;
    }
    if (productData.price.highest) {
      html += `<p><strong>Highest Price:</strong> ${productData.price.currency} $${productData.price.highest}</p>`;
    }
    html += `</div>`;
  }
  
  // Add image if available
  if (productData.images && productData.images.length > 0) {
    html += `<img src="${productData.images[0]}" alt="${productData.title}" class="product-image" />`;
  }
  
  html += `</div>`;
  
  container.innerHTML = html;
}

