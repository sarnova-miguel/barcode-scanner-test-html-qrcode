# BarcodeLookup.com API Integration

## Overview
This module provides integration with the BarcodeLookup.com API for product information retrieval using barcodes (UPC, EAN, ISBN).

**Official Documentation:** https://www.barcodelookup.com/api-documentation

## Features
- Product search by barcode (UPC, EAN, ISBN)
- Detailed product information including images, pricing, and descriptions
- Store availability and online purchase links
- Category and brand information
- Keyword-based product search

## API Configuration

### Proxy Mode (Recommended)
The module uses a local proxy server by default to keep the API key secure on the backend.

```javascript
const BARCODE_LOOKUP_CONFIG = {
  USE_PROXY: true,
  PROXY_URL: 'http://localhost:3000/api'
};
```

### Direct API Mode
For direct API calls (not recommended for production):

```javascript
const BARCODE_LOOKUP_CONFIG = {
  USE_PROXY: false,
  ENDPOINT: 'https://api.barcodelookup.com/v3/products',
  API_KEY: 'your-api-key-here'
};
```

### Rate Limits
- **Free Tier:** 100 requests/day, 3 requests/minute
- Ensure your application respects these limits to avoid API errors

## Main Functions

### 1. `productBarcodeLookup(barcode)`
Lookup product information by barcode.

**Parameters:**
- `barcode` (string): The barcode/UPC/EAN/ISBN to lookup

**Returns:** Promise<Object>
- `success` (boolean): Whether the lookup was successful
- `product` (Object): Product data (if successful)
- `error` (string): Error message (if failed)
- `code` (string): Error code (if failed)

**Example:**
```javascript
const result = await productBarcodeLookup('012345678905');
if (result.success) {
  console.log('Product:', result.product);
} else {
  console.error('Error:', result.error);
}
```

### 2. `formatBarcodeLookupProduct(product)`
Format raw API product data for easier use.

**Returns:** Object with structured fields:
- `title`: Product name
- `brand`: Brand name
- `description`: Product description
- `category`: Product category
- `upc`, `ean`, `asin`: Barcode identifiers
- `images`: Array of product images
- `price`: Object with `lowest`, `highest`, and `currency`
- `details`: Object with `color`, `size`, `weight`, `dimension`, `model`, `mpn`
- `stores`: Array of stores where available
- `reviews`: Product reviews
- `rating`: Product rating
- `raw`: Original API response

### 3. `displayBarcodeLookupProduct(productData, container)`
Display formatted product information in the UI.

**Parameters:**
- `productData` (Object): Formatted product data
- `container` (HTMLElement): DOM element to display the product in

**Example:**
```javascript
const container = document.getElementById('product-display');
displayBarcodeLookupProduct(formattedProduct, container);
```

### 4. `searchProductsByKeyword(query, page)`
Search for products by keyword.

**Parameters:**
- `query` (string): Search query
- `page` (number): Page number (default: 1)

**Returns:** Promise<Object> with search results

**Example:**
```javascript
const results = await searchProductsByKeyword('laptop', 1);
if (results.success) {
  console.log('Found products:', results.products);
}
```

## Compatibility Functions

For backward compatibility with existing code:
- `lookupProduct(barcode)` → calls `productBarcodeLookup(barcode)`
- `formatProductData(product)` → calls `formatBarcodeLookupProduct(product)`
- `displayProductInfo(productData, container)` → calls `displayBarcodeLookupProduct(productData, container)`

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_BARCODE` | Barcode is empty or invalid |
| `NO_API_KEY` | API key not configured (direct mode only) |
| `API_ERROR` | Error from BarcodeLookup API |
| `NETWORK_ERROR` | Network or fetch error |

## Response Format

### Successful Response
```javascript
{
  success: true,
  product: { /* product data */ }
}
```

### Error Response
```javascript
{
  success: false,
  error: "Error message",
  code: "ERROR_CODE",
  statusCode: 404  // HTTP status code (if applicable)
}
```

## Product Data Structure

The formatted product object includes:
- **Basic Info:** title, brand, description, category
- **Identifiers:** upc, ean, asin
- **Media:** images array
- **Pricing:** lowest/highest recorded prices with currency
- **Details:** color, size, weight, dimension, model, mpn
- **Availability:** stores array
- **Reviews:** reviews array and rating

## Usage in HTML

Include the script in your HTML:
```html
<script src="barcodelookup-api.js"></script>
```

Then use the functions:
```javascript
async function handleBarcodeScan(barcode) {
  const result = await productBarcodeLookup(barcode);
  
  if (result.success) {
    const formatted = formatBarcodeLookupProduct(result.product);
    const container = document.getElementById('product-info');
    displayBarcodeLookupProduct(formatted, container);
  } else {
    console.error('Lookup failed:', result.error);
  }
}
```

## Security Notes

- **Always use proxy mode in production** to keep your API key secure
- Never expose your API key in client-side code
- The proxy server should validate and sanitize requests
- Implement rate limiting on your proxy to stay within API limits

## Dependencies

- Modern browser with Fetch API support
- Proxy server (when USE_PROXY is true)

## Module Exports

When used in Node.js environment:
```javascript
const {
  productBarcodeLookup,
  formatBarcodeLookupProduct,
  displayBarcodeLookupProduct,
  searchProductsByKeyword,
  BARCODE_LOOKUP_CONFIG
} = require('./barcodelookup-api.js');
```

