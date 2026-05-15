# NLP Sentinel - Punjabi Fake News Extension

NLP Sentinel is a browser extension designed to extract, parse, and analyze Punjabi news articles using deep learning and Natural Language Processing. It bridges the gap between web articles and a dedicated Python machine learning backend to classify news as **FAKE** or **REAL**.

## Features

- **Automated Data Extraction**: Uses Mozilla's Readability.js to intelligently strip ads and navigation, extracting only the core news content.
- **Deep Metadata Parsing**: Automatically scrapes the website name, headline, author, and internal/external linking network from the webpage.
- **Real-Time ML Pipeline Integration**: Pings a local Python inference backend, displaying simulated processing steps for text preprocessing, feature extraction, classical ML models, and transformer embeddings.
- **Techniques Breakdown**: Receives and dynamically displays individual confidence scores for 13 distinct NLP techniques (e.g., TF-IDF Vectorization, Sentiment Analysis, Logistic Regression, Fine-tuned Punjabi BERT).
- **Raw Payload Inspection**: Transparently displays the exact JSON payload sent to the backend for debugging and transparency.

## Installation

### Firefox
1. Open Firefox and navigate to `about:debugging`.
2. Click on **This Firefox** in the left sidebar.
3. Click the **Load Temporary Add-on...** button.
4. Select the `manifest.json` file inside this extension's directory.

### Chrome / Edge / Brave
1. Open your browser and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** in the top left corner.
4. Select the `punjabi-news-extension` directory.

## Usage

1. **Start the Backend Server**: Before using the extension, ensure that your Python NLP backend is running locally.
   ```bash
   python3 backend.py
   ```
2. **Navigate to a News Article**: Open any Punjabi news article (e.g., on Ajit Jalandhar).
3. **Analyze**: Click the **NLP Sentinel** extension icon in your browser toolbar, then click **Analyze Page**.
4. **View Results**: The extension will display simulated enterprise-level extraction logs before presenting the final prediction, confidence score, and techniques breakdown.

## Files Structure

- `manifest.json`: Extension configuration and permissions.
- `popup.html` / `popup.css`: The UI of the extension popup.
- `popup.js`: Handles user interaction and triggers the content script.
- `content.js`: Injected into the active tab to extract DOM data and article text.
- `background.js`: Acts as a secure proxy to relay the extracted payload to the local `http://localhost:8000` API.
- `readability.js`: Mozilla's library for parsing clean article text from noisy web pages.

## Technologies

- Vanilla HTML/CSS/JS (No frameworks)
- Browser Extensions API (Manifest V3 compatible)
- Mozilla Readability.js
