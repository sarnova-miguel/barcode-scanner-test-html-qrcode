# UPC Item DB API Setup Guide

## Overview

The `product-lookup.js` script integrates with the UPC Item DB API to retrieve product information from scanned barcodes.

## API Plans

### FREE Trial Plan (Default)
- **No API key required**
- **100 requests per day**
- **1 request per second rate limit**
- Perfect for testing and small projects
- Already configured and ready to use!

### Paid Plans (DEV/PRO)
- **Requires API key**
- Higher request limits
- Faster rate limits
- More features

## Quick Start (FREE Trial)

The script is already configured to use the FREE trial plan. No setup needed!

Just include the script in your HTML:

```html
<script src="/product-lookup.js"></script>
```

## Setup for Paid Plans

If you have a paid plan (DEV or PRO):

### 1. Get Your API Key

1. Sign up at [UPCitemdb.com](https://www.upcitemdb.com/)
2. Subscribe to a paid plan (DEV or PRO)
3. Get your API key from your account dashboard

### 2. Configure the Script

Open `product-lookup.js` and update the configuration:

```javascript
const API_CONFIG = {
  // Set to true to use paid plan
  USE_PAID_PLAN: true,
  
  // Add your API key here
  API_KEY: 'your_api_key_here',
  
  // Usually '3scale' for paid plans
  KEY_TYPE: '3scale'
};
```

## Usage Examples

### Basic Lookup

```javascript
// Lookup a product by barcode
const result = await lookupProduct('012345678905');

if (result.success) {
  console.log('Product found:', result.product);
  console.log('Title:', result.product.title);
  console.log('Brand:', result.product.brand);
} else {
  console.error('Error:', result.error);
}
```

### Format and Display

```javascript
// Get product data
const result = await lookupProduct('012345678905');

if (result.success) {
  // Format the data
  const formatted = formatProductData(result.product);
  
  // Display in a container
  const container = document.getElementById('product-container');
  displayProductInfo(formatted, container);
}
```

### Integration with Barcode Scanner

```javascript
function onScanSuccess(decodedText, decodedResult) {
  // Scan successful - lookup product
  lookupProduct(decodedText).then(result => {
    if (result.success) {
      const formatted = formatProductData(result.product);
      const container = document.getElementById('reader-results');
      displayProductInfo(formatted, container);
    } else {
      console.error('Product lookup failed:', result.error);
    }
  });
}
```

## API Response Structure

### Successful Response

```json
{
  "success": true,
  "data": {
    "code": "OK",
    "total": 1,
    "offset": 0,
    "items": [...]
  },
  "product": {
    "ean": "0012345678905",
    "title": "Product Name",
    "brand": "Brand Name",
    "description": "Product description",
    "category": "Category",
    "images": ["url1", "url2"],
    "lowest_recorded_price": 9.99,
    "highest_recorded_price": 19.99,
    "currency": "USD",
    "offers": [...]
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Error Codes

- `NOT_FOUND` - No product found for this barcode
- `INVALID_UPC` - Invalid barcode format
- `EXCEED_LIMIT` - Daily request limit exceeded
- `TOO_FAST` - Rate limit exceeded (wait before next request)
- `NETWORK_ERROR` - Network connection error
- `AUTH_ERR` - Authentication failed (invalid API key)

## Rate Limits

### FREE Trial Plan
- **100 requests per day**
- **1 request per second**
- Resets daily at midnight UTC

### DEV Plan
- **10,000 requests per day**
- **5 requests per second**

### PRO Plan
- **100,000 requests per day**
- **10 requests per second**

## Best Practices

1. **Cache Results** - Store product data locally to avoid duplicate API calls
2. **Handle Errors Gracefully** - Always check `result.success` before using data
3. **Respect Rate Limits** - Add delays between requests if needed
4. **Use Trial for Testing** - Test with the free plan before upgrading

## Troubleshooting

### "EXCEED_LIMIT" Error
- You've hit your daily request limit
- Wait until midnight UTC for reset
- Consider upgrading to a higher plan

### "TOO_FAST" Error
- You're making requests too quickly
- Add a delay between requests (1-2 seconds for trial plan)

### "NOT_FOUND" Error
- The barcode is not in the database
- Try a different barcode
- Some products may not be indexed

### CORS Errors
- The API supports CORS for browser requests
- If you get CORS errors, check your browser console
- May need to run from a web server (not file://)

## Additional Resources

- [API Documentation](https://www.upcitemdb.com/wp/docs/main/development/getting-started/)
- [API Explorer](https://www.upcitemdb.com/api/explorer)
- [Plan Comparison](https://www.upcitemdb.com/wp/docs/main/development/plan-comparison/)

