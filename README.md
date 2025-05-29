# CompliQ - Accessibility Simulator Chrome Extension

A powerful Chrome extension that helps developers and designers visualize and test web accessibility issues in real-time.

## Features

### Color Blindness Simulation

Visualize how your website appears to users with different types of color blindness:

- **Protanopia** (red-green color blindness, red weakness)
- **Deuteranopia** (red-green color blindness, green weakness)
- **Tritanopia** (blue-yellow color blindness)
- **Achromatopsia** (complete color blindness, monochromacy)

### Keyboard Navigation Highlight

- Highlights the currently focused element when navigating with the keyboard
- Helps identify focus visibility issues that affect keyboard-only users
- Instantly spot elements with poor focus states

### Screen Reader Preview

- Shows how screen readers interpret different elements on the page
- Displays information about ARIA roles, labels, and properties
- Identifies elements with missing accessibility attributes

### Low Vision Simulation

- Simulates how users with visual impairments see your website
- Helps identify text size, contrast, and readability issues
- Tests content legibility under different visual conditions

### Accessibility Testing

- Automatically checks for common accessibility issues
- Generates an accessibility score based on WCAG guidelines
- Provides actionable feedback to improve accessibility

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store (link will be added when published)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `chrome-extension` directory
5. The CompliQ extension should now be installed and visible in your toolbar

## Usage

### Basic Usage

1. Click on the CompliQ icon in your Chrome toolbar to open the popup
2. Select a simulation type by toggling the corresponding switch
3. Configure specific simulation options if available
4. View the website with the selected accessibility simulation applied
5. Click "Run Tests" to analyze the current page for accessibility issues
6. Use "Reset All" to turn off all simulations

### Color Blindness Simulation

1. Toggle "Color Blindness" on
2. Select the type of color blindness from the dropdown menu
3. The webpage colors will automatically update to simulate the selected condition

### Keyboard Navigation

1. Toggle "Keyboard Navigation" on
2. Use the Tab key to navigate through focusable elements on the page
3. A visual highlight will appear around the currently focused element
4. This helps identify elements with poor focus visibility

### Screen Reader Preview

1. Toggle "Screen Reader Preview" on
2. Hover over elements on the page
3. An overlay will show how a screen reader would interpret that element
4. Look for missing labels, roles, or descriptions

### Low Vision Simulation

1. Toggle "Low Vision" on
2. The page will be rendered with blurred vision and larger text
3. This simulates how users with low vision might experience your website

### Accessibility Testing

1. Click the "Run Tests" button
2. The extension will scan the page for common accessibility issues
3. An accessibility score will be displayed
4. Review the results to identify areas for improvement

## Technical Details

### File Structure

- `manifest.json` - Extension configuration
- `background.js` - Background service worker for extension functionality
- `content.js` - Content script injected into web pages
- `content.css` - Styles for the content script
- `popup.html` - UI for the extension popup
- `scripts/popup.js` - JavaScript for the popup interface
- `styles/popup.css` - Styles for the popup interface
- `styles/colorblind.css` - CSS filters for color blindness simulation
- `images/` - Extension icons and assets

### Technologies Used

- **JavaScript** - Core programming language
- **Chrome Extension API** - For browser integration
- **SVG Filters** - For color blindness simulation
- **CSS Filters** - For visual impairment simulation

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgements

- Based on the CompliQ web application by [RgnDunes](https://github.com/RgnDunes/CompliQ)
- Color blindness simulation matrices from research on color vision deficiency
- Inspired by the need for better accessibility testing tools for developers
