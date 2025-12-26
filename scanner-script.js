const resultContainer = document.getElementById('reader-results');
const productContainer = document.getElementById('product-results');
let lastResult, countResults = 0;

function onScanSuccess(decodedText, decodedResult) {
    if (decodedText !== lastResult) {
        ++countResults;
        lastResult = decodedText;
        console.log(`Scan result ${decodedText}`, decodedResult);

        resultContainer.innerHTML = `
        <div class="success-msg">
        <strong>✅ Scan Successful!</strong>
        </div>
        <div class="success-barcode">
        <strong>Barcode:</strong> ${decodedText}
        </div>
        <div class="success-format">
        <strong>Format:</strong> ${decodedResult.result.format.formatName || 'Unknown'}
        </div>
        `;
        
        // Show loading state while fetching product data
        productContainer.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Looking up product information...</div>
        `;

        // Stop scanning after successful scan
        html5QrcodeScanner.clear().then(() => {
            console.log("Scanner stopped successfully");

            // Fetch product data from API
            lookupProduct(decodedText).then(result => {
                if (result.success) {
                    // Product found - display detailed information
                    displayProductResult(result.product);
                } else {
                    // Product not found or error - show message
                    displayProductError(result.error);
                }

                // Add restart button to scan results
                resultContainer.innerHTML += `<div style="margin-top: 15px;"><button onclick="restartScanner()">Scan Another Code</button></div>`;
            }).catch(error => {
                console.error('Product lookup error:', error);
                displayProductError('Failed to fetch product data');
                resultContainer.innerHTML += `<div style="margin-top: 15px;"><button onclick="restartScanner()">Scan Another Code</button></div>`;
            });
        }).catch(err => {
            console.error("Failed to stop scanner", err);
        });
    }
}

/**
 * Display detailed product information when API lookup succeeds
 */
function displayProductResult(product) {
    const formatted = formatProductData(product);

    let html = `
        <div class="product-details">
            <h3 style="color: #28a745; margin-top: 0;">📦 Product Information</h3>

            ${formatted.images && formatted.images.length > 0 ?
                `<img src="${formatted.images[0]}" alt="${formatted.title}" class="product-image"
                     onerror="this.style.display='none'" />` : ''}

            <h3 class="product-title">${formatted.title}</h3>

            ${formatted.brand ? `<p class="product-brand"><strong>Brand:</strong> ${formatted.brand}</p>` : ''}

            ${formatted.description ? `<p class="product-description">${formatted.description}</p>` : ''}

            ${formatted.model ? `<p class="product-model"><strong>Model:</strong> ${formatted.model}</p>` : ''}

            ${formatted.category ? `<p class="product-category"><strong>Category:</strong> ${formatted.category}</p>` : ''}

            ${formatted.details.color ? `<p><strong>Color:</strong> ${formatted.details.color}</p>` : ''}
            ${formatted.details.size ? `<p><strong>Size:</strong> ${formatted.details.size}</p>` : ''}
            ${formatted.details.weight ? `<p><strong>Weight:</strong> ${formatted.details.weight}</p>` : ''}

            ${formatted.price.lowest || formatted.price.highest ? `
                <div class="product-price">
                    <strong>Price History:</strong>
                    ${formatted.price.lowest ?
                        `<p>Lowest: ${formatted.price.currency} $${formatted.price.lowest}</p>` : ''}
                    ${formatted.price.highest ?
                        `<p>Highest: ${formatted.price.currency} $${formatted.price.highest}</p>` : ''}
                </div>
            ` : ''}

            ${formatted.offers && formatted.offers.length > 0 ? `
                <div class="product-offers">
                    <p><strong>Available at ${formatted.offers.length} store(s)</strong></p>
                </div>
            ` : ''}
        </div>
    `;

    productContainer.innerHTML = html;
}

/**
 * Display error message when product lookup fails
 */
function displayProductError(errorMessage) {
    productContainer.innerHTML = `
        <div class="info-message">
            <p>ℹ️ ${errorMessage || 'Product information not available for this barcode.'}</p>
        </div>
    `;
}

function onScanFailure(error) {
  // handle scan failure, usually better to ignore and keep scanning.
  // This error is called repeatedly while no code is detected - this is NORMAL behavior
  console.log("normal onScanFailure...");
  // Only log specific errors, not the common "No MultiFormat Readers" message
  if (!error.includes("No MultiFormat Readers") && !error.includes("No barcode or QR code detected")) {
    console.warn(`Code scan error = ${error}`);
  }
}

// Define supported formats using numeric values
const formatsToSupport = [
  0,  // QR_CODE
  1,  // AZTEC
  2,  // CODABAR
  3,  // CODE_39
  4,  // CODE_93
  5,  // CODE_128
  6,  // DATA_MATRIX
  7,  // MAXICODE
  8,  // ITF
  9,  // EAN_13
  10, // EAN_8
  11, // PDF_417
  12, // RSS_14
  13, // RSS_EXPANDED
  14, // UPC_A
  15, // UPC_E
  16  // UPC_EAN_EXTENSION
];

// Initialize scanner
let html5QrcodeScanner;
let scannerStarted = false;

function startScanner() {
  if (scannerStarted) {
    console.log("Scanner already started");
    return;
  }

  // Show loading spinner
  resultContainer.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text">Waiting for scan...</div>
  `;

  html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    {
      fps: 10,
      qrbox: {width: 250, height: 250},
      formatsToSupport: formatsToSupport,
      aspectRatio: 1.0,  // Square aspect ratio for better barcode scanning
      disableFlip: false,  // Allow flipped codes
      rememberLastUsedCamera: true,  // Remember camera selection
      showTorchButtonIfSupported: true  // Show flashlight button if available
    },
    /* verbose= */ false);  // Set to false to reduce console noise
  html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  scannerStarted = true;
}

// Function to restart scanner (called from button)
function restartScanner() {
  // Clear product results
  productContainer.innerHTML = '';

  // Show loading spinner again
  resultContainer.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text">Waiting for scan...</div>
  `;
  lastResult = null;
  scannerStarted = false;
  startScanner();
}

// Show start button on page load instead of auto-starting
window.addEventListener('DOMContentLoaded', function() {
  resultContainer.innerHTML = `
    <div style="text-align: center;">
      <p style="margin-bottom: 15px; color: #666;">Click the button below to start scanning</p>
      <button onclick="startScanner()" class="start-scanner-btn">
        Start Scanner
      </button>
    </div>
  `;
});