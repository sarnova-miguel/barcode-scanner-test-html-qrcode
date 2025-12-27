# Barcode Scanner with Product Lookup

A web-based barcode scanner that uses your device's camera to scan barcodes and retrieve product information from BarcodeLookup.com API.

## Features

- 📷 **Camera-based scanning** - Uses HTML5-QRCode library (Free plan)
- 🔍 **Product lookup** - Retrieves detailed product info from BarcodeLookup.com API (Free plan)
- � **Secure proxy server** - API key protected on backend (Node.js/Express)
- 🌐 **No CORS issues** - Proxy server handles all API communication
- 📱 **Mobile friendly** - Works on phones and tablets
- 🖼️ **Rich product data** - Images, pricing, descriptions, store availability
- � **Keyword search** - Search products by name or keyword

## Quick Start

### 1. Install Dependencies

```bash
npm install express cors axios dotenv
```

### 2. Configure API Key

Create a `.env` file in the project root:

```env
PORT=3000
BARCODE_LOOKUP_API_KEY=your-api-key-here
```

### 3. Start the Proxy Server

```bash
node server.js
```

The server will start on `http://localhost:3000`

### 4. Open the App

Open `index.html` in your browser

### 5. Start Scanning

1. **Allow camera access** when prompted
2. **Scan a barcode** - Hold it steady for 2-3 seconds
3. **View product info** - Details appear below the scanner

## Get an API Key

1. Visit [BarcodeLookup.com](https://www.barcodelookup.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file

**Free Tier Limits:**
- 100 requests per day
- 3 requests per minute

## Files

### Frontend
- `index.html` - Main HTML page
- `scanner-script.js` - Scanner initialization and UI
- `barcodelookup-api.js` - BarcodeLookup API integration
- `style.css` - Main styles
- `product-styles.css` - Product display styles

### Backend
- `server.js` - Express proxy server for secure API calls
- `.env` - Environment configuration (API key)
- `package.json` - Node.js dependencies

### Documentation
- `README.md` - This file
- `barcodelookup-api-readme.md` - BarcodeLookup API integration guide
- `server-readme.md` - Proxy server documentation
- `SETUP.md` - Detailed setup instructions (if exists)

### Legacy Files (UPCDatabase)
- `upc-database-lookup.js` - Old UPCDatabase API integration
- `build.js` - Old build script
- `build.ps1` - Old PowerShell build script

## How It Works

### Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────────┐
│   Browser   │ ───> │  Proxy Server    │ ───> │  BarcodeLookup.com  │
│  (Frontend) │      │  (Node.js/Express)│      │      API            │
│             │ <─── │                  │ <─── │                     │
└─────────────┘      └──────────────────┘      └─────────────────────┘
```

### Request Flow

1. **User scans barcode** - HTML5-QRCode library accesses camera and detects barcode
2. **Frontend calls proxy** - `barcodelookup-api.js` sends request to local proxy server
   ```
   GET http://localhost:3000/api/lookup/049000050103
   ```
3. **Proxy authenticates** - `server.js` adds API key and forwards to BarcodeLookup API
   ```
   GET https://api.barcodelookup.com/v3/products?barcode=049000050103&key={API_KEY}
   ```
4. **API returns data** - BarcodeLookup API validates key and returns product data
5. **Proxy forwards response** - Server sends data back to frontend with CORS headers
6. **Display product** - Frontend formats and displays product information

### Why Use a Proxy Server?

✅ **Security** - API key stays on the server, never exposed to browser
✅ **No CORS issues** - Server-to-server communication doesn't have CORS restrictions
✅ **Control** - Add caching, rate limiting, logging in one place
✅ **Flexibility** - Easy to switch APIs or add multiple data sources

## API Endpoints

The proxy server provides these endpoints:

- `GET /` - Server info and available endpoints
- `GET /health` - Health check
- `GET /api/lookup/:barcode` - Lookup product by barcode
- `GET /api/search?q=keyword&page=1` - Search products by keyword

See [server-readme.md](server-readme.md) for complete API documentation.

## Security Notes

✅ **Secure Implementation:**

- API key is stored in `.env` file on the server (never exposed to browser)
- `.gitignore` excludes `.env` and `node_modules/` from version control
- Proxy server validates all requests before forwarding to API
- CORS is properly configured for your domain

⚠️ **Production Recommendations:**

- Change CORS `origin` from `'*'` to your specific domain
- Use HTTPS for all connections
- Implement rate limiting to prevent abuse
- Add request authentication if needed
- Monitor API usage and set up alerts
- Use environment variables for all sensitive configuration

## Browser Support

Works in modern browsers that support:
- getUserMedia API (camera access)
- ES6+ JavaScript
- Fetch API

Tested on:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify all dependencies are installed: `npm install`
- Ensure `.env` file exists with `BARCODE_LOOKUP_API_KEY`
- Check server logs for error messages

### Camera not working
- Grant camera permissions when prompted
- Check browser console for errors
- Try HTTPS (required for camera access on some browsers)
- Ensure you're not already using the camera in another tab

### Product not found
- The barcode may not be in the BarcodeLookup database
- Try a different product (common retail products work best)
- Check that the barcode scanned correctly
- Verify the barcode number in the console logs

### Connection errors
- Ensure the proxy server is running (`node server.js`)
- Check that `PROXY_URL` in `barcodelookup-api.js` matches your server
- Verify your internet connection
- Check server logs for API errors

### API key not working
- Verify your API key is correct in `.env` file
- Check your API key status at BarcodeLookup.com
- Ensure you haven't exceeded rate limits (100/day, 3/minute)
- Restart the server after changing `.env`

### Rate limit exceeded
- Free tier: 100 requests/day, 3 requests/minute
- Wait for the rate limit to reset
- Consider upgrading your BarcodeLookup plan
- Implement caching to reduce API calls

See [server-readme.md](server-readme.md) for more server troubleshooting.

## Development

### Project Structure

```
barcode-scanner-test-html5-qrcode/
├── Frontend
│   ├── index.html                    # Main HTML page
│   ├── scanner-script.js             # Scanner initialization and UI
│   ├── barcodelookup-api.js          # BarcodeLookup API integration
│   ├── style.css                     # Main styles
│   └── product-styles.css            # Product display styles
│
├── Backend
│   ├── server.js                     # Express proxy server
│   ├── package.json                  # Node.js dependencies
│   └── .env                          # Environment configuration (not in git)
│
├── Documentation
│   ├── README.md                     # This file
│   ├── barcodelookup-api-readme.md   # API integration guide
│   └── server-readme.md              # Server documentation
│
└── Legacy (UPCDatabase)
    ├── upc-database-lookup.js        # Old API integration
    ├── build.js                      # Old build script
    └── build.ps1                     # Old PowerShell script
```

### Making Changes

#### Frontend Changes
1. Edit HTML, CSS, or JavaScript files
2. Refresh browser to see changes
3. Check browser console for errors

#### Backend Changes
1. Edit `server.js` or configuration
2. Restart the server: `Ctrl+C` then `node server.js`
3. Check server logs for errors

#### API Integration Changes
1. Edit `barcodelookup-api.js`
2. Update `BARCODE_LOOKUP_CONFIG` if needed
3. Refresh browser to reload the script

### Adding Features

**Caching:** Add Redis or in-memory caching to `server.js`
**Rate Limiting:** Use `express-rate-limit` middleware
**Authentication:** Add API key validation for frontend requests
**Logging:** Implement Winston or Morgan for better logging
**Database:** Store scanned products in MongoDB or PostgreSQL

## Technologies Used

### Frontend
- **HTML5-QRCode** - Barcode/QR code scanning library
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Modern styling with flexbox/grid

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web server framework
- **Axios** - HTTP client for API requests
- **CORS** - Cross-origin resource sharing middleware
- **dotenv** - Environment variable management

### API
- **BarcodeLookup.com** - Product information database

## API Documentation

For detailed API documentation, see:
- [barcodelookup-api-readme.md](barcodelookup-api-readme.md) - Frontend API integration
- [server-readme.md](server-readme.md) - Backend proxy server
- [BarcodeLookup.com API Docs](https://www.barcodelookup.com/api-documentation) - Official API documentation

## Support

- **Scanner issues** - Check browser console for errors
- **Server issues** - Check server logs and [server-readme.md](server-readme.md)
- **API issues** - Visit [BarcodeLookup.com](https://www.barcodelookup.com/)
- **Integration help** - See [barcodelookup-api-readme.md](barcodelookup-api-readme.md)

## Credits

- **Scanner Library:** [HTML5-QRCode](https://github.com/mebjas/html5-qrcode) by Minhaz (Apache License 2.0)
- **Product Data:** [BarcodeLookup.com](https://www.barcodelookup.com/)
- **Backend Framework:** [Express.js](https://expressjs.com/)

## License

This project is for educational and development purposes. Please check the terms of service for:
- [HTML5-QRCode](https://github.com/mebjas/html5-qrcode) - Apache License 2.0
- [BarcodeLookup.com API](https://www.barcodelookup.com/api-documentation) - Check their terms of service

