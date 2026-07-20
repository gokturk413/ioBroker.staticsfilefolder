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

### Configuration & Instance Settings

After installing the adapter, configure the following settings in the instance configuration page:

1. **Extend WEB adapter (webInstance):**
   * **Description:** Select which running instance of the `ioBroker.web` adapter you want to bind this extension to (e.g. `web.0` or select `all` / `*` to extend all running web servers).
   * **Why it matters:** This adapter serves the user interface through the web adapter server.

2. **Route path (route):**
   * **Description:** The path name (slug) to access the document explorer page. For example, if you set this to `Omni`, the file explorer will be accessible at:
     ```
     http://<your-iobroker-ip>:8082/Omni/
     ```
   * **Default:** `staticsfilefolder` (which makes it accessible at `http://<your-iobroker-ip>:8082/staticsfilefolder/`).

3. **Static Files Directory (dirname):**
   * **Description:** The absolute path to the folder on your ioBroker server's disk where your document archives or reports are located (e.g. `D:\OMNI` on Windows or `/var/reports` on Linux).
   * **Why it matters:** All files and subfolders in this directory will be visible in the web explorer. Additionally, the adapter watches this directory for newly added files and updates ioBroker states when changes occur.

---

### Accessing the Web Interface

Once configured and the instance is running (green status):
1. Open your browser and navigate to:
   ```
   http://<your-iobroker-ip>:8082/<your-route-path>/
   ```
   *(Replace `<your-iobroker-ip>` with your server's IP, `8082` with your Web adapter port, and `<your-route-path>` with the **Route path** setting you defined, e.g. `Omni`).*
2. You will be greeted by the beautiful Single Page Application displaying your folders and files. You can click on directories to navigate them, or click on PDFs, Excel sheets, and Word documents to view them offline in the premium dark/light interface!

---

### Requirements
* Node.js 22.x or higher
* ioBroker JS-Controller >= 6.0.11
* ioBroker Web Adapter >= 4.0.0

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->
### 0.0.29
* Fixed tsconfig type checking configuration for adapter build.

### 0.0.28
* Fully migrated materialized admin UI to modern admin 5 jsonConfig UI, and evaluated typescript 7 compatibility.

### 0.0.27
* Upgraded typescript to version 7, and fully migrated materialized admin UI to modern admin 5 jsonConfig UI.

### 0.0.26
* Regenerated lockfile cleanly to resolve npm ci errors on GitHub Actions workflow.

### 0.0.25
* Resolved ESLint peer dependency warnings, linked CHANGELOG_OLD in README, updated check-and-lint workflow to Node 24, and added major auto-merge rules for GitHub actions.

### 0.0.24
* Resolved all remaining repochecker warnings and suggestions, migrated to standard automerge-dependabot workflow, and updated to ESLint v9 with flat config.

### 0.0.23
* Added live rendering / auto-refresh in file explorer on file additions/deletions.

### 0.0.22
* Fixed PDF print layout to prevent vertical page overflow, and fixed zoom/scale rendering issues in PDF viewer.

### 0.0.21
* Upgraded Express to major version 5.x and updated tsconfig to target Node 22.

### 0.0.20
* Fixed dependabot auto-merge workflow write permissions.

### 0.0.19
* Fixed PDF printing layout margins to fit 1 page, removed file title header from print view, and added zoom controls to PDF viewer.

### 0.0.15
* Reverted minimum Node.js engine requirement to 20 to support GitHub Actions runners.

### 0.0.13
* Fixed repochecker error validation requirements (gitignore and dependabot ignore rules).

### 0.0.12
* Automatically detect ioBroker system language. Added German and Russian translations.

### 0.0.11
* Added multi-language support (English and Azerbaijani) with English as the default.

### 0.0.1
* (gokturk413) initial release: SPA, Offline document viewers, Chokidar file observer.

[Older changelog entries](CHANGELOG_OLD.md)

## License
MIT License

Copyright (c) 2026 gokturk413 <gokturk413@gmail.com>