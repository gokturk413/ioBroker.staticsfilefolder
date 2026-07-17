"use strict";

/*
 * Created with @iobroker/create-adapter v2.6.2
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
// const fs = require("fs");

class Staticsfilefolder extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "staticsfilefolder",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		this.on("unload", this.onUnload.bind(this));

		this.watcher = null;
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Create state for latest file url
		await this.setObjectNotExistsAsync("latest_file_url", {
			type: "state",
			common: {
				name: "Latest File URL",
				type: "string",
				role: "url",
				read: true,
				write: false,
			},
			native: {},
		});

		// Create state for the latest file path
		await this.setObjectNotExistsAsync("latest_file_path", {
			type: "state",
			common: {
				name: "Latest File Path",
				type: "string",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});

		if (this.config.dirname) {
			this.log.info("Starting file observer on: " + this.config.dirname);
			try {
				const chokidar = require("chokidar");
				const path = require("path");

				this.watcher = chokidar.watch(this.config.dirname, {
					ignored: /(^|[/\\])\../, // ignore dotfiles
					persistent: true,
					ignoreInitial: true // do not fire for existing files on startup
				});

				this.watcher.on("add", async (filePath) => {
					this.log.info(`New file detected: ${filePath}`);

					// Calculate relative path for URL
					const relativePath = path.relative(this.config.dirname, filePath).replace(/\\/g, "/");
					const route = this.config.route || "demo";

					// Assuming the web adapter serves this extension under the web server's port
					// and relative path is encoded.
					const fileUrl = `/${route}/files/${encodeURI(relativePath)}`;

					await this.setStateAsync("latest_file_url", { val: fileUrl, ack: true });
					await this.setStateAsync("latest_file_path", { val: filePath, ack: true });
				});

				this.watcher.on("error", error => this.log.error(`Watcher error: ${error}`));
			} catch (e) {
				this.log.error("Failed to start file observer: " + e);
			}
		} else {
			this.log.warn("Directory name not configured. File observer will not start.");
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			if (this.watcher) {
				this.watcher.close();
				this.watcher = null;
			}
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Staticsfilefolder(options);
} else {
	// otherwise start the instance directly
	new Staticsfilefolder();
}