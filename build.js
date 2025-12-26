/**
 * Build script to inject environment variables into JavaScript files
 * 
 * This script reads the UPC_DATABASE_API_KEY environment variable
 * and injects it into the upc-database-lookup.js file
 * 
 * Usage:
 *   node build.js
 * 
 * Environment Variables:
 *   UPC_DATABASE_API_KEY - Your UPCDatabase.org API key
 * 
 * PowerShell:
 *   $env:UPC_DATABASE_API_KEY="your_key_here"; node build.js
 * 
 * Bash:
 *   UPC_DATABASE_API_KEY="your_key_here" node build.js
 */

const fs = require('fs');
const path = require('path');

// Get environment variable
const apiKey = process.env.UPC_DATABASE_API_KEY || '';

// File to process
const sourceFile = path.join(__dirname, 'upc-database-lookup.js');

// Read the source file
let content = fs.readFileSync(sourceFile, 'utf8');

// Replace the placeholder with the actual API key
content = content.replace(/\{\{UPC_DATABASE_API_KEY\}\}/g, apiKey);

// Write back to the same file
fs.writeFileSync(sourceFile, content, 'utf8');

console.log('✅ Build completed successfully!');
console.log('📝 File processed: upc-database-lookup.js');

if (apiKey) {
  console.log('✅ UPC_DATABASE_API_KEY is set');
  console.log(`   Key length: ${apiKey.length} characters`);
} else {
  console.log('⚠️  UPC_DATABASE_API_KEY is not set');
  console.log('   The app will use limited API access without authentication');
  console.log('');
  console.log('To set the API key:');
  console.log('  PowerShell: $env:UPC_DATABASE_API_KEY="your_key_here"; node build.js');
  console.log('  Bash:       UPC_DATABASE_API_KEY="your_key_here" node build.js');
}

console.log('');
console.log('🚀 You can now open index.html in your browser');

