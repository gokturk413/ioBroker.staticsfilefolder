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
const btnLang = document.getElementById('btn-lang');
const searchBox = document.getElementById('search-box');
const typeFilter = document.getElementById('type-filter');
const sortSelect = document.getElementById('sort-select');

const viewerModal = document.getElementById('viewer-modal');
const closeModal = document.getElementById('close-modal');
const viewerBody = document.getElementById('viewer-body');
const modalTitle = document.getElementById('modal-title');
const modalBtnPrev = document.getElementById('modal-btn-prev');
const modalBtnNext = document.getElementById('modal-btn-next');
const modalBtnPrint = document.getElementById('modal-btn-print');
const modalBtnDownload = document.getElementById('modal-btn-download');

// Modal Navigation State
let currentOpenItem = null;
let currentFilesList = [];

// Localization Settings
const translations = {
    en: {
        back: "← Back",
        forward: "Forward →",
        home: "Home",
        searchPlaceholder: "Search...",
        allTypes: "All Types",
        sortAz: "Sort A-Z",
        sortZa: "Sort Z-A",
        sortNewest: "Newest First",
        sortOldest: "Oldest First",
        title: "Omni Reports",
        loadingPdf: "Loading PDF...",
        loadingExcel: "Loading Excel...",
        loadingWord: "Loading Word...",
        emptyFolder: "This folder is empty.",
        root: "Root",
        themeTooltip: "Toggle Dark/Light Mode",
        langTooltip: "Change Language / Dili Dəyiş",
        modalTitle: "File Viewer",
        modalBack: "← Back",
        modalForward: "Next →",
        modalPrint: "🖨️ Print / PDF",
        modalDownload: "📥 Download",
        todayBadge: "Today",
        errorLoading: "An error occurred: "
    },
    az: {
        back: "← Geri",
        forward: "İrəli →",
        home: "Ev (Home)",
        searchPlaceholder: "Axtarış...",
        allTypes: "Bütün Tiplər",
        sortAz: "A-Z Sırala",
        sortZa: "Z-A Sırala",
        sortNewest: "Ən Yeni",
        sortOldest: "Ən Köhnə",
        title: "Omni Hesabatlar",
        loadingPdf: "PDF Yüklənir...",
        loadingExcel: "Excel Yüklənir...",
        loadingWord: "Word Yüklənir...",
        emptyFolder: "Bu qovluq boşdur.",
        root: "Kök",
        themeTooltip: "Gecə/Gündüz Rejimi",
        langTooltip: "Change Language / Dili Dəyiş",
        modalTitle: "Fayl Baxışı",
        modalBack: "← Geri",
        modalForward: "İrəli →",
        modalPrint: "🖨️ Çap / PDF",
        modalDownload: "📥 Yüklə",
        todayBadge: "Bu gün",
        errorLoading: "Xəta baş verdi: "
    },
    de: {
        back: "← Zurück",
        forward: "Weiter →",
        home: "Startseite",
        searchPlaceholder: "Suchen...",
        allTypes: "Alle Typen",
        sortAz: "A-Z sortieren",
        sortZa: "Z-A sortieren",
        sortNewest: "Neueste zuerst",
        sortOldest: "Älteste zuerst",
        title: "Omni Berichte",
        loadingPdf: "PDF wird geladen...",
        loadingExcel: "Excel wird geladen...",
        loadingWord: "Word wird geladen...",
        emptyFolder: "Dieser Ordner ist leer.",
        root: "Hauptverzeichnis",
        themeTooltip: "Dunkel/Hell-Modus umschalten",
        langTooltip: "Sprache ändern",
        modalTitle: "Dateibetrachter",
        modalBack: "← Zurück",
        modalForward: "Weiter →",
        modalPrint: "🖨️ Drucken / PDF",
        modalDownload: "📥 Herunterladen",
        todayBadge: "Heute",
        errorLoading: "Ein Fehler ist aufgetreten: "
    },
    ru: {
        back: "← Назад",
        forward: "Вперед →",
        home: "Главная",
        searchPlaceholder: "Поиск...",
        allTypes: "Все типы",
        sortAz: "Сортировка А-Я",
        sortZa: "Сортировка Я-А",
        sortNewest: "Сначала новые",
        sortOldest: "Сначала старые",
        title: "Omni Отчеты",
        loadingPdf: "Загрузка PDF...",
        loadingExcel: "Загрузка Excel...",
        loadingWord: "Загрузка Word...",
        emptyFolder: "Эта папка пуста.",
        root: "Корень",
        themeTooltip: "Переключить тему",
        langTooltip: "Изменить язык",
        modalTitle: "Просмотр файла",
        modalBack: "← Назад",
        modalForward: "Вперед →",
        modalPrint: "🖨️ Печать / PDF",
        modalDownload: "📥 Скачать",
        todayBadge: "Сегодня",
        errorLoading: "Произошла ошибка: "
    }
};

const supportedLangs = ['en', 'az', 'de', 'ru'];
let currentLang = 'en'; // default English

// Setup PDF.js worker
if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'libs/pdfjs/pdf.worker.min.mjs';
}

// Language Initialization
async function initLang() {
    let savedLang = localStorage.getItem('staticsfilefolder_lang');
    if (!savedLang) {
        try {
            const res = await fetch(`${BASE_ROUTE}/api/config`);
            const data = await res.json();
            if (data && data.language) {
                savedLang = data.language;
            }
        } catch (e) {
            // ignore
        }
    }
    
    currentLang = savedLang || navigator.language.split('-')[0] || 'en';
    if (!translations[currentLang]) {
        currentLang = 'en';
    }
    applyTranslations();
}

function toggleLang() {
    let index = supportedLangs.indexOf(currentLang);
    index = (index + 1) % supportedLangs.length;
    currentLang = supportedLangs[index];
    localStorage.setItem('staticsfilefolder_lang', currentLang);
    applyTranslations();
}

function applyTranslations() {
    const t = translations[currentLang];
    
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'INPUT') {
                el.placeholder = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });

    // Update search placeholder and other specific inputs
    searchBox.placeholder = t.searchPlaceholder;
    btnLang.textContent = `🌐 ${currentLang.toUpperCase()}`;
    
    // Refresh UI to update dynamic content like dates/breadcrumbs
    updateBreadcrumb();
    renderItems();
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
    initLang();
    loadPath('');
    
    // Event Listeners
    btnBack.addEventListener('click', goBack);
    btnForward.addEventListener('click', goForward);
    btnHome.addEventListener('click', () => navigateTo(''));
    btnTheme.addEventListener('click', toggleTheme);
    btnLang.addEventListener('click', toggleLang);
    
    searchBox.addEventListener('input', renderItems);
    typeFilter.addEventListener('change', renderItems);
    sortSelect.addEventListener('change', renderItems);
    
    // Modal Toolbar Event Listeners
    modalBtnPrev.addEventListener('click', navigateModalPrev);
    modalBtnNext.addEventListener('click', navigateModalNext);
    modalBtnPrint.addEventListener('click', printModalContent);
    modalBtnDownload.addEventListener('click', downloadCurrentFile);
    
    closeModal.addEventListener('click', () => {
        viewerModal.style.display = 'none';
        viewerBody.innerHTML = ''; // clear memory
        currentOpenItem = null;
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
    const rootName = translations[currentLang]?.root || 'Root';
    if (!currentPath) {
        breadcrumbEl.innerHTML = `<span><i class="icon">🏠</i> ${rootName}</span>`;
        return;
    }
    
    const parts = currentPath.split('/');
    let html = `<span data-path="">🏠 ${rootName}</span>`;
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
    
    currentFilesList = filtered.filter(item => !item.isDirectory);
    
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
        
        const locale = currentLang === 'en' ? 'en-US' : 'az-AZ';
        const dateStr = new Date(item.mtime).toLocaleString(locale);
        
        let sizeStr = '';
        if (!item.isDirectory) {
            if (item.size > 1024 * 1024) sizeStr = (item.size / (1024 * 1024)).toFixed(2) + ' MB';
            else sizeStr = (item.size / 1024).toFixed(2) + ' KB';
        }
        
        const todayText = translations[currentLang]?.todayBadge || 'Today';
        
        div.innerHTML = `
            <div class="file-icon">${icon}</div>
            <div class="file-name" title="${item.name}">${item.name}</div>
            <div class="file-meta">${dateStr}<br>${sizeStr}</div>
            ${isToday ? `<div class="today-badge">${todayText}</div>` : ''}
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
        openFile(item);
    }
}

function openFile(item) {
    currentOpenItem = item;
    modalTitle.textContent = item.name;
    
    // Find index of current file in currentFilesList
    const index = currentFilesList.findIndex(f => f.name === item.name);
    modalBtnPrev.disabled = index <= 0;
    modalBtnNext.disabled = index === -1 || index >= currentFilesList.length - 1;
    
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
        viewerModal.style.display = 'none';
        currentOpenItem = null;
    }
}

function navigateModalPrev() {
    if (!currentOpenItem) return;
    const index = currentFilesList.findIndex(f => f.name === currentOpenItem.name);
    if (index > 0) {
        openFile(currentFilesList[index - 1]);
    }
}

function navigateModalNext() {
    if (!currentOpenItem) return;
    const index = currentFilesList.findIndex(f => f.name === currentOpenItem.name);
    if (index !== -1 && index < currentFilesList.length - 1) {
        openFile(currentFilesList[index + 1]);
    }
}

function printModalContent() {
    if (!currentOpenItem) return;
    
    const canvases = viewerBody.querySelectorAll('canvas');
    let contentHtml = '';
    
    if (canvases.length > 0) {
        // PDF (which is rendered in canvases)
        canvases.forEach(canvas => {
            const dataUrl = canvas.toDataURL();
            contentHtml += `<img src="${dataUrl}" style="max-width: 100%; margin-bottom: 20px; display: block;" />`;
        });
    } else {
        // Excel table or Word document HTML
        contentHtml = viewerBody.innerHTML;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>${currentOpenItem.name}</title>
            <style>
                body { margin: 20px; font-family: sans-serif; background: white; color: black; }
                img, table { max-width: 100%; page-break-inside: avoid; }
                table { border-collapse: collapse; width: 100%; margin-top: 10px; }
                table th, table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                table th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h2>${currentOpenItem.name}</h2>
            <hr />
            ${contentHtml}
            <script>
                window.onload = function() {
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 500);
                };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function downloadCurrentFile() {
    if (currentOpenItem) {
        const filePath = currentPath ? `${currentPath}/${currentOpenItem.name}` : currentOpenItem.name;
        const fileUrl = `${FILE_URL}/${encodeURIComponent(filePath)}`;
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = currentOpenItem.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

// ---- Document Viewers ----

async function openPdf(url) {
    viewerModal.style.display = 'block';
    viewerBody.innerHTML = `<h2>${translations[currentLang]?.loadingPdf || 'Loading PDF...'}</h2>`;
    
    try {
        const loadingTask = window.pdfjsLib.getDocument({ url: url });
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
        const errorText = translations[currentLang]?.errorLoading || 'An error occurred: ';
        viewerBody.innerHTML = `<h2 style="color:red">${errorText}${e.message}</h2>`;
    }
}

async function openExcel(url) {
    viewerModal.style.display = 'block';
    viewerBody.innerHTML = `<h2>${translations[currentLang]?.loadingExcel || 'Loading Excel...'}</h2>`;
    
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
        const errorText = translations[currentLang]?.errorLoading || 'An error occurred: ';
        viewerBody.innerHTML = `<h2 style="color:red">${errorText}${e.message}</h2>`;
    }
}

async function openWord(url) {
    viewerModal.style.display = 'block';
    viewerBody.innerHTML = `<h2>${translations[currentLang]?.loadingWord || 'Loading Word...'}</h2>`;
    
    try {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        
        const result = await mammoth.convertToHtml({arrayBuffer: arrayBuffer});
        
        viewerBody.innerHTML = `<div style="padding: 40px; background: white; max-width: 800px; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            ${result.value}
        </div>`;
    } catch (e) {
        const errorText = translations[currentLang]?.errorLoading || 'An error occurred: ';
        viewerBody.innerHTML = `<h2 style="color:red">${errorText}${e.message}</h2>`;
    }
}
