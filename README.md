# Barcode Scanner with Product Lookup

A web-based barcode scanner that uses your device's camera to scan barcodes and retrieve product information from UPCDatabase.org.

## Features

- 📷 **Camera-based scanning** - Uses HTML5-QRCode library
- 🔍 **Product lookup** - Retrieves product info from UPCDatabase.org API
- 🚀 **Works immediately** - No API key required to start
- 🔑 **API Key Support** - Optional API key for unlimited requests
- 🌐 **CORS Proxy** - Bypasses browser CORS restrictions automatically
- 📱 **Mobile friendly** - Works on phones and tablets

## Quick Start

1. **Open the app**
   ```
   Open index.html in your browser
   ```

2. **Allow camera access** when prompted

3. **Scan a barcode** - Hold it steady for 2-3 seconds

4. **View product info** - Details appear below the scanner

## Setup with API Key

For unlimited requests, get a free API key:

### Method 1: PowerShell Script (Windows)

```powershell
.\build.ps1 "your_api_key_here"
```

### Method 2: .env File

1. Copy `.env.example` to `.env`
2. Add your API key to `.env`
3. Run: `.\build.ps1` or `node build.js`

### Method 3: Environment Variable

```powershell
# PowerShell
$env:UPC_DATABASE_API_KEY="your_key"
node build.js
```

```bash
# Bash
UPC_DATABASE_API_KEY="your_key" node build.js
```

See [SETUP.md](SETUP.md) for detailed instructions.

## Get an API Key

1. Visit [UPCDatabase.org](https://upcdatabase.org/)
2. Create a free account
3. Register your application
4. Copy your API key

## Files

- `index.html` - Main HTML page
- `scanner-script.js` - Scanner initialization and UI
- `upc-database-lookup.js` - API integration with CORS proxy
- `build.js` - Node.js build script to inject API key
- `build.ps1` - PowerShell build script (easier for Windows)
- `.env.example` - Example environment file
- `SETUP.md` - Detailed setup instructions
- `UPC_DATABASE_API_GUIDE.md` - API documentation
- `AUTHENTICATION.md` - Authentication methods guide
- `CORS_SOLUTION.md` - CORS issue explanation and solutions

## How It Works

1. **Scanner** - HTML5-QRCode library accesses your camera
2. **Barcode Detection** - Automatically detects and reads barcodes
3. **CORS Proxy** - Routes request through proxy to bypass browser restrictions
4. **API Lookup** - Fetches product data from UPCDatabase.org API
5. **Display** - Shows product information (title, brand, description, images)

### Request Flow

```
1. User scans barcode
2. App builds API URL with key:
   https://api.upcdatabase.org/product/0012345678905?apikey={key}
3. Request goes through CORS proxy:
   https://api.allorigins.win/raw?url={encoded_api_url}
4. Proxy forwards to UPCDatabase API
5. API validates key and returns product data
6. Proxy adds CORS headers and returns to browser
7. App displays product information
```

**Note:** CORS proxy is required because the UPCDatabase API doesn't support CORS from browsers. See [CORS_SOLUTION.md](CORS_SOLUTION.md) for details.

## Environment Variable

The app uses the `UPC_DATABASE_API_KEY` environment variable:

- **Not set** - Works with limited requests (no authentication)
- **Set** - Unlimited requests with your API key

The build script injects this variable into `upc-database-lookup.js` at build time.

## Security Notes

⚠️ **Important:**

- This is a **client-side app** - API keys are visible in the browser
- Only use API keys that are safe for client-side exposure
- Never commit your API key to version control
- The `.gitignore` file excludes `.env` files
- For production apps, consider using a backend proxy

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

### Camera not working
- Grant camera permissions when prompted
- Check browser console for errors
- Try HTTPS (required for camera access on some browsers)

### Product not found
- The barcode may not be in the database
- Try a different product
- Check that the barcode scanned correctly

### CORS errors
- The app uses a CORS proxy automatically
- If you see CORS errors, the proxy may be down
- Try switching to a different proxy in `upc-database-lookup.js`
- See [CORS_SOLUTION.md](CORS_SOLUTION.md) for details

### API key not working
- Verify the build script ran successfully
- Check `upc-database-lookup.js` for the injected key
- Ensure your API key is valid at UPCDatabase.org

### Slow response
- CORS proxy adds some latency (normal)
- For production, consider using a backend proxy
- See [CORS_SOLUTION.md](CORS_SOLUTION.md) for production solutions

See [SETUP.md](SETUP.md) for more troubleshooting tips.

## Development

### Project Structure

```
barcode-scanner/
├── index.html                  # Main page
├── scanner-script.js           # Scanner logic
├── upc-database-lookup.js      # API integration
├── style.css                   # Styles
├── product-styles.css          # Product display styles
├── build.js                    # Build script (Node.js)
├── build.ps1                   # Build script (PowerShell)
├── .env.example                # Environment template
├── SETUP.md                    # Setup guide
└── UPC_DATABASE_API_GUIDE.md   # API documentation
```

### Making Changes

1. Edit the source files
2. If you changed `upc-database-lookup.js`, make sure to keep the `{{UPC_DATABASE_API_KEY}}` placeholder
3. Run the build script to inject your API key
4. Test in the browser

## License

This project uses:
- [HTML5-QRCode](https://github.com/mebjas/html5-qrcode) - Apache License 2.0
- [UPCDatabase.org API](https://upcdatabase.org/) - Check their terms of service

## Support

- **Scanner issues** - Check browser console for errors
- **API issues** - Visit [UPCDatabase.org](https://upcdatabase.org/)
- **Setup help** - See [SETUP.md](SETUP.md)

## Credits

- Scanner: [HTML5-QRCode](https://github.com/mebjas/html5-qrcode) by Minhaz
- Product Data: [UPCDatabase.org](https://upcdatabase.org/)

