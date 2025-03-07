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

// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "openInLetterboxd",
        title: "Search in Letterboxd",
        contexts: ["selection"]
    });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openInLetterboxd" && info.selectionText) {
        const searchQuery = encodeURIComponent(info.selectionText.trim());
        const letterboxdSearchUrl = `https://letterboxd.com/search/${searchQuery}/`;
        chrome.tabs.create({ url: letterboxdSearchUrl });
    }
}); 