const fs = require("fs");
const path = require("path");

const libsDir = path.join(__dirname, "www", "libs");
if (!fs.existsSync(libsDir)) {
	fs.mkdirSync(libsDir, { recursive: true });
}

function copyFile(src, dest) {
	if (fs.existsSync(src)) {
		fs.copyFileSync(src, dest);
		console.log(`Copied ${src} to ${dest}`);
	} else {
		console.error(`Not found: ${src}`);
	}
}

// copy mammoth
copyFile(
	path.join(__dirname, "node_modules", "mammoth", "mammoth.browser.min.js"),
	path.join(libsDir, "mammoth.browser.min.js")
);

// copy xlsx
copyFile(
	path.join(__dirname, "node_modules", "xlsx", "dist", "xlsx.full.min.js"),
	path.join(libsDir, "xlsx.full.min.js")
);

// copy pdfjs
const pdfjsDest = path.join(libsDir, "pdfjs");
if (!fs.existsSync(pdfjsDest)) fs.mkdirSync(pdfjsDest, { recursive: true });

copyFile(
	path.join(__dirname, "node_modules", "pdfjs-dist", "build", "pdf.min.mjs"),
	path.join(pdfjsDest, "pdf.min.mjs")
);
copyFile(
	path.join(__dirname, "node_modules", "pdfjs-dist", "build", "pdf.min.mjs.map"),
	path.join(pdfjsDest, "pdf.min.mjs.map")
);
copyFile(
	path.join(__dirname, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs"),
	path.join(pdfjsDest, "pdf.worker.min.mjs")
);
copyFile(
	path.join(__dirname, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs.map"),
	path.join(pdfjsDest, "pdf.worker.min.mjs.map")
);

console.log("Offline libraries copied successfully.");
