/**
 * CompliQ Accessibility Simulator - Background Script
 *
 * This background script manages the extension's state and handles communication
 * between the popup interface and content scripts. It performs the following functions:
 *
 * - Initializes default state when the extension is installed
 * - Monitors tab updates to inject content scripts when needed
 * - Handles state persistence through Chrome's storage API
 * - Coordinates messaging between components
 *
 * The background script runs as a service worker, providing a central coordinator
 * for the extension's functionality even when the popup is closed.
 */

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("CompliQ Accessibility Simulator installed");

  /**
   * Default extension state
   * Sets initial values for all simulation options and settings
   */
  const defaultState = {
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

  // Save default state to Chrome's storage
  chrome.storage.local.set({ compliqState: defaultState });
});

/**
 * Tab update listener
 * Detects when a tab is updated and injects content scripts if simulations are active
 * This ensures simulations persist across page navigation
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if tab has a URL and if it's an HTTP(S) URL
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.startsWith("http")
  ) {
    // Check if simulations are active
    chrome.storage.local.get("compliqState", (result) => {
      if (result.compliqState) {
        const state = result.compliqState;

        // If any simulation is active, send a message to the content script
        if (
          state.colorBlindness.active ||
          state.keyboardNavigation ||
          state.screenReader ||
          state.lowVision
        ) {
          // Wait for content script to be ready
          setTimeout(() => {
            chrome.tabs.sendMessage(
              tabId,
              {
                action: "updateSimulations",
                state: state,
              },
              (response) => {
                // Handle potential error if content script isn't ready
                const lastError = chrome.runtime.lastError;
                if (lastError) {
                  console.log(
                    "Content script not ready yet:",
                    lastError.message
                  );

                  // Inject content script and try again
                  chrome.scripting.executeScript(
                    {
                      target: { tabId: tabId },
                      files: ["content.js"],
                    },
                    () => {
                      // Try again after script injection
                      setTimeout(() => {
                        chrome.tabs.sendMessage(tabId, {
                          action: "updateSimulations",
                          state: state,
                        });
                      }, 100);
                    }
                  );
                }
              }
            );
          }, 500);
        }
      }
    });
  }
});

/**
 * Message handler
 * Processes messages from popup and content scripts
 * Provides access to stored state and other extension functionality
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getState") {
    // Return the current state to the requester
    chrome.storage.local.get("compliqState", (result) => {
      sendResponse(result.compliqState || null);
    });
    return true; // Required for async response
  }
});
