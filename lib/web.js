const express = require('express');
const path = require('path');
const fs = require('fs');

class ExtensionExample {
    /**
     * @param {object} server http or https node.js object
     * @param {object} webSettings settings of the web server
     * @param {object} adapter web adapter object
     * @param {object} instanceSettings instance object with common and native
     * @param {object} app express application
     */
    constructor(server, webSettings, adapter, instanceSettings, app) {
        this.app = app;
        this.config = instanceSettings ? instanceSettings.native : {};
        this.config.route = this.config.route || 'demo';

        try {
            adapter.log.info('Install extension on /' + this.config.route);

            // Serve our SPA static files from www folder
            const wwwPath = path.join(__dirname, '../www');
            this.app.use('/' + this.config.route, express.static(wwwPath));

            // Serve the reports directory so files can be accessed via URL
            if (this.config.dirname) {
                this.app.use('/' + this.config.route + '/files', express.static(this.config.dirname));
            }

            // API Endpoint for listing files
            this.app.get('/' + this.config.route + '/api/list', (req, res) => {
                try {
                    let relPath = req.query.path || '';
                    if (relPath.includes('..')) {
                        return res.status(400).json({error: 'Invalid path'});
                    }
                    
                    let targetDir = path.join(this.config.dirname, relPath);
                    
                    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
                        return res.status(404).json({error: 'Directory not found'});
                    }

                    let items = fs.readdirSync(targetDir);
                    let result = [];
                    for (let item of items) {
                        try {
                            let itemPath = path.join(targetDir, item);
                            let stat = fs.statSync(itemPath);
                            result.push({
                                name: item,
                                isDirectory: stat.isDirectory(),
                                size: stat.size,
                                mtime: stat.mtimeMs,
                                birthtime: stat.birthtimeMs,
                                ext: path.extname(item).toLowerCase()
                            });
                        } catch (err) {}
                    }
                    
                    res.json({ success: true, items: result, path: relPath });
                } catch(e) {
                    adapter.log.error('Error in /api/list: ' + e);
                    res.status(500).json({error: e.toString()});
                }
            });

        } catch (err) {
            adapter.log.error('Error during Extension init: ' + err.stack);
        }
    }
}

module.exports = ExtensionExample;