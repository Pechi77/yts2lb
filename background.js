chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'checkUrl') {
        fetch(request.url, { method: 'HEAD' })
            .then(response => {
                sendResponse({ exists: response.status === 200 });
            })
            .catch(() => {
                sendResponse({ exists: false });
            });
        return true; // Keep the message channel open for async response
    }
}); 