let bills = JSON.parse(localStorage.getItem('bills') || '[]');
let selectedFile = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    renderBills();
    updateStats();
    setupDragAndDrop();
});

function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

function handleFileSelect(file) {
    selectedFile = file;
    document.getElementById('uploadBtn').disabled = false;
    
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="upload-icon">✅</div>
        <div class="upload-text">Ready to upload: ${file.name}</div>
        <div class="upload-subtext">File size: ${(file.size / 1024 / 1024).toFixed(2)} MB</div>
    `;
}

function uploadFile() {
    if (!selectedFile) return;

    const status = document.getElementById('processingStatus');
    status.className = 'processing-status processing';
    status.innerHTML = `
        <div class="loading-spinner"></div>
        <strong>Processing ${selectedFile.name}...</strong>
        <p>Extracting text and parsing bill details</p>
    `;

    // TODO: Replace with actual API call to Django backend
    // For now, simulate processing delay
    setTimeout(() => {
        const mockBill = {
            id: Date.now(),
            filename: selectedFile.name,
            vendor: getRandomVendor(),
            amount: (Math.random() * 500 + 50).toFixed(2),
            date: new Date().toISOString().split('T')[0],
            category: 'utilities',
            processed: true
        };

        bills.unshift(mockBill);
        localStorage.setItem('bills', JSON.stringify(bills));

        status.className = 'processing-status success';
        status.innerHTML = `
            <strong>✅ Processing Complete!</strong>
            <p>Found: ${mockBill.vendor} - $${mockBill.amount}</p>
        `;

        renderBills();
        updateStats();
        resetUploadArea();

        // Hide success message after 3 seconds
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }, 2000);
}

// API function to upload file to Django backend
async function uploadToAPI(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'utilities'); // Default category

    try {
        const response = await fetch('/api/upload/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCsrfToken(), // Django CSRF protection
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}

// Get Django CSRF token
function getCsrfToken() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    return cookieValue;
}

function getRandomVendor() {
    const vendors = ['Electric Company', 'Gas & Power', 'Internet Provider', 'Water Utility', 'Phone Company', 'Insurance Corp'];
    return vendors[Math.floor(Math.random() * vendors.length)];
}

function resetUploadArea() {
    selectedFile = null;
    document.getElementById('uploadBtn').disabled = true;
    document.getElementById('fileInput').value = '';
    
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="upload-icon">📁</div>
        <div class="upload-text">Drop your bill here or click to browse</div>
        <div class="upload-subtext">Supports PDF, JPG, PNG files</div>
    `;
}

function renderBills() {
    const billsList = document.getElementById('billsList');
    
    if (bills.length === 0) {
        billsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No bills uploaded yet</p>
                <p style="font-size: 0.9em; margin-top: 5px;">Upload your first bill to get started</p>
            </div>
        `;
        return;
    }

    billsList.innerHTML = bills.map(bill => `
        <div class="bill-item">
            <div class="bill-info">
                <div class="bill-vendor">${bill.vendor}</div>
                <div class="bill-date">${new Date(bill.date).toLocaleDateString()}</div>
            </div>
            <div class="bill-amount">$${bill.amount}</div>
        </div>
    `).join('');
}

function updateStats() {
    const totalBills = bills.length;
    const totalAmount = bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
    const thisMonth = bills.filter(bill => {
        const billDate = new Date(bill.date);
        const now = new Date();
        return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
    }).length;

    document.getElementById('totalBills').textContent = totalBills;
    document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    document.getElementById('thisMonth').textContent = thisMonth;
}

// Load bills from API on page load
async function loadBillsFromAPI() {
    try {
        const response = await fetch('/api/bills/');
        if (response.ok) {
            const data = await response.json();
            bills = data.bills || [];
            renderBills();
            updateStats();
        }
    } catch (error) {
        console.error('Failed to load bills from API:', error);
        // Fall back to localStorage data
    }
}

// Clear data function (for testing)
function clearData() {
    if (confirm('Clear all bills data?')) {
        bills = [];
        localStorage.removeItem('bills');
        renderBills();
        updateStats();
    }
}

// Add keyboard shortcut for clearing data (Ctrl+Shift+D)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        clearData();
    }
});