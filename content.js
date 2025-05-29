/**
 * CompliQ Accessibility Simulator - Content Script
 *
 * This content script is injected into web pages and provides accessibility simulation features:
 * - Color blindness simulation using SVG filters and CSS
 * - Keyboard navigation highlighting to visualize focus states
 * - Screen reader preview to demonstrate screen reader output
 * - Low vision simulation for visual impairment testing
 * - Accessibility testing and reporting
 *
 * The script receives commands from the popup UI via Chrome messaging API
 * and applies simulations to the current page.
 */

// Initialize main variables
let simulationState = {
  colorBlindness: {
    active: false,
    type: "protanopia",
  },
  keyboardNavigation: false,
  screenReader: false,
  lowVision: false,
};

// Elements and overlays
let colorBlindnessOverlay = null;
let keyboardNavigationOverlay = null;
let screenReaderOverlay = null;
let lowVisionOverlay = null;
let focusedElement = null;

// Color blindness simulation using SVG filters
const colorBlindnessFilters = {
  protanopia: `
    <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; height: 0;">
      <filter id="protanopia">
        <feColorMatrix type="matrix" 
          values="0.567, 0.433, 0, 0, 0
                  0.558, 0.442, 0, 0, 0
                  0, 0.242, 0.758, 0, 0
                  0, 0, 0, 1, 0"/>
      </filter>
    </svg>
  `,
  deuteranopia: `
    <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; height: 0;">
      <filter id="deuteranopia">
        <feColorMatrix type="matrix" 
          values="0.625, 0.375, 0, 0, 0
                  0.7, 0.3, 0, 0, 0
                  0, 0.3, 0.7, 0, 0
                  0, 0, 0, 1, 0"/>
      </filter>
    </svg>
  `,
  tritanopia: `
    <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; height: 0;">
      <filter id="tritanopia">
        <feColorMatrix type="matrix" 
          values="0.95, 0.05, 0, 0, 0
                  0, 0.433, 0.567, 0, 0
                  0, 0.475, 0.525, 0, 0
                  0, 0, 0, 1, 0"/>
      </filter>
    </svg>
  `,
  achromatopsia: `
    <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; height: 0;">
      <filter id="achromatopsia">
        <feColorMatrix type="matrix" 
          values="0.299, 0.587, 0.114, 0, 0
                  0.299, 0.587, 0.114, 0, 0
                  0.299, 0.587, 0.114, 0, 0
                  0, 0, 0, 1, 0"/>
      </filter>
    </svg>
  `,
};

// CSS filters for color blindness (fallback approach)
const cssColorFilters = {
  protanopia:
    "grayscale(0.5) sepia(0.2) contrast(0.9) saturate(0.8) hue-rotate(350deg)",
  deuteranopia:
    "grayscale(0.5) sepia(0.2) contrast(0.9) saturate(0.8) hue-rotate(20deg)",
  tritanopia:
    "grayscale(0.5) sepia(0.1) contrast(1.0) saturate(0.9) hue-rotate(150deg)",
  achromatopsia: "grayscale(1.0)",
};

/**
 * Applies color blindness simulation to the current page
 * Uses both SVG filters and CSS filters for maximum browser compatibility
 * This creates a visual overlay that simulates how people with different
 * types of color blindness see the web page
 */
function applyColorBlindnessSimulation() {
  // Remove any existing overlay first to prevent duplicate filters
  removeColorBlindnessSimulation();

  // Create SVG filter element if it doesn't exist
  let filterContainer = document.querySelector(`#compliq-filter-container`);
  if (!filterContainer) {
    filterContainer = document.createElement("div");
    filterContainer.id = "compliq-filter-container";
    filterContainer.innerHTML =
      colorBlindnessFilters[simulationState.colorBlindness.type];
    document.body.appendChild(filterContainer);
  } else {
    // Update existing filter container
    filterContainer.innerHTML =
      colorBlindnessFilters[simulationState.colorBlindness.type];
  }

  // Apply the CSS class to the html element
  document.documentElement.classList.add(
    `compliq-${simulationState.colorBlindness.type}`
  );

  // Create the style element if it doesn't exist
  let style = document.getElementById("compliq-colorblind-styles");
  if (!style) {
    style = document.createElement("style");
    style.id = "compliq-colorblind-styles";
    style.textContent = `
      .compliq-protanopia {
        filter: url(#protanopia);
        -webkit-filter: grayscale(0.5) sepia(0.2) contrast(0.9) saturate(0.8) hue-rotate(350deg);
        filter: grayscale(0.5) sepia(0.2) contrast(0.9) saturate(0.8) hue-rotate(350deg);
      }
      
      .compliq-deuteranopia {
        filter: url(#deuteranopia);
        -webkit-filter: grayscale(0.5) sepia(0.2) contrast(0.9) saturate(0.8) hue-rotate(20deg);
        filter: grayscale(0.5) sepia(0.2) contrast(0.9) saturate(0.8) hue-rotate(20deg);
      }
      
      .compliq-tritanopia {
        filter: url(#tritanopia);
        -webkit-filter: grayscale(0.5) sepia(0.1) contrast(1.0) saturate(0.9) hue-rotate(150deg);
        filter: grayscale(0.5) sepia(0.1) contrast(1.0) saturate(0.9) hue-rotate(150deg);
      }
      
      .compliq-achromatopsia {
        filter: url(#achromatopsia);
        -webkit-filter: grayscale(1.0);
        filter: grayscale(1.0);
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Removes color blindness simulation from the page
 * Cleans up DOM elements and resets page appearance
 */
function removeColorBlindnessSimulation() {
  // Remove the class from the html element
  document.documentElement.classList.remove(
    "compliq-protanopia",
    "compliq-deuteranopia",
    "compliq-tritanopia",
    "compliq-achromatopsia",
    "compliq-normal"
  );

  // Remove the overlay
  if (colorBlindnessOverlay) {
    if (colorBlindnessOverlay.parentNode) {
      colorBlindnessOverlay.parentNode.removeChild(colorBlindnessOverlay);
    }
    colorBlindnessOverlay = null;
  }

  // Remove the style element
  const style = document.getElementById("compliq-colorblind-style");
  if (style && style.parentNode) {
    style.parentNode.removeChild(style);
  }

  // Reset document styles
  document.documentElement.style.isolation = "";
  document.documentElement.style.filter = "";
}

/**
 * Applies keyboard navigation simulation
 * Creates a visual highlight around the currently focused element
 * Helps identify focus visibility issues for keyboard-only users
 */
function applyKeyboardNavigationSimulation() {
  if (!keyboardNavigationOverlay) {
    // Create the overlay container
    keyboardNavigationOverlay = document.createElement("div");
    keyboardNavigationOverlay.id = "compliq-keyboard-navigation-overlay";
    document.body.appendChild(keyboardNavigationOverlay);

    // Add event listeners to track focus
    document.addEventListener("focusin", highlightFocusedElement);

    // Style for focused elements
    const style = document.createElement("style");
    style.textContent = `
      .compliq-focus-highlight {
        position: absolute;
        border: 3px solid #3182ce !important;
        background-color: rgba(49, 130, 206, 0.1) !important;
        border-radius: 3px !important;
        z-index: 2147483646 !important;
        pointer-events: none !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 0 0 2px white, 0 0 0 4px #3182ce !important;
      }
    `;
    document.head.appendChild(style);

    // Initial focus highlight (if an element is already focused)
    if (document.activeElement && document.activeElement !== document.body) {
      highlightFocusedElement({ target: document.activeElement });
    }
  } else {
    keyboardNavigationOverlay.style.display = "block";

    // Re-add event listeners if needed
    document.removeEventListener("focusin", highlightFocusedElement);
    document.addEventListener("focusin", highlightFocusedElement);
  }
}

/**
 * Event handler for highlighting focused elements
 * Shows a visual indicator around the element that currently has keyboard focus
 * @param {FocusEvent} event - The focus event object
 */
function highlightFocusedElement(event) {
  const target = event.target;

  // Skip body and html elements
  if (target === document.body || target === document.documentElement) {
    return;
  }

  const rect = target.getBoundingClientRect();

  if (!focusedElement) {
    focusedElement = document.createElement("div");
    focusedElement.className = "compliq-focus-highlight";
    keyboardNavigationOverlay.appendChild(focusedElement);
  }

  // Position and size the highlight element
  focusedElement.style.left = `${window.scrollX + rect.left - 5}px`;
  focusedElement.style.top = `${window.scrollY + rect.top - 5}px`;
  focusedElement.style.width = `${rect.width + 10}px`;
  focusedElement.style.height = `${rect.height + 10}px`;
  focusedElement.style.display = "block";
}

/**
 * Removes keyboard navigation simulation
 * Cleans up event listeners and DOM elements
 */
function removeKeyboardNavigationSimulation() {
  if (keyboardNavigationOverlay) {
    keyboardNavigationOverlay.style.display = "none";
    document.removeEventListener("focusin", highlightFocusedElement);
    if (focusedElement) {
      focusedElement.style.display = "none";
    }
  }
}

/**
 * Applies screen reader simulation
 * Creates an overlay that shows how screen readers interpret page elements
 * Displays ARIA roles, labels, and other accessibility properties
 */
function applyScreenReaderSimulation() {
  if (!screenReaderOverlay) {
    // Create overlay container
    screenReaderOverlay = document.createElement("div");
    screenReaderOverlay.id = "compliq-screen-reader-overlay";
    screenReaderOverlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 200px;
      background: #2d3748;
      color: white;
      padding: 15px;
      font-family: monospace;
      border-radius: 5px;
      z-index: 2147483647;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    // Add content
    screenReaderOverlay.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <strong>Screen Reader Preview</strong>
        <button id="compliq-sr-minimize" style="background: none; border: none; color: white; cursor: pointer; font-size: 14px;">-</button>
      </div>
      <div id="compliq-sr-content">
        <p>Hover over elements to see how a screen reader would interpret them.</p>
      </div>
    `;

    document.body.appendChild(screenReaderOverlay);

    // Add event listeners
    document.addEventListener("mouseover", showScreenReaderInfo);

    // Minimize button functionality
    document
      .getElementById("compliq-sr-minimize")
      .addEventListener("click", () => {
        const content = document.getElementById("compliq-sr-content");
        if (content.style.display === "none") {
          content.style.display = "block";
          document.getElementById("compliq-sr-minimize").textContent = "-";
        } else {
          content.style.display = "none";
          document.getElementById("compliq-sr-minimize").textContent = "+";
        }
      });
  } else {
    screenReaderOverlay.style.display = "block";
    document.addEventListener("mouseover", showScreenReaderInfo);
  }
}

/**
 * Shows screen reader information for the hovered element
 * Displays accessibility attributes like roles, labels, and states
 * @param {MouseEvent} event - The mouse event object
 */
function showScreenReaderInfo(event) {
  const target = event.target;
  const srContent = document.getElementById("compliq-sr-content");

  if (
    !srContent ||
    target === screenReaderOverlay ||
    target.closest("#compliq-screen-reader-overlay")
  ) {
    return;
  }

  // Get accessibility properties
  const role = target.getAttribute("role") || getImplicitRole(target);
  const label =
    target.getAttribute("aria-label") ||
    target.getAttribute("alt") ||
    target.getAttribute("title") ||
    (target.tagName === "INPUT" ? target.getAttribute("placeholder") : "");
  const hidden = target.getAttribute("aria-hidden") === "true" ? "Yes" : "No";

  // Build the output text
  let srText = "";

  if (role) {
    srText += `<strong>Role:</strong> ${role}<br>`;
  }

  if (label) {
    srText += `<strong>Label:</strong> ${label}<br>`;
  } else if (target.textContent && target.textContent.trim()) {
    srText += `<strong>Text:</strong> ${target.textContent
      .trim()
      .substring(0, 50)}${
      target.textContent.trim().length > 50 ? "..." : ""
    }<br>`;
  }

  srText += `<strong>Hidden:</strong> ${hidden}<br>`;

  if (target.tagName === "A" && target.getAttribute("href")) {
    srText += `<strong>Type:</strong> Link<br>`;
  }

  if (
    target.tagName === "BUTTON" ||
    (target.tagName === "INPUT" && target.type === "button")
  ) {
    srText += `<strong>Type:</strong> Button<br>`;
  }

  // Display or show a message if no accessible properties found
  if (srText === `<strong>Hidden:</strong> No<br>`) {
    srText =
      "<strong>Missing accessibility attributes!</strong><br>This element may not be properly announced by screen readers.";
  }

  srContent.innerHTML = srText;
}

/**
 * Gets the implicit ARIA role for an element based on its HTML tag
 * Maps HTML elements to their default ARIA roles
 * @param {HTMLElement} element - The element to check
 * @returns {string} The implicit ARIA role
 */
function getImplicitRole(element) {
  const tagName = element.tagName.toLowerCase();

  const roles = {
    a: "link",
    article: "article",
    aside: "complementary",
    button: "button",
    footer: "contentinfo",
    form: "form",
    h1: "heading",
    h2: "heading",
    h3: "heading",
    h4: "heading",
    h5: "heading",
    h6: "heading",
    header: "banner",
    img: "img",
    input: getInputRole(element),
    li: "listitem",
    main: "main",
    nav: "navigation",
    ol: "list",
    section: "region",
    select: "combobox",
    table: "table",
    ul: "list",
  };

  return roles[tagName] || "";
}

/**
 * Determines the appropriate ARIA role for input elements
 * Different types of inputs have different roles (checkbox, radio, etc.)
 * @param {HTMLInputElement} element - The input element
 * @returns {string} The ARIA role for this input type
 */
function getInputRole(element) {
  const type = element.getAttribute("type");

  const inputRoles = {
    button: "button",
    checkbox: "checkbox",
    radio: "radio",
    range: "slider",
    search: "searchbox",
    text: "textbox",
  };

  return inputRoles[type] || "textbox";
}

/**
 * Removes screen reader simulation
 * Cleans up the overlay and event listeners
 */
function removeScreenReaderSimulation() {
  if (screenReaderOverlay) {
    screenReaderOverlay.style.display = "none";
    document.removeEventListener("mouseover", showScreenReaderInfo);
  }
}

/**
 * Applies low vision simulation
 * Simulates how people with vision impairments might see the web page
 * Applies blur, increased text size, and other visual adjustments
 */
function applyLowVisionSimulation() {
  if (!lowVisionOverlay) {
    // Create the overlay
    lowVisionOverlay = document.createElement("div");
    lowVisionOverlay.id = "compliq-low-vision-overlay";
    lowVisionOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);
      pointer-events: none;
      z-index: 2147483647;
      filter: blur(1px);
    `;

    document.body.appendChild(lowVisionOverlay);

    // Add CSS for text zoom
    const style = document.createElement("style");
    style.textContent = `
      body.compliq-low-vision {
        font-size: 1.2em !important;
        line-height: 1.5 !important;
        word-spacing: 0.15em !important;
        letter-spacing: 0.05em !important;
      }
    `;
    document.head.appendChild(style);

    // Apply class to body
    document.body.classList.add("compliq-low-vision");
  } else {
    lowVisionOverlay.style.display = "block";
    document.body.classList.add("compliq-low-vision");
  }
}

/**
 * Removes low vision simulation
 * Restores the page to its original appearance
 */
function removeLowVisionSimulation() {
  if (lowVisionOverlay) {
    lowVisionOverlay.style.display = "none";
    document.body.classList.remove("compliq-low-vision");
  }
}

/**
 * Runs accessibility tests on the current page
 * Checks for common accessibility issues like missing alt text, labels, etc.
 * @returns {Object} An object containing test results and score
 */
function runAccessibilityTests() {
  try {
    // Simple accessibility checks
    const issues = [];
    let passedRules = 0;
    const totalRules = 8; // Total number of rules we're checking

    // 1. Check for images without alt text
    const images = document.querySelectorAll("img:not([alt])");
    if (images.length > 0) {
      issues.push({
        message: `${images.length} images missing alt text`,
        severity: "serious",
      });
    } else {
      passedRules++;
    }

    // 2. Check for contrast issues (simplified)
    const lightTextOnLightBg = checkContrastIssues();
    if (lightTextOnLightBg > 0) {
      issues.push({
        message: `${lightTextOnLightBg} potential contrast issues detected`,
        severity: "serious",
      });
    } else {
      passedRules++;
    }

    // 3. Check for missing form labels
    const formControls = document.querySelectorAll("input, select, textarea");
    let missingLabels = 0;

    formControls.forEach((control) => {
      // Skip hidden inputs
      if (control.type === "hidden") return;

      const id = control.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = control.getAttribute("aria-label");
      const hasAriaLabelledBy = control.getAttribute("aria-labelledby");

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        missingLabels++;
      }
    });

    if (missingLabels > 0) {
      issues.push({
        message: `${missingLabels} form controls missing labels`,
        severity: "critical",
      });
    } else {
      passedRules++;
    }

    // 4. Check for empty links
    const emptyLinks = document.querySelectorAll(
      "a:empty:not([aria-label]):not([aria-labelledby])"
    );
    if (emptyLinks.length > 0) {
      issues.push({
        message: `${emptyLinks.length} empty links without accessible names`,
        severity: "critical",
      });
    } else {
      passedRules++;
    }

    // 5. Check for missing document language
    const htmlLang = document.documentElement.getAttribute("lang");
    if (!htmlLang) {
      issues.push({
        message: "Page language is not specified",
        severity: "moderate",
      });
    } else {
      passedRules++;
    }

    // 6. Check for missing page title
    const pageTitle = document.title;
    if (!pageTitle || pageTitle.trim() === "") {
      issues.push({
        message: "Page is missing a title",
        severity: "serious",
      });
    } else {
      passedRules++;
    }

    // 7. Check for missing headings
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (headings.length === 0) {
      issues.push({
        message: "Page has no headings",
        severity: "serious",
      });
    } else {
      const h1 = document.querySelectorAll("h1");
      if (h1.length === 0) {
        issues.push({
          message: "Page has no main heading (h1)",
          severity: "moderate",
        });
      } else {
        passedRules++;
      }
    }

    // 8. Check for skip link
    const skipLink = Array.from(document.querySelectorAll("a")).find((a) => {
      const href = a.getAttribute("href");
      const text = a.textContent.toLowerCase();
      return (
        href &&
        href.includes("#") &&
        (text.includes("skip") ||
          text.includes("jump") ||
          text.includes("main"))
      );
    });

    if (!skipLink) {
      issues.push({
        message: "No skip link found for keyboard users",
        severity: "moderate",
      });
    } else {
      passedRules++;
    }

    // Calculate accessibility score (0-100)
    const score = Math.round((passedRules / totalRules) * 100);

    return {
      score,
      issues,
      passedRules,
      totalRules,
    };
  } catch (error) {
    console.error("Error running accessibility tests:", error);
    // Return a fallback result in case of error
    return {
      score: 0,
      issues: [
        {
          message: "Error running tests: " + error.message,
          severity: "critical",
        },
      ],
      passedRules: 0,
      totalRules: 8,
      error: true,
    };
  }
}

/**
 * Checks for potential contrast issues on the page
 * Identifies text elements with potentially low contrast against their background
 * @returns {number} The number of potential contrast issues detected
 */
function checkContrastIssues() {
  // This is a simplified approach - a real implementation would use color contrast algorithms
  let potentialIssues = 0;

  // Get all text elements
  const textElements = document.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, a, span, div, button, label"
  );

  textElements.forEach((element) => {
    // Skip elements with no text content
    if (!element.textContent.trim()) return;

    // Skip hidden elements
    if (element.offsetParent === null) return;

    const style = window.getComputedStyle(element);
    const backgroundColor = style.backgroundColor;
    const color = style.color;

    // Detect potentially low contrast combinations (simplified)
    if (isLightColor(color) && isLightColor(backgroundColor)) {
      potentialIssues++;
    }

    if (isVeryDarkColor(color) && isVeryDarkColor(backgroundColor)) {
      potentialIssues++;
    }
  });

  return potentialIssues;
}

// Very simple color lightness detection - not accurate for real contrast testing
function isLightColor(color) {
  // Handle rgba colors
  if (color.startsWith("rgba")) {
    const matches = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (matches) {
      const r = parseInt(matches[1]);
      const g = parseInt(matches[2]);
      const b = parseInt(matches[3]);
      return (r + g + b) / 3 > 200;
    }
  }

  // Handle rgb colors
  if (color.startsWith("rgb")) {
    const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (matches) {
      const r = parseInt(matches[1]);
      const g = parseInt(matches[2]);
      const b = parseInt(matches[3]);
      return (r + g + b) / 3 > 200;
    }
  }

  return false;
}

function isVeryDarkColor(color) {
  // Handle rgba colors
  if (color.startsWith("rgba")) {
    const matches = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (matches) {
      const r = parseInt(matches[1]);
      const g = parseInt(matches[2]);
      const b = parseInt(matches[3]);
      return (r + g + b) / 3 < 50;
    }
  }

  // Handle rgb colors
  if (color.startsWith("rgb")) {
    const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (matches) {
      const r = parseInt(matches[1]);
      const g = parseInt(matches[2]);
      const b = parseInt(matches[3]);
      return (r + g + b) / 3 < 50;
    }
  }

  return false;
}

/**
 * Updates active simulations based on current state
 * Applies or removes simulations depending on their active status
 */
function updateSimulations() {
  // Color blindness simulation
  if (simulationState.colorBlindness.active) {
    applyColorBlindnessSimulation();
  } else {
    removeColorBlindnessSimulation();
  }

  // Keyboard navigation simulation
  if (simulationState.keyboardNavigation) {
    applyKeyboardNavigationSimulation();
  } else {
    removeKeyboardNavigationSimulation();
  }

  // Screen reader simulation
  if (simulationState.screenReader) {
    applyScreenReaderSimulation();
  } else {
    removeScreenReaderSimulation();
  }

  // Low vision simulation
  if (simulationState.lowVision) {
    applyLowVisionSimulation();
  } else {
    removeLowVisionSimulation();
  }
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    // Add a simple ping/pong to verify script is loaded
    if (message.action === "ping") {
      sendResponse({ pong: true });
      return true;
    }

    if (message.action === "updateSimulations") {
      simulationState = message.state;
      updateSimulations();
      sendResponse({ success: true });
    }

    if (message.action === "runAccessibilityTests") {
      try {
        const results = runAccessibilityTests();
        sendResponse(results);
      } catch (error) {
        console.error("Error in runAccessibilityTests:", error);
        sendResponse({
          score: 0,
          issues: [
            {
              message: "Error running tests: " + error.message,
              severity: "critical",
            },
          ],
          passedRules: 0,
          totalRules: 8,
          error: true,
        });
      }
    }
  } catch (error) {
    console.error("Error handling message:", error);
    sendResponse({ error: error.message });
  }

  return true;
});

// Initialize on content script load
chrome.runtime.sendMessage({ action: "getState" }, (state) => {
  if (state) {
    simulationState = state;
    updateSimulations();
  }
});
