/**
 * Enhanced Barcode Scanner with Product Lookup Integration
 * This file integrates the barcode scanner with the UPC Item DB API
 */

const resultContainer = document.getElementById('reader-results');
let lastResult, countResults = 0;

function onScanSuccess(decodedText, decodedResult) {
    if (decodedText !== lastResult) {
        ++countResults;
        lastResult = decodedText;
        console.log(`Scan result ${decodedText}`, decodedResult);

        // Show loading state while fetching product data
        resultContainer.innerHTML = `
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
                    displayProductResult(decodedText, decodedResult, result.product);
                } else {
                    // Product not found or error - show basic scan result
                    displayBasicResult(decodedText, decodedResult, result.error);
                }
            }).catch(error => {
                console.error('Product lookup error:', error);
                displayBasicResult(decodedText, decodedResult, 'Failed to fetch product data');
            });
        }).catch(err => {
            console.error("Failed to stop scanner", err);
        });
    }
}

function onScanFailure(error) {
    // This error is called repeatedly while no code is detected - this is NORMAL behavior
    console.log("normal onScanFailure...");
    // Only log specific errors, not the common "No MultiFormat Readers" message
    if (!error.includes("No MultiFormat Readers") && !error.includes("No barcode or QR code detected")) {
        console.warn(`Code scan error = ${error}`);
    }
}

/**
 * Display detailed product information when API lookup succeeds
 */
function displayProductResult(barcode, scanResult, product) {
    const formatted = formatProductData(product);
    
    let html = `
        <div class="success-msg">
            <strong>✅ Product Found!</strong>
        </div>
        
        <div class="product-details">
            ${formatted.images && formatted.images.length > 0 ? 
                `<img src="${formatted.images[0]}" alt="${formatted.title}" class="product-image" 
                     onerror="this.style.display='none'" />` : ''}
            
            <h3 class="product-title">${formatted.title}</h3>
            
            ${formatted.brand ? `<p class="product-brand"><strong>Brand:</strong> ${formatted.brand}</p>` : ''}
            
            <div class="success-barcode">
                <strong>Barcode:</strong> ${barcode}
            </div>
            
            <div class="success-format">
                <strong>Format:</strong> ${scanResult.result.format.formatName || 'Unknown'}
            </div>
            
            ${formatted.description ? `<p class="product-description">${formatted.description}</p>` : ''}
            
            ${formatted.model ? `<p class="product-model"><strong>Model:</strong> ${formatted.model}</p>` : ''}
            
            ${formatted.category ? `<p class="product-category"><strong>Category:</strong> ${formatted.category}</p>` : ''}
            
            ${formatted.details.color ? `<p><strong>Color:</strong> ${formatted.details.color}</p>` : ''}
            ${formatted.details.size ? `<p><strong>Size:</strong> ${formatted.details.size}</p>` : ''}
            ${formatted.details.weight ? `<p><strong>Weight:</strong> ${formatted.details.weight}</p>` : ''}
            
            ${formatted.price.lowest || formatted.price.highest ? `
                <div class="product-price">
                    ${formatted.price.lowest ? 
                        `<p><strong>Lowest Price:</strong> ${formatted.price.currency} $${formatted.price.lowest}</p>` : ''}
                    ${formatted.price.highest ? 
                        `<p><strong>Highest Price:</strong> ${formatted.price.currency} $${formatted.price.highest}</p>` : ''}
                </div>
            ` : ''}
            
            ${formatted.offers && formatted.offers.length > 0 ? `
                <div class="product-offers">
                    <p><strong>Available at ${formatted.offers.length} store(s)</strong></p>
                </div>
            ` : ''}
        </div>
        
        <div style="margin-top: 15px;">
            <button onclick="restartScanner()">Scan Another Code</button>
        </div>
    `;
    
    resultContainer.innerHTML = html;
}

/**
 * Display basic scan result when API lookup fails or product not found
 */
function displayBasicResult(barcode, scanResult, errorMessage) {
    let html = `
        <div class="success-msg">
            <strong>✅ Scan Successful!</strong>
        </div>
        
        <div class="success-barcode">
            <strong>Barcode:</strong> ${barcode}
        </div>
        
        <div class="success-format">
            <strong>Format:</strong> ${scanResult.result.format.formatName || 'Unknown'}
        </div>
        
        ${errorMessage ? `
            <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 5px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                    ℹ️ ${errorMessage}
                </p>
            </div>
        ` : ''}
        
        <div style="margin-top: 15px;">
            <button onclick="restartScanner()">Scan Another Code</button>
        </div>
    `;
    
    resultContainer.innerHTML = html;
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
            aspectRatio: 1.0,
            disableFlip: false,
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true
        },
        /* verbose= */ false);
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    scannerStarted = true;
}

// Function to restart scanner (called from button)
function restartScanner() {
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
            <button onclick="startScanner()" style="background-color: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: 500;">
                Start Scanner
            </button>
        </div>
    `;
});

