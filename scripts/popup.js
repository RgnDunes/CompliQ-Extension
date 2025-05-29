/**
 * CompliQ Accessibility Simulator - Popup Interface
 *
 * This script controls the extension's popup user interface. It handles:
 * - Initializing the UI based on saved state
 * - Processing user interactions with simulation toggles and controls
 * - Sending commands to content scripts to apply simulations
 * - Displaying accessibility test results
 * - Managing extension state persistence
 *
 * The popup provides an intuitive interface for controlling all accessibility
 * simulations and viewing test results.
 */

// DOM elements
const colorBlindnessToggle = document.getElementById("colorBlindnessToggle");
const keyboardNavigationToggle = document.getElementById(
  "keyboardNavigationToggle"
);
const screenReaderToggle = document.getElementById("screenReaderToggle");
const lowVisionToggle = document.getElementById("lowVisionToggle");
const colorBlindnessType = document.getElementById("colorBlindnessType");
const colorBlindnessControls = document.getElementById(
  "colorBlindnessControls"
);
const runTestsBtn = document.getElementById("runTestsBtn");
const resetBtn = document.getElementById("resetBtn");
const scoreValue = document.getElementById("scoreValue");
const scoreCircle = document.getElementById("scoreCircle");
const passedRules = document.getElementById("passedRules");
const totalRules = document.getElementById("totalRules");
const scoreHint = document.getElementById("scoreHint");

/**
 * Application state object
 * Tracks the current state of all simulation options and test results
 * @type {Object}
 */
let state = {
  colorBlindness: {
    active: false,
    type: "protanopia",
  },
  keyboardNavigation: false,
  screenReader: false,
  lowVision: false,
  accessibilityScore: {
    score: 0,
    passedRules: 0,
    totalRules: 0,
  },
};

/**
 * Initializes the UI based on saved state
 * Loads settings from Chrome storage and configures UI controls
 * Also automatically runs accessibility tests if needed
 */
function initializeUI() {
  chrome.storage.local.get("compliqState", (result) => {
    if (result.compliqState) {
      state = result.compliqState;

      // Update UI to match saved state
      colorBlindnessToggle.checked = state.colorBlindness.active;
      keyboardNavigationToggle.checked = state.keyboardNavigation;
      screenReaderToggle.checked = state.screenReader;
      lowVisionToggle.checked = state.lowVision;
      colorBlindnessType.value = state.colorBlindness.type;

      // Show/hide color blindness controls
      toggleColorBlindnessControls();

      // Update score display if available
      updateScoreDisplay();

      // Apply active simulations to the current tab
      applySimulationsToActiveTab();

      // Automatically run accessibility tests if no score exists
      if (state.accessibilityScore.score === 0) {
        runAccessibilityTests();
      }
    } else {
      // Initialize with default state if none exists
      saveState();
      // Run accessibility tests on the current page
      runAccessibilityTests();
    }
  });
}

/**
 * Saves current state to Chrome storage
 * Persists simulation settings and test results
 */
function saveState() {
  chrome.storage.local.set({ compliqState: state });
}

/**
 * Toggles visibility of color blindness type dropdown
 * Shows additional controls when color blindness simulation is active
 */
function toggleColorBlindnessControls() {
  if (state.colorBlindness.active) {
    colorBlindnessControls.classList.add("active");
  } else {
    colorBlindnessControls.classList.remove("active");
  }
}

/**
 * Updates the score display based on current test results
 * Shows accessibility score, status indicators, and pass/fail counts
 */
function updateScoreDisplay() {
  if (state.accessibilityScore.score > 0) {
    scoreValue.textContent = state.accessibilityScore.score;
    passedRules.textContent = state.accessibilityScore.passedRules;
    totalRules.textContent = state.accessibilityScore.totalRules;

    // Hide the hint when score is displayed
    if (scoreHint) scoreHint.style.display = "none";

    // Set score circle class based on score value
    scoreCircle.className = "score-circle";
    if (state.accessibilityScore.score >= 90) {
      scoreCircle.classList.add("good");
    } else if (state.accessibilityScore.score >= 70) {
      scoreCircle.classList.add("warning");
    } else {
      scoreCircle.classList.add("poor");
    }
  } else {
    scoreValue.textContent = "-";
    passedRules.textContent = "0";
    totalRules.textContent = "0";
    scoreCircle.className = "score-circle";

    // Show the hint when no score is available
    if (scoreHint) scoreHint.style.display = "block";
  }
}

/**
 * Checks if content script is loaded in the current tab
 * Uses a ping/pong mechanism to verify content script is active
 * @param {number} tabId - The ID of the tab to check
 * @returns {Promise<boolean>} - Promise resolving to true if script is loaded
 */
function checkContentScriptLoaded(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
      if (chrome.runtime.lastError || !response || !response.pong) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Applies current simulation settings to the active tab
 * Sends state to content script to update page appearance
 */
async function applySimulationsToActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs[0]) {
      const tabId = tabs[0].id;

      // Check if content script is loaded
      const isLoaded = await checkContentScriptLoaded(tabId);

      if (!isLoaded) {
        // Content script is not loaded, inject it
        injectContentScript(tabId);
        // Wait a bit for the script to initialize
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, {
            action: "updateSimulations",
            state: state,
          });
        }, 300);
        return;
      }

      // Content script is loaded, send message directly
      chrome.tabs.sendMessage(
        tabId,
        {
          action: "updateSimulations",
          state: state,
        },
        (response) => {
          // Handle potential errors
          if (chrome.runtime.lastError) {
            console.log(
              "Error applying simulations:",
              chrome.runtime.lastError.message
            );
            // The content script might be in an error state
            injectContentScript(tabId);
          }
        }
      );
    }
  });
}

/**
 * Injects content script if it's not already loaded
 * Used to ensure the content script is available for simulations
 * @param {number} tabId - The ID of the tab to inject script into
 */
function injectContentScript(tabId) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["content.js"],
    },
    () => {
      // After injection, try to send the simulation state again
      if (chrome.runtime.lastError) {
        console.log(
          "Error injecting content script:",
          chrome.runtime.lastError.message
        );
        return;
      }

      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, {
          action: "updateSimulations",
          state: state,
        });
      }, 100);
    }
  );
}

/**
 * Runs accessibility tests on the active tab
 * Sends request to content script and displays results
 */
async function runAccessibilityTests() {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs[0]) {
      // Show loading state
      scoreValue.textContent = "...";

      const tabId = tabs[0].id;

      // Check if content script is loaded
      const isLoaded = await checkContentScriptLoaded(tabId);

      if (!isLoaded) {
        // Content script is not loaded, inject it
        injectContentScript(tabId);
        // Wait a bit for the script to initialize and then retry
        setTimeout(() => retryAccessibilityTests(tabId), 500);
        return;
      }

      // Content script is loaded, run tests
      chrome.tabs.sendMessage(
        tabId,
        {
          action: "runAccessibilityTests",
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.log(
              "Error running tests:",
              chrome.runtime.lastError.message
            );
            // Try to inject content script and run tests again
            injectContentScript(tabId);
            setTimeout(() => retryAccessibilityTests(tabId), 500);
            return;
          }

          if (response && response.score !== undefined) {
            state.accessibilityScore = response;
            updateScoreDisplay();
            saveState();
          } else {
            // Handle case where no valid response was received
            console.log("No valid response from content script");
            scoreValue.textContent = "!";
          }
        }
      );
    }
  });
}

/**
 * Retries accessibility tests after script injection
 * Attempts to run tests again after content script is loaded
 * @param {number} tabId - The ID of the tab to test
 */
function retryAccessibilityTests(tabId) {
  chrome.tabs.sendMessage(
    tabId,
    {
      action: "runAccessibilityTests",
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.log("Retry failed:", chrome.runtime.lastError.message);
        scoreValue.textContent = "!";
        return;
      }

      if (response && response.score !== undefined) {
        state.accessibilityScore = response;
        updateScoreDisplay();
        saveState();
      } else {
        scoreValue.textContent = "!";
      }
    }
  );
}

/**
 * Resets all simulations and clears test results
 * Returns extension to initial state
 */
function resetAll() {
  state = {
    colorBlindness: {
      active: false,
      type: "protanopia",
    },
    keyboardNavigation: false,
    screenReader: false,
    lowVision: false,
    accessibilityScore: {
      score: 0,
      passedRules: 0,
      totalRules: 0,
    },
  };

  // Update UI
  colorBlindnessToggle.checked = false;
  keyboardNavigationToggle.checked = false;
  screenReaderToggle.checked = false;
  lowVisionToggle.checked = false;
  toggleColorBlindnessControls();
  updateScoreDisplay();

  // Save and apply changes
  saveState();
  applySimulationsToActiveTab();
}

// Event listeners
colorBlindnessToggle.addEventListener("change", () => {
  state.colorBlindness.active = colorBlindnessToggle.checked;
  toggleColorBlindnessControls();

  // Apply immediately with a slight delay to ensure proper rendering
  saveState();
  setTimeout(() => {
    applySimulationsToActiveTab();
  }, 50);
});

keyboardNavigationToggle.addEventListener("change", () => {
  state.keyboardNavigation = keyboardNavigationToggle.checked;
  saveState();
  applySimulationsToActiveTab();
});

screenReaderToggle.addEventListener("change", () => {
  state.screenReader = screenReaderToggle.checked;
  saveState();
  applySimulationsToActiveTab();
});

lowVisionToggle.addEventListener("change", () => {
  state.lowVision = lowVisionToggle.checked;
  saveState();
  applySimulationsToActiveTab();
});

colorBlindnessType.addEventListener("change", () => {
  state.colorBlindness.type = colorBlindnessType.value;
  saveState();

  // Apply immediately with a slight delay to ensure proper rendering
  setTimeout(() => {
    applySimulationsToActiveTab();
  }, 50);
});

runTestsBtn.addEventListener("click", runAccessibilityTests);
resetBtn.addEventListener("click", resetAll);

// Initialize on popup load
document.addEventListener("DOMContentLoaded", initializeUI);
