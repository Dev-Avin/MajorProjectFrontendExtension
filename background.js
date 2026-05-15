browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SEND_TO_BACKEND") {
        fetch("http://localhost:8000/api/news", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(message.payload)
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Backend responded with " + res.status);
                }
                return res.json();
            })
            .then(data => {
                console.log("Backend response:", data);
                // Relay response to popup
                browser.runtime.sendMessage({
                    type: "BACKEND_RESPONSE",
                    data: data
                });
            })
            .catch(err => {
                console.error("POST failed:", err);
                // Relay error to popup
                browser.runtime.sendMessage({
                    type: "BACKEND_ERROR",
                    error: err.message
                });
            });
    }
});