const resultContainer = document.getElementById('reader-results');
let lastResult, countResults = 0;

function onScanSuccess(decodedText, decodedResult) {
    if (decodedText !== lastResult) {
        ++countResults;
        lastResult = decodedText;
        // Handle on success condition with the decoded message.
        console.log(`Scan result ${decodedText}`, decodedResult);

        // Display the scanned result
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

        // Stop scanning after successful scan
        html5QrcodeScanner.clear().then(() => {
            console.log("Scanner stopped successfully");
            // Add button to restart scanning
            resultContainer.innerHTML += `<div style="margin-top: 15px;"><button onclick="restartScanner()">Scan Another Code</button></div>`;
        }).catch(err => {
            console.error("Failed to stop scanner", err);
        });
    }
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

function initScanner() {
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
}

// Function to restart scanner (called from button)
function restartScanner() {
  // Show loading spinner again
  resultContainer.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text">Waiting for scan...</div>
  `;
  lastResult = null;
  initScanner();
}

// Start scanner on page load
initScanner();