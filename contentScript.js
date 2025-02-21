// Utility functions
function getUrlFriendlyTitle(title) {
    return title.toLowerCase()
               .replace(/[^a-z0-9]+/g, '-')
               .replace(/^-+|-+$/g, '');
}

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

// Function to add Letterboxd button on YTS
function addLetterboxdButton() {
    function getMovieTitle() {
        const titleElement = document.querySelector('h1[itemprop="name"]') || document.querySelector('h1');
        return titleElement ? titleElement.textContent.trim() : null;
    }

    function getReleaseYear() {
        const yearElement = document.querySelector('#movie-info h2');
        if (!yearElement) return null;
        
        // Extract just the year using regex
        const yearMatch = yearElement.textContent.match(/\b(19|20)\d{2}\b/);
        return yearMatch ? yearMatch[0] : null;
    }

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

    const link = createLetterboxdLink();
    
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

    // Find the movie info container
    const movieInfo = document.querySelector('#movie-info');
    if (!movieInfo) {
        console.log('Movie info container not found');
        return;
    }

    // Find the subtitle button
    const subtitleButton = movieInfo.querySelector('a[href*="subtitles"]');
    if (subtitleButton) {
        // Insert after the subtitle button
        subtitleButton.insertAdjacentElement('afterend', link);
        link.style.marginLeft = '10px';
        return;
    }

    // Fallback: Add to movie-info if subtitle button not found
    movieInfo.appendChild(link);
    link.style.margin = '10px 0';
    link.style.display = 'inline-flex';
    link.style.alignItems = 'center';
    link.style.justifyContent = 'center';
}

// Function to add YTS button on Letterboxd
function addYTSButton() {
    function getMovieInfo() {
        const title = document.querySelector('.headline-1.filmtitle .name')?.textContent.trim();
        const year = document.querySelector('.releaseyear a')?.textContent.trim();
        console.log('Movie Info:', { title, year });
        return { title, year };
    }

    async function getYTSUrl(title, year) {
        const urlFriendlyTitle = title.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-')
            .trim();
        
        const directUrl = `https://yts.mx/movies/${urlFriendlyTitle}-${year}`;
        
        // Check if movie exists on YTS
        const exists = await checkUrl(directUrl);
        console.log('YTS URL exists:', exists, directUrl);
        
        return exists ? directUrl : null;
    }

    // Find the tab list
    const tabList = document.querySelector('#tabbed-content header ul');
    if (!tabList) {
        console.log('Tab list not found');
        return;
    }

    // Create new tab list item
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = 'javascript:void(0);';
    link.dataset.id = 'yts';
    link.textContent = 'YTS';
    li.appendChild(link);

    // Initially disable the link
    link.style.opacity = '0.5';
    link.style.cursor = 'default';
    link.title = 'Checking YTS availability...';

    // Add click handler
    link.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (link.dataset.available === 'true') {
            const { title, year } = getMovieInfo();
            if (title && year) {
                const ytsUrl = await getYTSUrl(title, year);
                if (ytsUrl) {
                    window.open(ytsUrl, '_blank');
                }
            }
        }
    });

    // Add to tab list
    tabList.appendChild(li);

    // Check availability and update link state
    (async () => {
        const { title, year } = getMovieInfo();
        if (title && year) {
            const ytsUrl = await getYTSUrl(title, year);
            if (ytsUrl) {
                // Movie exists on YTS
                link.style.opacity = '1';
                link.style.cursor = 'pointer';
                link.title = 'Open in YTS';
                link.dataset.available = 'true';
            } else {
                // Movie not available
                link.textContent = 'Not on YTS';
                link.title = 'Movie not available on YTS';
                link.style.opacity = '0.5';
                link.dataset.available = 'false';
            }
        }
    })();
}

// Helper function to create Letterboxd link with icon
function createLetterboxdLink() {
    const link = document.createElement('a');
    link.rel = 'nofollow';
    link.target = '_blank';
    link.className = 'button';  // Using YTS's button class
    link.href = 'javascript:void(0);';
    link.title = 'Open in Letterboxd';
    
    // Create icon span
    const iconSpan = document.createElement('span');
    const letterboxdIcon = `
        <svg width="16" height="16" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <g fill="#6AC045">  <!-- Changed to YTS green color -->
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
    iconSpan.style.marginRight = '8px';
    iconSpan.style.verticalAlign = 'middle';
    
    link.appendChild(iconSpan);
    link.appendChild(document.createTextNode('Open in Letterboxd'));
    
    return link;
}

// Helper function to create YTS link with icon
function createYTSLink() {
    const link = document.createElement('a');
    link.className = 'button';
    link.style.marginLeft = '10px';
    link.title = 'Search on YTS';
    
    // Add YTS icon/text here
    link.textContent = 'Search on YTS';
    
    return link;
}

// Main execution
function init() {
    const currentUrl = window.location.href;
    if (currentUrl.includes('yts.mx/movies/')) {
        addLetterboxdButton();
    } else if (currentUrl.includes('letterboxd.com/film/')) {
        addYTSButton();
    }
}

// Run the script when the page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
  
