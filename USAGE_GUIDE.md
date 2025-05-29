# CompliQ Accessibility Simulator - User Guide

This guide provides detailed instructions on how to use the CompliQ Accessibility Simulator Chrome extension to test and improve the accessibility of your websites.

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Color Blindness Simulation](#color-blindness-simulation)
4. [Keyboard Navigation Simulation](#keyboard-navigation-simulation)
5. [Screen Reader Simulation](#screen-reader-simulation)
6. [Low Vision Simulation](#low-vision-simulation)
7. [Accessibility Testing](#accessibility-testing)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store
2. Search for "CompliQ Accessibility Simulator"
3. Click "Add to Chrome"
4. Confirm the installation when prompted

### Manual Installation (Developer Mode)

1. Download or clone the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `chrome-extension` directory
5. The CompliQ extension should now be installed and visible in your toolbar

## Getting Started

After installation, you'll see the CompliQ icon in your Chrome toolbar. To begin:

1. Navigate to the website you want to test
2. Click the CompliQ icon to open the popup interface
3. The popup displays different simulation options and an accessibility score section

## Color Blindness Simulation

Color blindness affects approximately 1 in 12 men and 1 in 200 women globally. This simulation helps you understand how your website appears to users with different types of color vision deficiency.

### How to Use

1. Click on the CompliQ icon to open the popup
2. Toggle the "Color Blindness" switch to ON
3. Select the type of color blindness from the dropdown menu:
   - **Protanopia**: Red-green color blindness (red weakness)
   - **Deuteranopia**: Red-green color blindness (green weakness)
   - **Tritanopia**: Blue-yellow color blindness
   - **Achromatopsia**: Complete color blindness (sees only in grayscale)

### What to Look For

- **Text Contrast**: Can users still read text when placed on colored backgrounds?
- **Information Conveyed by Color**: Is important information conveyed only through color?
- **UI Elements**: Are clickable elements still distinguishable?
- **Charts and Graphs**: Is data visualization still comprehensible?

### Recommended Fixes

- Don't rely solely on color to convey information
- Use patterns, shapes, and text labels in addition to color
- Ensure sufficient contrast between text and background
- Use color palettes that are distinguishable by people with color blindness

## Keyboard Navigation Simulation

Many users with motor disabilities navigate using only the keyboard. This simulation helps you identify focus visibility issues and navigation problems.

### How to Use

1. Click on the CompliQ icon to open the popup
2. Toggle the "Keyboard Navigation" switch to ON
3. Use the Tab key to navigate through the page
4. A visual highlight will appear around the currently focused element

### What to Look For

- **Focus Visibility**: Is it clear which element has focus?
- **Tab Order**: Does the focus move in a logical sequence?
- **Keyboard Traps**: Are there elements that trap keyboard focus?
- **Skip Links**: Can users skip to main content?

### Recommended Fixes

- Ensure all interactive elements have a visible focus state
- Implement logical tab order using proper HTML structure
- Add skip links to bypass repetitive navigation
- Make sure all interactive elements can be accessed by keyboard

## Screen Reader Simulation

Screen reader users rely on semantic HTML and proper ARIA attributes to understand web content. This simulation shows how screen readers interpret your page.

### How to Use

1. Click on the CompliQ icon to open the popup
2. Toggle the "Screen Reader Preview" switch to ON
3. Hover over elements on the page
4. An overlay will show how a screen reader would interpret the element

### What to Look For

- **Missing Alt Text**: Do images have appropriate alternative text?
- **ARIA Roles**: Are roles properly defined for custom UI elements?
- **Labels**: Do form controls have associated labels?
- **Semantic Structure**: Is content organized with proper headings and landmarks?

### Recommended Fixes

- Add descriptive alt text to all meaningful images
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
- Ensure all form controls have associated labels
- Implement proper heading hierarchy (h1-h6)

## Low Vision Simulation

Low vision affects over 246 million people worldwide. This simulation helps you experience how users with visual impairments might see your website.

### How to Use

1. Click on the CompliQ icon to open the popup
2. Toggle the "Low Vision" switch to ON
3. The page will be displayed with blurred vision and enlarged text

### What to Look For

- **Text Size**: Is text still readable when enlarged?
- **Layout**: Does the layout adapt well to zoomed content?
- **Contrast**: Is there sufficient contrast for important elements?
- **Spacing**: Is there adequate spacing between interactive elements?

### Recommended Fixes

- Use relative units (em, rem) for text and layout
- Ensure the site works well at different zoom levels
- Provide sufficient contrast for text and UI elements
- Allow sufficient spacing between clickable elements

## Accessibility Testing

The accessibility testing feature analyzes your page against common accessibility guidelines and provides an overall score.

### How to Use

1. Click on the CompliQ icon to open the popup
2. Click the "Run Tests" button
3. The extension will scan your page and display a score
4. The score indicates how many accessibility checks have passed

### Understanding the Results

- **Score**: Overall accessibility score from 0-100
- **Passed Rules**: Number of accessibility checks that passed
- **Total Rules**: Total number of accessibility checks performed

### Common Issues Detected

- Missing alt text on images
- Insufficient color contrast
- Missing form labels
- Empty links or buttons
- Missing document language
- Missing page title
- Improper heading structure
- Missing skip links

## Troubleshooting

### Simulation Not Working

- Make sure the extension is enabled
- Try refreshing the page
- Check if the website has content security policies that block the extension

### Extension Not Loading

- Check if you're using the latest version of Chrome
- Try disabling and re-enabling the extension
- Reinstall the extension

### Performance Issues

- Disable other extensions that might conflict
- Try simulations one at a time rather than all at once
- Some complex pages may experience performance slowdown with simulations active

## Best Practices

- Test your website throughout the development process, not just at the end
- Use the simulations to educate team members about accessibility issues
- Combine this tool with other accessibility testing methods
- Always test with real assistive technology and actual users with disabilities when possible
- Use the Web Content Accessibility Guidelines (WCAG) as a reference for fixing issues
