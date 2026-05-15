(function () {
    console.log("Punjabi NLP Extension Loaded");

    function cleanText(text) {
        if (!text) return "";
        return text
            .replace(/<[^>]*>?/gm, '') // Remove HTML tags just in case
            .replace(/\s+/g, " ")
            .replace(/\n+/g, " ")
            .replace(/\t+/g, " ")
            .replace(/Advertisement/gi, "")
            .replace(/Sponsored/gi, "")
            .trim();
    }

    function getMetaContent(name) {
        const tag = document.querySelector(`meta[name='${name}'], meta[property='${name}']`);
        return tag ? cleanText(tag.content) : "";
    }

    function extractLinks() {
        const anchors = [...document.querySelectorAll("a[href]")];

        const internal = [];
        const external = [];

        anchors.forEach(a => {
            const href = a.href;
            const text = cleanText(a.innerText);

            if (!href || href.startsWith("javascript:")) return;

            const item = {
                text,
                url: href
            };

            try {
                const url = new URL(href);
                if (url.hostname === window.location.hostname) {
                    internal.push(item);
                } else {
                    external.push(item);
                }
            } catch (e) {}
        });

        return {
            internal_links: internal.slice(0, 50), // Cap for payload size
            external_links: external.slice(0, 50),
            internal_link_count: internal.length,
            external_link_count: external.length
        };
    }

    function extractComments() {
        const possibleSelectors = [
            ".comment",
            ".comments-content",
            ".comment-body",
            ".user-comment",
            ".reply-content",
            "[class*='comment']",
            "#comments"
        ];

        let comments = [];

        possibleSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const text = cleanText(el.innerText || el.textContent);
                if (text.length > 10 && text.length < 2000) {
                    comments.push(text);
                }
            });
        });

        // Deduplicate
        comments = [...new Set(comments)];
        return comments;
    }

    function extractArticle() {
        if (typeof Readability === 'undefined') {
            console.error("Readability.js is not loaded.");
            return null;
        }
        const documentClone = document.cloneNode(true);
        const reader = new Readability(documentClone);
        return reader.parse();
    }

    async function processPage() {
        const article = extractArticle();
        
        const payload = {
            metadata: {
                site_name: getMetaContent("og:site_name") || window.location.hostname,
                headline: article ? cleanText(article.title) : document.title,
                author: getMetaContent("author") || getMetaContent("article:author") || (article ? article.byline : "Unknown"),
                url: window.location.href,
                published_time: getMetaContent("article:published_time")
            },
            content: {
                cleaned_text: article ? cleanText(article.textContent) : cleanText(document.body.innerText).substring(0, 5000),
                excerpt: article ? cleanText(article.excerpt) : ""
            },
            comments: extractComments(),
            network: extractLinks()
        };

        return payload;
    }

    // Listen for messages from popup
    browser.runtime.onMessage.addListener((message, sender) => {
        if (message.type === "EXTRACT_DATA") {
            return processPage().then(payload => {
                // Send to background to forward to local backend
                browser.runtime.sendMessage({
                    type: "SEND_TO_BACKEND",
                    payload: payload
                });
                // Return payload directly to the popup.js script
                return { success: true, payload: payload };
            }).catch(err => {
                console.error("Extraction error:", err);
                return { error: err.message };
            });
        }
    });

})();