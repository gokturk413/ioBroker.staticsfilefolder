var express    = require('express');
var serveIndex = require('serve-index');
/**
 * Web extension example
 *
 * @class
 * @param {object} server http or https node.js object
 * @param {object} webSettings settings of the web server, like <pre><code>{secure: settings.secure, port: settings.port}</code></pre>
 * @param {object} adapter web adapter object
 * @param {object} instanceSettings instance object with common and native
 * @param {object} app express application
 * @return {object} class instance
 */
function ExtensionExample(server, webSettings, adapter, instanceSettings, app) {
    this.app         = app;
    this.config      = instanceSettings ? instanceSettings.native : {};
    const that       = this;

    // instanceSettings and this.config contain instance config (not web adapter, but this one with web-extension)
    this.config.route = this.config.route || 'demo';

    /*this.unload = function () {
        return new Promise(resolve => {
            adapter.log.debug('Demo extension unloaded!');
            
            // unload app path
            const middlewareIndex = app._router.stack.findIndex(layer => 
                layer && layer.route === '/' + that.config.route);
                
            if (middlewareIndex !== -1) {
                // Remove the matched middleware
                app._router.stack.splice(middlewareIndex, 1);
            }
            
            resolve(middlewareIndex);
        });
    };*/

    // Optional: deliver to web the link to Web interface
    /*this.welcomePage = () => {
        return {
            link: 'example/',
            name: 'Example',
            img: 'admin/staticsfilefolder.png',
            color: '#157c00',
            order: 10,
            pro: false
        };
    }*/

    // Optional. Say to web instance to wait till this instance is initialized
    // Used if initalisation lasts some time
    this.readyCallback = null; 
    this.waitForReady = cb => {
        this.readyCallback = cb;
    }

    // self invoke constructor
    (function __constructor () {
        adapter.log.info('Install extension on /' + that.config.route);

        that.app.use('/' + that.config.route, express.static(that.config.dirname), serveIndex(that.config.dirname, {'icons': true}));
        /*that.app.use('/' + that.config.demoParam, (req, res) => {
            res.setHeader('Content-type', 'text/html');
            res.status(200).send('You called a demo web extension with path "' + req.url + '"');
        });*/
        
        // inform web about that all routes are installed
        that.readyCallback && that.readyCallback(that);
    })();
}

module.exports = ExtensionExample;