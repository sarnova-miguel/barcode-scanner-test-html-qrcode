/**
 * UPCDatabase.org API Integration
 * Documentation: https://upcdatabase.org/api
 *
 * CORS Issue: The UPCDatabase API doesn't support CORS from browsers
 * Solution: Using CORS proxy (allorigins.win) to bypass CORS restrictions
 *
 * API Format: GET https://api.upcdatabase.org/product/{barcode}?apikey={api_key}
 */

// API Configuration
// API_KEY is injected from environment variable UPC_DATABASE_API_KEY during build
// If not set, it will be an empty string (limited API access)
const UPC_API_CONFIG = {
  // Base endpoint
  ENDPOINT: 'https://api.upcdatabase.org/product',

  // CORS proxy to bypass browser CORS restrictions
  // Alternative proxies: 'https://corsproxy.io/?', 'https://api.allorigins.win/raw?url='
  CORS_PROXY: 'https://api.allorigins.win/raw?url=',

  // API key from environment variable (injected at build time)
  // This will be used as a query parameter to avoid CORS preflight issues
  API_KEY: 'C0D1F5CEBE1CC47A17C986642FEF7B53',

  // Use API key if available
  get USE_API_KEY() {
    return this.API_KEY !== '' && this.API_KEY !== 'C0D1F5CEBE1CC47A17C986642FEF7B53';
  },

  // Enable/disable CORS proxy
  USE_CORS_PROXY: true
};

/**
 * Lookup product by barcode using UPCDatabase.org API
 * @param {string} barcode - The barcode/UPC to lookup
 * @returns {Promise<Object>} Product data or error
 */
async function lookupProduct(barcode) {
  try {
    // Pad barcode to 13 digits with leading zeros if necessary
    const paddedBarcode = barcode.padStart(13, '0');

    // Build request URL with API key as query parameter
    let apiUrl = `${UPC_API_CONFIG.ENDPOINT}/${paddedBarcode}`;

    if (UPC_API_CONFIG.API_KEY) {
      apiUrl += `?apikey=${UPC_API_CONFIG.API_KEY}`;
      console.log(`Fetching product data for barcode: ${paddedBarcode} (with API key)`);
    } else {
      console.log(`Fetching product data for barcode: ${paddedBarcode} (limited access mode)`);
    }

    // Use CORS proxy if enabled (required for browser-based requests)
    let url = apiUrl;
    if (UPC_API_CONFIG.USE_CORS_PROXY) {
      url = UPC_API_CONFIG.CORS_PROXY + encodeURIComponent(apiUrl);
      console.log('Using CORS proxy to bypass browser restrictions');
      console.log('Proxied URL: ', url);
    }

    console.log(`API URL: ${apiUrl.replace(/apikey=[^&]+/, 'apikey=***')}`); // Hide API key in logs

    // Build headers - ONLY simple headers to avoid CORS preflight
    // DO NOT use Authorization or Cookie headers - they trigger CORS preflight!
    const headers = {
      'Accept': 'application/json'
    };

    // Make API request through CORS proxy
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    
    // Parse response
    const data = await response.json();
    
    console.log('API Response:', data);
    
    // Check for errors
    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        code: 'API_ERROR'
      };
    }
    
    // Check if product was found
    if (!data || data.error) {
      return {
        success: false,
        error: data.error || 'No product found for this barcode',
        code: 'NOT_FOUND'
      };
    }
    
    // Check if valid property exists and is true
    if (data.valid === false || data.valid === "false") {
      return {
        success: false,
        error: 'Invalid barcode or product not found',
        code: 'INVALID_BARCODE'
      };
    }
    
    // Return successful response with product data
    return {
      success: true,
      data: data,
      product: data
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
    title: product.title || product.description || 'Unknown Product',
    brand: product.brand || '',
    description: product.description || '',
    category: product.category || '',
    upc: product.upc || product.ean || '',
    ean: product.ean || '',
    images: product.images || [],
    issuerCountry: product.issuer_country || '',
    size: product.size || '',
    weight: product.weight || '',
    // UPCDatabase.org doesn't provide price data
    price: {
      lowest: null,
      highest: null,
      currency: 'USD'
    },
    details: {
      color: product.color || '',
      size: product.size || '',
      weight: product.weight || '',
      dimension: ''
    },
    offers: []
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
      ${productData.category ? `<p class="product-category"><strong>Category:</strong> ${productData.category}</p>` : ''}
      ${productData.issuerCountry ? `<p><strong>Country:</strong> ${productData.issuerCountry}</p>` : ''}
      ${productData.size ? `<p><strong>Size:</strong> ${productData.size}</p>` : ''}
      ${productData.weight ? `<p><strong>Weight:</strong> ${productData.weight}</p>` : ''}
  `;
  
  // Add image if available
  if (productData.images && productData.images.length > 0) {
    html += `<img src="${productData.images[0]}" alt="${productData.title}" class="product-image" onerror="this.style.display='none'" />`;
  }
  
  html += `</div>`;
  
  container.innerHTML = html;
}

