// Config and State
const BASE_ROUTE = window.location.pathname.replace(/\/$/, ''); // e.g. /Omni
const API_URL = `${BASE_ROUTE}/api/list`;
const FILE_URL = `${BASE_ROUTE}/files`;

let currentPath = '';
let historyStack = [];
let forwardStack = [];
let currentItems = [];

// DOM Elements
const breadcrumbEl = document.getElementById('breadcrumb');
const fileListEl = document.getElementById('file-list');
const emptyStateEl = document.getElementById('empty-state');
const btnBack = document.getElementById('btn-back');
const btnForward = document.getElementById('btn-forward');
const btnHome = document.getElementById('btn-home');
const btnTheme = document.getElementById('btn-theme');
const searchBox = document.getElementById('search-box');
const typeFilter = document.getElementById('type-filter');
const sortSelect = document.getElementById('sort-select');

const viewerModal = document.getElementById('viewer-modal');
const closeModal = document.getElementById('close-modal');
const viewerBody = document.getElementById('viewer-body');

// Setup PDF.js worker
if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'libs/pdfjs/pdf.worker.min.mjs';
}

// Theme Initialization
function initTheme() {
    const savedTheme = localStorage.getItem('staticsfilefolder_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    btnTheme.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('staticsfilefolder_theme', newTheme);
    btnTheme.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadPath('');
    
    // Event Listeners
    btnBack.addEventListener('click', goBack);
    btnForward.addEventListener('click', goForward);
    btnHome.addEventListener('click', () => navigateTo(''));
    btnTheme.addEventListener('click', toggleTheme);
    
    searchBox.addEventListener('input', renderItems);
    typeFilter.addEventListener('change', renderItems);
    sortSelect.addEventListener('change', renderItems);
    
    closeModal.addEventListener('click', () => {
        viewerModal.style.display = 'none';
        viewerBody.innerHTML = ''; // clear memory
    });
});

async function loadPath(path) {
    try {
        const response = await fetch(`${API_URL}?path=${encodeURIComponent(path)}`);
        const data = await response.json();
        
        if (data.success) {
            currentPath = path;
            currentItems = data.items;
            
            updateBreadcrumb();
            updateNavButtons();
            renderItems();
        } else {
            alert('Qovluq yüklənərkən xəta: ' + data.error);
        }
    } catch (e) {
        console.error(e);
        alert('Şəbəkə xətası.');
    }
}

function navigateTo(path) {
    if (path !== currentPath) {
        historyStack.push(currentPath);
        forwardStack = []; // Clear forward stack on new navigation
        loadPath(path);
    }
}

function goBack() {
    if (historyStack.length > 0) {
        forwardStack.push(currentPath);
        const prevPath = historyStack.pop();
        loadPath(prevPath);
    }
}

function goForward() {
    if (forwardStack.length > 0) {
        historyStack.push(currentPath);
        const nextPath = forwardStack.pop();
        loadPath(nextPath);
    }
}

function updateNavButtons() {
    btnBack.disabled = historyStack.length === 0;
    btnForward.disabled = forwardStack.length === 0;
}

function updateBreadcrumb() {
    if (!currentPath) {
        breadcrumbEl.innerHTML = '<span><i class="icon">🏠</i> Kök Qovluq</span>';
        return;
    }
    
    const parts = currentPath.split('/');
    let html = '<span data-path="">🏠 Kök</span>';
    let buildPath = '';
    
    parts.forEach((part, index) => {
        if (!part) return;
        buildPath += (buildPath ? '/' : '') + part;
        html += ` / <span data-path="${buildPath}">${part}</span>`;
    });
    
    breadcrumbEl.innerHTML = html;
    
    // Add click events to breadcrumb
    breadcrumbEl.querySelectorAll('span').forEach(span => {
        span.addEventListener('click', (e) => {
            const path = e.target.getAttribute('data-path');
            if (path !== null) navigateTo(path);
        });
    });
}

function renderItems() {
    fileListEl.innerHTML = '';
    
    const searchQuery = searchBox.value.toLowerCase();
    const typeValue = typeFilter.value;
    const sortValue = sortSelect.value;
    
    let filtered = currentItems.filter(item => {
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery)) return false;
        if (typeValue !== 'all' && !item.isDirectory) {
            if (item.ext !== typeValue) return false;
        }
        return true;
    });
    
    // Sorting
    filtered.sort((a, b) => {
        // Always folders first
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        
        if (sortValue === 'name-asc') {
            return a.name.localeCompare(b.name);
        } else if (sortValue === 'name-desc') {
            return b.name.localeCompare(a.name);
        } else if (sortValue === 'date-desc') {
            return b.mtime - a.mtime;
        } else if (sortValue === 'date-asc') {
            return a.mtime - b.mtime;
        }
    });
    
    if (filtered.length === 0) {
        emptyStateEl.style.display = 'block';
        return;
    } else {
        emptyStateEl.style.display = 'none';
    }
    
    const today = new Date().setHours(0,0,0,0);
    
    filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = 'file-item';
        
        let icon = '📄';
        if (item.isDirectory) icon = '📁';
        else if (item.ext === '.pdf') icon = '📕';
        else if (item.ext === '.xlsx' || item.ext === '.csv') icon = '📗';
        else if (item.ext === '.docx' || item.ext === '.doc') icon = '📘';
        
        // Check if today
        const itemDate = new Date(item.mtime);
        const isToday = itemDate.setHours(0,0,0,0) === today;
        if (isToday) div.classList.add('is-today');
        
        const dateStr = new Date(item.mtime).toLocaleString('az-AZ');
        
        let sizeStr = '';
        if (!item.isDirectory) {
            if (item.size > 1024 * 1024) sizeStr = (item.size / (1024 * 1024)).toFixed(2) + ' MB';
            else sizeStr = (item.size / 1024).toFixed(2) + ' KB';
        }
        
        div.innerHTML = `
            <div class="file-icon">${icon}</div>
            <div class="file-name" title="${item.name}">${item.name}</div>
            <div class="file-meta">${dateStr}<br>${sizeStr}</div>
            ${isToday ? '<div class="today-badge">Bu gün</div>' : ''}
        `;
        
        div.addEventListener('click', () => handleItemClick(item));
        fileListEl.appendChild(div);
    });
}

function handleItemClick(item) {
    if (item.isDirectory) {
        const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
        navigateTo(newPath);
    } else {
        const filePath = currentPath ? `${currentPath}/${item.name}` : item.name;
        const fileUrl = `${FILE_URL}/${encodeURIComponent(filePath)}`;
        
        if (item.ext === '.pdf') {
            openPdf(fileUrl);
        } else if (item.ext === '.xlsx' || item.ext === '.csv') {
            openExcel(fileUrl);
        } else if (item.ext === '.docx') {
            openWord(fileUrl);
        } else {
            // Unhandled file type, just open in new tab
            window.open(fileUrl, '_blank');
        }
    }
}

// ---- Document Viewers ----

async function openPdf(url) {
    viewerModal.style.display = 'block';
    viewerBody.innerHTML = '<h2>PDF Yüklənir...</h2>';
    
    try {
        const loadingTask = window.pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        viewerBody.innerHTML = ''; // clear loading
        
        // Render all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const scale = 1.5;
            const viewport = page.getViewport({ scale: scale });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            viewerBody.appendChild(canvas);
            
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            await page.render(renderContext).promise;
        }
    } catch (e) {
        viewerBody.innerHTML = `<h2 style="color:red">Xəta baş verdi: ${e.message}</h2>`;
    }
}

async function openExcel(url) {
    viewerModal.style.display = 'block';
    viewerBody.innerHTML = '<h2>Excel Yüklənir...</h2>';
    
    try {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        
        const workbook = XLSX.read(arrayBuffer, {type: 'array'});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const htmlTable = XLSX.utils.sheet_to_html(worksheet, { id: 'excel-table' });
        
        viewerBody.innerHTML = `<div style="padding: 20px; background: white; width: 100%; height: 100%; overflow: auto;">
            <h3 style="margin-top:0">${firstSheetName}</h3>
            ${htmlTable}
        </div>`;
        
        // Add some style classes to the generated table
        const table = document.getElementById('excel-table');
        if(table) table.className = 'sheetjs-table';
        
    } catch (e) {
        viewerBody.innerHTML = `<h2 style="color:red">Xəta baş verdi: ${e.message}</h2>`;
    }
}

async function openWord(url) {
    viewerModal.style.display = 'block';
    viewerBody.innerHTML = '<h2>Word Sənədi Yüklənir...</h2>';
    
    try {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        
        const result = await mammoth.convertToHtml({arrayBuffer: arrayBuffer});
        
        viewerBody.innerHTML = `<div style="padding: 40px; background: white; max-width: 800px; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            ${result.value}
        </div>`;
    } catch (e) {
        viewerBody.innerHTML = `<h2 style="color:red">Xəta baş verdi: ${e.message}</h2>`;
    }
}
