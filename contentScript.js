function addButton() {
    // Function to get movie title from the page
    function getMovieTitle() {
        const titleElement = document.querySelector('h1[itemprop="name"]') || document.querySelector('h1');
        return titleElement ? titleElement.textContent.trim() : null;
    }

    // Function to get movie release year
    function getReleaseYear() {
        const yearElement = document.querySelector('#movie-info h2');
        return yearElement ? yearElement.textContent.trim() : null;
    }

    // Function to create URL-friendly title
    function getUrlFriendlyTitle(title) {
        return title.toLowerCase()
                   .replace(/[^a-z0-9]+/g, '-')
                   .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    // Function to check URL using background script
    async function checkUrl(url) {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'checkUrl',
                url: url
            });
            return response.exists;
        } catch (error) {
            return false;
        }
    }

    // Function to get working Letterboxd URL
    async function getLetterboxdUrl(title, year) {
        const urlFriendlyTitle = getUrlFriendlyTitle(title);
        
        // Try URL with year first
        const urlWithYear = `https://letterboxd.com/film/${urlFriendlyTitle}-${year}/`;
        if (await checkUrl(urlWithYear)) {
            return urlWithYear;
        }

        // Try URL without year
        const urlWithoutYear = `https://letterboxd.com/film/${urlFriendlyTitle}/`;
        if (await checkUrl(urlWithoutYear)) {
            return urlWithoutYear;
        }

        // Fallback to search URL
        return `https://letterboxd.com/search/${encodeURIComponent(title)}/`;
    }

    const link = document.createElement('a');
    // Remove the text content as we'll add it after the icon
    link.rel = 'nofollow';
    link.target = '_blank';
    link.className = 'button';
    link.style.width = '180px';
    link.style.cursor = 'pointer';
    link.style.marginLeft = '10px';
    link.title = 'Open in Letterboxd';
    
    // Create icon span
    const iconSpan = document.createElement('span');
    const letterboxdIcon = `
        <svg width="16" height="16" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <g fill="#00A800">
                <path d="M31.45 55.9h78.86v388.2H31.45z"/>
                <path d="M210.9 55.9h78.86v388.2H210.9z"/>
                <path d="M389.7 55.9h78.86v388.2H389.7z"/>
            </g>
        </svg>
    `;
    const encodedIcon = btoa(letterboxdIcon);
    iconSpan.style.backgroundImage = `url("data:image/svg+xml;base64,${encodedIcon}")`;
    iconSpan.style.backgroundSize = 'contain';
    iconSpan.style.backgroundRepeat = 'no-repeat';
    iconSpan.style.display = 'inline-block';
    iconSpan.style.width = '16px';
    iconSpan.style.height = '16px';
    iconSpan.style.marginRight = '5px';
    iconSpan.style.verticalAlign = 'middle';
    
    // Add icon first
    link.appendChild(iconSpan);
    
    // Then add text
    const textNode = document.createTextNode('Open in Letterboxd');
    link.appendChild(textNode);

    // Handle click
    link.onclick = async function(e) {
        e.preventDefault();
        const movieTitle = getMovieTitle();
        const releaseYear = getReleaseYear();
        if (movieTitle && releaseYear) {
            const letterboxdUrl = await getLetterboxdUrl(movieTitle, releaseYear);
            window.open(letterboxdUrl, '_blank');
        }
    };

    // Find the correct target paragraph
    const targetParagraph = document.querySelector('p.hidden-md.hidden-lg');
    if (targetParagraph) {
        const subtitleButton = targetParagraph.querySelector('a[href*="yifysubtitles"]');
        if (subtitleButton) {
            subtitleButton.insertAdjacentElement('afterend', link);
        } else {
            targetParagraph.appendChild(link);
        }
    }
}

// Run the script when the page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addButton);
} else {
    addButton();
}
  
