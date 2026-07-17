![Logo](admin/staticsfilefolder.png)
# ioBroker.staticsfilefolder

[![NPM version](https://img.shields.io/npm/v/iobroker.staticsfilefolder.svg)](https://www.npmjs.com/package/iobroker.staticsfilefolder)
[![Downloads](https://img.shields.io/npm/dm/iobroker.staticsfilefolder.svg)](https://www.npmjs.com/package/iobroker.staticsfilefolder)
![Number of Installations](https://iobroker.live/badges/staticsfilefolder-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/staticsfilefolder-stable.svg)

## Static Files Folder Explorer for ioBroker
An ioBroker adapter extension that provides a beautifully designed, modern Single Page Application (SPA) to browse, view, and interact with your static document files directly in the browser—completely offline!

This adapter acts as a web extension for the `ioBroker.web` adapter. It scans a specified directory on your server (e.g. `reports/`) and serves the files to a stunning web interface. 

### Features
* **Modern SPA Interface:** A fast and responsive Single Page Application with dynamic routing, sorting, and filtering.
* **Offline Document Viewing:** Built-in offline support for viewing standard documents directly in the browser without relying on external CDNs or internet access:
  * **PDFs** (via `pdf.js`)
  * **Excel Files** (via `xlsx`)
  * **Word Documents** (via `mammoth`)
* **Live File Monitoring (Chokidar):** The adapter monitors your reports directory in real-time. When a new file is added (e.g. by another archive tool), ioBroker states `staticsfilefolder.0.latest_file_url` and `staticsfilefolder.0.latest_file_path` are immediately updated.
* **Smart Highlighting:** Files generated "Today" are distinctly highlighted with a vibrant design to stand out from historical archives.
* **Navigation:** Native "Forward" and "Back" navigation through folders.

### Usage
1. Configure your target directory path in the adapter settings.
2. Ensure the `ioBroker.web` adapter is installed and running.
3. Access your files via `http://<iobroker-ip>:8082/staticsfilefolder/` (assuming your web adapter runs on port 8082).

### Requirements
* Node.js 18.x or higher
* ioBroker JS-Controller >= 3.3.22
* ioBroker Web Adapter >= 4.0.0

### Changelog
#### 0.0.1
* (gokturk413) initial release: SPA, Offline document viewers, Chokidar file observer.

### License
MIT License

Copyright (c) 2026 gokturk413 <gokturk413@gmail.com>