# CompliQ Accessibility Simulator - Developer Documentation

This document provides technical information about the CompliQ Chrome extension for developers who want to understand, modify, or contribute to the codebase.

## Architecture Overview

The extension follows a standard Chrome extension architecture with these components:

1. **Popup UI**: User interface for controlling simulations
2. **Content Scripts**: Code injected into web pages to apply simulations
3. **Background Service Worker**: Central coordinator that persists across sessions
4. **Storage**: Persistent state management

### Component Interactions

```
+-------------+        +-----------------+        +----------------+
| Popup UI    | <----> | Background      | <----> | Chrome Storage |
| (popup.html)|        | (background.js) |        |                |
+-------------+        +-----------------+        +----------------+
                               ^
                               |
                               v
                       +----------------+
                       | Content Script | -----> Web Page DOM
                       | (content.js)   |
                       +----------------+
```

## File Structure

```
chrome-extension/
├── manifest.json         # Extension configuration
├── background.js         # Background service worker
├── content.js            # Content script injected into pages
├── content.css           # Styles for content script
├── popup.html            # Popup UI
├── README.md             # Main documentation
├── USAGE_GUIDE.md        # User guide
├── DEVELOPERS.md         # This file
├── MANIFEST.md           # Manifest documentation
├── images/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg
├── scripts/              # JavaScript files
│   └── popup.js          # Popup UI logic
└── styles/               # CSS files
    ├── popup.css         # Popup UI styles
    └── colorblind.css    # Color blindness simulation styles
```

## Key Components

### State Management

The extension uses Chrome's storage API to persist state between sessions. The state object structure is:

```javascript
{
  colorBlindness: {
    active: boolean,
    type: string  // "protanopia", "deuteranopia", "tritanopia", "achromatopsia"
  },
  keyboardNavigation: boolean,
  screenReader: boolean,
  lowVision: boolean,
  accessibilityScore: {
    score: number,
    passedRules: number,
    totalRules: number
  }
}
```

### Color Blindness Simulation

The color blindness simulation uses two approaches for maximum compatibility:

1. **SVG Filters**: Applied via CSS using color matrix transformations
2. **CSS Filters**: Applied as a fallback using standard CSS filter properties

The color matrices used for the SVG filters are based on scientific research on color vision deficiency.

### Keyboard Navigation Simulation

This simulation:

1. Listens for `focusin` events on the document
2. Creates a visual highlight around the focused element
3. Updates the highlight position as focus changes

### Screen Reader Simulation

The screen reader simulation:

1. Shows an overlay that displays accessibility information
2. Listens for `mouseover` events on page elements
3. Extracts ARIA roles, labels, and other attributes
4. Determines implicit roles based on HTML semantics

### Low Vision Simulation

This simulation:

1. Applies blur filters to the entire page
2. Increases text size and line spacing
3. Modifies document styles to simulate low vision conditions

### Accessibility Testing

The testing module:

1. Performs a series of accessibility checks on the page
2. Identifies common issues like missing alt text or labels
3. Calculates a score based on passed/failed checks
4. Returns results to be displayed in the popup

## Communication Protocol

The extension components communicate using Chrome's messaging API:

### From Popup to Content Script:

```javascript
chrome.tabs.sendMessage(tabId, {
  action: "updateSimulations",
  state: stateObject,
});
```

### From Content Script to Popup:

```javascript
chrome.runtime.sendMessage(
  {
    action: "runAccessibilityTests",
  },
  function (response) {
    // Handle response
  }
);
```

### From Any Component to Background:

```javascript
chrome.runtime.sendMessage(
  {
    action: "getState",
  },
  function (state) {
    // Use state
  }
);
```

## Adding New Features

### Adding a New Simulation Type

1. Update the state object to include the new simulation
2. Add UI controls to the popup.html
3. Add event listeners in popup.js
4. Implement the simulation functions in content.js
5. Update the updateSimulations() function to handle the new type

### Adding New Accessibility Tests

1. Extend the runAccessibilityTests() function in content.js
2. Increment the totalRules count
3. Add logic to detect the specific issue
4. Update the score calculation

## Testing

The extension should be tested on:

- Different websites with varying complexity
- Different Chrome versions
- Pages with different CSS frameworks
- Sites with custom UI components
- Pages with existing accessibility features

## Browser Compatibility

The extension is designed for Chrome, but could be adapted for:

- Firefox (using browser._ APIs instead of chrome._)
- Edge (compatible with Chrome extensions)
- Safari (would require significant changes)

## Performance Considerations

- SVG filters can be performance-intensive on large pages
- Screen reader simulation can slow down pages with many elements
- Use requestAnimationFrame for smooth animations
- Be mindful of memory usage with large DOM manipulation

## Security Considerations

- The extension runs with elevated privileges
- Avoid executing any code from the page being analyzed
- Sanitize any content before displaying it
- Be careful with innerHTML and DOM manipulation

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Add comprehensive comments
5. Test thoroughly
6. Submit a pull request with detailed description

## License

This project is licensed under the MIT License.
