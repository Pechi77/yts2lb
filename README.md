# YTS-Letterboxd Bridge

A browser extension that enhances your movie browsing experience by adding a direct link to Letterboxd from YTS movie pages.

## Features

- Adds a "Open in Letterboxd" button to YTS movie pages
- Smart URL handling:
- Zero configuration needed

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Visit any movie page on YTS (e.g., https://yts.mx/movies/...)
2. Look for the green "Open in Letterboxd" button next to the subtitle download button
3. Click to open the movie in Letterboxd in a new tab

## Screenshots

[Add a screenshot showing the Letterboxd button on YTS page]

## Technical Details

- Uses Chrome's Manifest V3
- Checks Letterboxd URL existence before redirecting
- Handles special characters in movie titles
- Maintains consistent styling with YTS

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) 