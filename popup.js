document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnText = analyzeBtn.querySelector('.btn-text');
    const spinner = analyzeBtn.querySelector('.spinner');

    const statusContainer = document.getElementById('status-container');
    const statusText = document.getElementById('status-text');

    const resultContainer = document.getElementById('result-container');
    const predictionTitle = document.getElementById('prediction-title');
    const confidenceValue = document.getElementById('confidence-value');

    const errorContainer = document.getElementById('error-container');
    const errorText = document.getElementById('error-text');

    const loadingStates = [
        "Extracting content...",
        "Cleaning HTML tags...",
        "Connecting to NLP backend...",
        "Tokenizing text...",
        "Running inference..."
    ];

    analyzeBtn.addEventListener('click', async () => {
        // Reset UI
        resultContainer.classList.add('hidden');
        errorContainer.classList.add('hidden');
        document.getElementById('data-container').classList.add('hidden');
        document.getElementById('raw-json-container').classList.add('hidden');
        document.getElementById('techniques-container').classList.add('hidden');
        document.getElementById('close-btn').classList.add('hidden');
        resultContainer.classList.remove('fake', 'real');

        // Show loading state
        btnText.textContent = "Analyzing...";
        spinner.classList.remove('hidden');
        analyzeBtn.disabled = true;
        statusContainer.classList.remove('hidden');

        // Cycle through loading states to simulate progress
        let stateIndex = 0;
        const interval = setInterval(() => {
            if (stateIndex < loadingStates.length) {
                statusText.textContent = loadingStates[stateIndex];
                stateIndex++;
            }
        }, 800);

        try {
            // Get current active tab
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const activeTab = tabs[0];

            if (!activeTab) {
                throw new Error("Cannot access active tab.");
            }

            // Send message to content script to extract
            const response = await browser.tabs.sendMessage(activeTab.id, { type: "EXTRACT_DATA" });

            if (!response || response.error) {
                throw new Error(response?.error || "Failed to extract data from page.");
            }

            // Populate data UI
            if (response.payload) {
                const payload = response.payload;
                document.getElementById('meta-site').textContent = payload.metadata.site_name || "N/A";
                document.getElementById('meta-site').title = payload.metadata.site_name || "N/A";

                document.getElementById('meta-headline').textContent = payload.metadata.headline || "N/A";
                document.getElementById('meta-headline').title = payload.metadata.headline || "N/A";

                document.getElementById('meta-author').textContent = payload.metadata.author || "N/A";
                document.getElementById('meta-author').title = payload.metadata.author || "N/A";

                document.getElementById('comments-count').textContent = payload.comments ? payload.comments.length : 0;
                document.getElementById('internal-links-count').textContent = payload.network ? payload.network.internal_link_count : 0;
                document.getElementById('external-links-count').textContent = payload.network ? payload.network.external_link_count : 0;

                document.getElementById('data-container').classList.remove('hidden');

                // Show raw JSON below
                document.getElementById('raw-json-text').textContent = JSON.stringify(payload, null, 2);
                document.getElementById('raw-json-container').classList.remove('hidden');
            }

        } catch (err) {
            clearInterval(interval);
            showError(err.message);
        }
    });

    // Listen for backend response relayed from background.js
    browser.runtime.onMessage.addListener((message) => {
        if (message.type === "BACKEND_RESPONSE") {
            if (message.data.status === "error") {
                showError(message.data.message || "Backend error");
            } else {
                showResult(message.data);
            }
        } else if (message.type === "BACKEND_ERROR") {
            showError("Could not connect to localhost:8000. Is the backend running?");
        }
    });

    function showResult(data) {
        // Hide loading states
        statusContainer.classList.add('hidden');
        analyzeBtn.disabled = false;
        btnText.textContent = "Analyze Again";
        spinner.classList.add('hidden');

        // Show result
        resultContainer.classList.remove('hidden');

        predictionTitle.textContent = data.prediction;
        confidenceValue.textContent = `${Math.round(data.confidence * 100)}%`;

        if (data.prediction.toUpperCase() === "FAKE") {
            resultContainer.classList.add('fake');
        } else {
            resultContainer.classList.add('real');
        }

        // Show Techniques Breakdown
        if (data.techniques_breakdown) {
            const techniquesList = document.getElementById('techniques-list');
            techniquesList.innerHTML = ''; // clear previous

            for (const [technique, score] of Object.entries(data.techniques_breakdown)) {
                const item = document.createElement('div');
                item.className = 'technique-item';

                const nameSpan = document.createElement('span');
                nameSpan.className = 'technique-name';
                nameSpan.textContent = technique;

                const scoreSpan = document.createElement('span');
                scoreSpan.className = 'technique-score';
                scoreSpan.textContent = `${Math.round(score * 100)}%`;

                item.appendChild(nameSpan);
                item.appendChild(scoreSpan);
                techniquesList.appendChild(item);
            }
            document.getElementById('techniques-container').classList.remove('hidden');
        }

        // Show Close Button
        document.getElementById('close-btn').classList.remove('hidden');
    }

    // Handle Close Button
    document.getElementById('close-btn').addEventListener('click', () => {
        window.close();
    });

    function showError(msg) {
        statusContainer.classList.add('hidden');
        analyzeBtn.disabled = false;
        btnText.textContent = "Analyze Page";
        spinner.classList.add('hidden');

        errorContainer.classList.remove('hidden');
        errorText.textContent = msg;
    }
});
