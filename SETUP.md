# Barcode Scanner Setup Guide

## Quick Start (No API Key)

1. Open `index.html` in your browser
2. Start scanning barcodes!

The scanner works immediately without an API key, but with limited requests.

## Setup with API Key (Recommended)

### Step 1: Get an API Key

1. Go to [UPCDatabase.org](https://upcdatabase.org/)
2. Create an account
3. Register your application
4. Copy your API key

### Step 2: Configure API Key

You have **4 options** to set your API key:

#### Option 1: Using PowerShell Script (Easiest for Windows)

```powershell
.\build.ps1 "your_api_key_here"
```

#### Option 2: Using .env File (Recommended)

1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```
   UPC_DATABASE_API_KEY=your_api_key_here
   ```

3. Run the build script:
   ```powershell
   .\build.ps1
   ```
   or
   ```bash
   node build.js
   ```

#### Option 3: Using Environment Variable

**Windows PowerShell:**
```powershell
$env:UPC_DATABASE_API_KEY="your_api_key_here"
node build.js
```

**Linux/Mac (Bash):**
```bash
UPC_DATABASE_API_KEY="your_api_key_here" node build.js
```

#### Option 4: Manual Edit (Not Recommended)

1. Open `upc-database-lookup.js`
2. Find: `API_KEY: '{{UPC_DATABASE_API_KEY}}',`
3. Replace with: `API_KEY: 'your_api_key_here',`

### Step 3: Open the App

Open `index.html` in your browser and start scanning!

## Alternative: Manual Configuration

If you prefer not to use environment variables, you can manually edit the API key:

1. Open `upc-database-lookup.js`
2. Find the line: `API_KEY: '{{UPC_DATABASE_API_KEY}}',`
3. Replace `{{UPC_DATABASE_API_KEY}}` with your actual API key:
   ```javascript
   API_KEY: 'your_api_key_here',
   ```

## Using .env File (Optional)

You can also use a `.env` file to store your API key:

### Step 1: Create .env file

Create a file named `.env` in the project root:

```
UPC_DATABASE_API_KEY=your_api_key_here
```

### Step 2: Install dotenv

```bash
npm install dotenv
```

### Step 3: Run build with dotenv

```bash
node -r dotenv/config build.js
```

## Verification

After running the build script, check `upc-database-lookup.js`:

- ✅ If you see `API_KEY: 'abc123...',` - API key is set
- ⚠️ If you see `API_KEY: '{{UPC_DATABASE_API_KEY}}',` - API key is NOT set

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit API keys to version control**
   - The `.gitignore` file is configured to ignore `.env` files
   - Be careful not to commit `upc-database-lookup.js` with your API key

2. **Client-side exposure**
   - Since this is a client-side app, the API key will be visible in the browser
   - Only use API keys that are safe for client-side exposure
   - Consider using a backend proxy for production apps

3. **Regenerate if exposed**
   - If you accidentally commit your API key, regenerate it immediately at UPCDatabase.org

## Troubleshooting

### Build script not working

**Error: `node: command not found`**
- Install Node.js from [nodejs.org](https://nodejs.org/)

**Error: `Cannot find module 'fs'`**
- This shouldn't happen as `fs` is built into Node.js
- Try reinstalling Node.js

### API key not being used

1. Check that the build script ran successfully
2. Verify the environment variable is set: `echo $env:UPC_DATABASE_API_KEY` (PowerShell)
3. Check `upc-database-lookup.js` to see if the placeholder was replaced
4. Clear browser cache and reload

### Still getting limited requests

- Verify your API key is correct
- Check the UPCDatabase.org dashboard for your API usage
- Make sure the build script completed successfully

## Development Workflow

### For Development (without API key)

```bash
# Just open the file
start index.html  # Windows
open index.html   # Mac
xdg-open index.html  # Linux
```

### For Production (with API key)

```bash
# Set environment variable
$env:UPC_DATABASE_API_KEY="your_key"

# Run build
node build.js

# Deploy or open
start index.html
```

### Resetting to Template

If you want to reset the file to use the placeholder:

```bash
# Clear the environment variable
$env:UPC_DATABASE_API_KEY=""

# Run build
node build.js
```

Or manually edit `upc-database-lookup.js` and change:
```javascript
API_KEY: 'your_actual_key',
```
back to:
```javascript
API_KEY: '{{UPC_DATABASE_API_KEY}}',
```

## Additional Resources

- [UPCDatabase.org](https://upcdatabase.org/)
- [API Documentation](https://upcdatabase.org/api)
- [Get API Key](https://upcdatabase.org/register)

