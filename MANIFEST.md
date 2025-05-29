# Manifest.json Documentation

This document explains the purpose and structure of the `manifest.json` file in the CompliQ Chrome extension.

## Overview

The `manifest.json` file is the configuration file for Chrome extensions. It defines the extension's capabilities, resources, and behavior.

## Key Components

### Basic Information

- `manifest_version`: Specifies that this extension uses Manifest V3 (the latest version)
- `name`: The name of the extension as shown in the Chrome Web Store and UI
- `version`: The current version number of the extension
- `description`: A brief description of what the extension does

### Permissions

The extension requires the following permissions:

- `activeTab`: Allows access to the currently active tab
- `scripting`: Enables the extension to inject scripts into web pages
- `storage`: Allows the extension to store data persistently
- `tabs`: Provides access to the browser's tab system

### Host Permissions

- `<all_urls>`: Allows the extension to run on all websites

### Action

Defines what happens when users interact with the extension icon:

- `default_popup`: The HTML file that opens when users click on the extension icon
- `default_icon`: The icons shown in the browser toolbar in different sizes

### Background Script

- `service_worker`: The JavaScript file that runs in the background
- `type`: Specifies that the background script is an ES module

### Content Scripts

Scripts that are injected into web pages:

- `matches`: Patterns that determine which pages the scripts run on
- `js`: JavaScript files to inject
- `css`: CSS files to inject
- `run_at`: When to inject the scripts (at document idle)

### Web Accessible Resources

Resources that can be accessed by web pages:

- `resources`: Patterns matching accessible resources
- `matches`: Patterns of pages that can access these resources

### Icons

Icons used in various places in the Chrome UI:

- Different sizes (16x16, 48x48, 128x128) for different contexts
