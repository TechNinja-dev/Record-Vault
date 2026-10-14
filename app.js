// Transaction Record Mobile App Engine

// Auto-detect Localhost vs Live Render Production
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
  ? 'http://127.0.0.1:8000'
  : 'https://transaction-record.onrender.com';

// App Local State
let state = {
  currentDate: new Date(),
  transactions: []
};

// --- Month & Date Calculation Engine ---
function calculateMonthAndDates(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const monthIndex = dateObj.getMonth(); // 0-11
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentMonthName = monthNames[monthIndex];
  
  // Format Today's Date: YYYY-MM-DD & Mobile Calendar format (e.g., 28 May 2026)
  const dayNum = String(dateObj.getDate()).padStart(2, '0');
  const monthNum = String(monthIndex + 1).padStart(2, '0');
  const formattedToday = `${year}-${monthNum}-${dayNum}`;
  const shortMonth = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const mobileCalendarDate = `${dateObj.getDate()} ${shortMonth} ${year}`;
  const humanToday = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  // Calculate Month End Date using JS Date logic (0th day of next month)
  const lastDayObj = new Date(year, monthIndex + 1, 0);
  const lastDayNumber = lastDayObj.getDate(); // e.g. 31 for Aug, 30 for Sep, 28/29 for Feb
  const formattedMonthEnd = `${year}-${monthNum}-${String(lastDayNumber).padStart(2, '0')}`;
  const humanMonthEnd = `${currentMonthName.substring(0, 3)} ${lastDayNumber}, ${year}`;
  
  const daysLeft = lastDayNumber - dateObj.getDate();

  return {
    year,
    monthIndex,
    monthName: currentMonthName,
    todayIso: formattedToday,
    mobileCalendarDate: mobileCalendarDate,
    todayHuman: humanToday,
    timeStr,
    monthEndIso: formattedMonthEnd,
    monthEndHuman: humanMonthEnd,
    lastDayNumber,
    daysLeft
  };
}

// Helper to format ISO or raw dates to Mobile Calendar format (e.g., 28 May 2026)
function formatMobileDate(rawDate) {
  if (!rawDate) return '';
  if (/^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}$/.test(rawDate)) return rawDate;
  
  const parts = String(rawDate).split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (monthNames[monthIdx]) {
      return `${day} ${monthNames[monthIdx]} ${year}`;
    }
  }

  const d = new Date(rawDate);
  if (!isNaN(d.getTime())) {
    const day = d.getDate();
    const shortMonth = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${shortMonth} ${year}`;
  }

  return rawDate;
}

// Handle Interactive Month Change Filter
function handleMonthChange(selectedMonth) {
  state.selectedMonth = selectedMonth;
  
  const dropdown1 = document.getElementById('month-select-dropdown');
  const dropdown2 = document.getElementById('month-select-dropdown-view');
  if (dropdown1 && dropdown1.value !== selectedMonth) dropdown1.value = selectedMonth;
  if (dropdown2 && dropdown2.value !== selectedMonth) dropdown2.value = selectedMonth;
  
  const dateData = calculateMonthAndDates(state.currentDate);
  
  const headerSub = document.getElementById('header-subtitle');
  if (headerSub) headerSub.innerText = `${selectedMonth} ${dateData.year}`;
  
  const daysLeftNote = document.getElementById('days-left-count');
  if (daysLeftNote) {
    if (selectedMonth.toLowerCase() === dateData.monthName.toLowerCase()) {
      daysLeftNote.innerText = `${dateData.daysLeft} days remaining in ${dateData.monthName}`;
    } else {
      daysLeftNote.innerText = `Viewing records for ${selectedMonth}`;
    }
  }

  fetchAndRenderTransactions();
}

// Update Header & Date Card in DOM
function renderDateInfo() {
  const dateData = calculateMonthAndDates(state.currentDate);
  const activeMonth = state.selectedMonth || dateData.monthName;
  
  // Update header text
  const headerSub = document.getElementById('header-subtitle');
  if (headerSub) headerSub.innerText = `${activeMonth} ${dateData.year}`;
  
  // Synchronize month select dropdowns
  const dropdown1 = document.getElementById('month-select-dropdown');
  const dropdown2 = document.getElementById('month-select-dropdown-view');
  if (dropdown1) dropdown1.value = activeMonth;
  if (dropdown2) dropdown2.value = activeMonth;
  
  // Update Date Card UI
  const dateMain = document.getElementById('display-date-main');
  if (dateMain) dateMain.innerText = dateData.todayHuman;
  
  const daysLeftNote = document.getElementById('days-left-count');
  if (daysLeftNote) {
    if (activeMonth.toLowerCase() === dateData.monthName.toLowerCase()) {
      daysLeftNote.innerText = `${dateData.daysLeft} days remaining in ${dateData.monthName}`;
    } else {
      daysLeftNote.innerText = `Viewing records for ${activeMonth}`;
    }
  }

  // Readonly form preview values
  const formAutoDate = document.getElementById('form-auto-date');
  if (formAutoDate) formAutoDate.innerText = `${dateData.mobileCalendarDate} (${dateData.timeStr})`;
  
  const formAutoMonthEnd = document.getElementById('form-auto-monthend');
  if (formAutoMonthEnd) formAutoMonthEnd.innerText = dateData.monthEndIso;
}

// Navigation Tab Switcher
function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab-btn, .nav-item');
  const sections = document.querySelectorAll('.section-content');
  
  tabs.forEach(t => {
    if (t.dataset.tab === tabName) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });
  
  sections.forEach(s => {
    if (s.id === `section-${tabName}`) {
      s.classList.add('active');
    } else {
      s.classList.remove('active');
    }
  });
  
  if (tabName === 'view') {
    fetchAndRenderTransactions();
  }
}

// Toast Alert System
function showToast(message, isError = false) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (isError) toast.style.borderLeft = '4px solid #ef4444';
  
  toast.innerHTML = `
    <span>${isError ? '⚠️' : '✓'}</span>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Quick Chip Amount Helper
function setQuickAmount(amt) {
  const input = document.getElementById('input-amount');
  if (input) {
    const current = parseFloat(input.value) || 0;
    input.value = current + amt;
    input.focus();
  }
}

// Quick Category / Tag Selection Helper
function selectTag(tagName, el) {
  const hiddenInput = document.getElementById('input-tag');
  if (hiddenInput) hiddenInput.value = tagName;
  
  const tagChips = document.querySelectorAll('.tag-chip');
  tagChips.forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
}

// Quick Purpose Helper
function setQuickPurpose(category) {
  const input = document.getElementById('input-purpose');
  if (input) {
    input.value = category;
    input.focus();
  }
}

// Form Submission (Add Transaction)
async function handleAddTransaction(event) {
  event.preventDefault();
  
  const amtInput = document.getElementById('input-amount');
  const purposeInput = document.getElementById('input-purpose');
  const tagInput = document.getElementById('input-tag');
  const submitBtn = document.getElementById('btn-add-submit');
  
  const amountVal = parseFloat(amtInput.value);
  const purposeVal = purposeInput.value.trim();
  const tagVal = tagInput ? tagInput.value : 'Groceries';
  
  if (!amountVal || amountVal <= 0) {
    showToast("Please enter a valid transaction amount", true);
    return;
  }
  
  if (!purposeVal) {
    showToast("Please enter the purpose of transaction", true);
    return;
  }
  
  const dateInfo = calculateMonthAndDates(state.currentDate);
  
  const payload = {
    purpose: purposeVal,
    tag: tagVal,
    amt: amountVal,
    date: dateInfo.mobileCalendarDate,
    time: dateInfo.timeStr,
    month: dateInfo.monthName,
    year: dateInfo.year,
    month_end_date: dateInfo.monthEndIso
  };
  
  submitBtn.disabled = true;
  submitBtn.innerText = "Adding...";
  
  try {
    // Attempt POST to FastAPI backend
    const response = await fetch(`${API_BASE_URL}/insert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const resData = await response.json();
      showToast(resData.message || "Transaction added successfully!");
    } else {
      // Fallback response handling
      showToast("Added locally (Backend unavailable)");
    }
  } catch (err) {
    console.warn("Backend offline, saving transaction locally in UI:", err);
    showToast("Transaction saved successfully!");
  } finally {
    // Save to local UI state for instant rendering
    state.transactions.unshift(payload);
    
    // Reset Form
    amtInput.value = '';
    purposeInput.value = '';
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Add Transaction
    `;
    
    // Switch to view tab after adding
    setTimeout(() => switchTab('view'), 400);
  }
}

// Fetch & Render Transactions in View Section
async function fetchAndRenderTransactions() {
  const dateInfo = calculateMonthAndDates(state.currentDate);
  const activeMonth = state.selectedMonth || dateInfo.monthName;
  const tagSelect = document.getElementById('tag-filter-select');
  const selectedTag = tagSelect ? tagSelect.value : 'all';
  
  let fetchUrl = `${API_BASE_URL}/view?month=${encodeURIComponent(activeMonth)}&year=${dateInfo.year}`;
  if (selectedTag && selectedTag.toLowerCase() !== 'all') {
    fetchUrl += `&tag=${encodeURIComponent(selectedTag)}`;
  }
  
  try {
    const response = await fetch(fetchUrl);
    if (response.ok) {
      const serverData = await response.json();
      
      // Handle { view: [...], tot_cnt: { cnt, tot, t_exp } } response format
      if (serverData && serverData.view !== undefined) {
        if (Array.isArray(serverData.view)) {
          state.transactions = serverData.view;
        } else if (serverData.view && typeof serverData.view === 'object') {
          state.transactions = [serverData.view];
        } else {
          state.transactions = [];
        }
      } else if (Array.isArray(serverData)) {
        state.transactions = serverData;
      }

      if (serverData && serverData.tot_cnt) {
        state.serverTotCnt = serverData.tot_cnt;
      } else {
        state.serverTotCnt = null;
      }
    }
  } catch (err) {
    console.log("Using cached/local transactions list.");
  }
  
  renderTransactionList();
}

function renderTransactionList() {
  const feedContainer = document.getElementById('transaction-feed');
  const totalAmountEl = document.getElementById('stat-total-amount');
  const countEl = document.getElementById('stat-count');
  const avgEl = document.getElementById('stat-avg');
  const tagSelect = document.getElementById('tag-filter-select');
  
  if (!feedContainer) return;
  
  const dateInfo = calculateMonthAndDates(state.currentDate);
  const activeMonth = state.selectedMonth || dateInfo.monthName;
  const selectedTag = tagSelect ? tagSelect.value : 'all';
  
  // Filter for selected month
  let monthTx = state.transactions.filter(t => 
    !t.month || t.month.toLowerCase() === activeMonth.toLowerCase()
  );

  // Filter for selected tag area if set
  if (selectedTag && selectedTag.toLowerCase() !== 'all') {
    monthTx = monthTx.filter(t => t.tag && t.tag.toLowerCase() === selectedTag.toLowerCase());
  }
  
  // Calculate Totals (prefers backend summary tot_cnt if available and showing all tags)
  let totalSpent = monthTx.reduce((sum, t) => sum + (parseFloat(t.amt) || 0), 0);
  let count = monthTx.length;

  if (state.serverTotCnt && (selectedTag === 'all' || !selectedTag)) {
    if (typeof state.serverTotCnt.tot === 'number') {
      totalSpent = state.serverTotCnt.tot;
    } else if (typeof state.serverTotCnt.t_exp === 'number') {
      totalSpent = state.serverTotCnt.t_exp;
    }
    
    if (typeof state.serverTotCnt.cnt === 'number') {
      count = state.serverTotCnt.cnt;
    }
  }
  
  const avg = count > 0 ? Math.round(totalSpent / count) : 0;
  
  if (totalAmountEl) totalAmountEl.innerText = `₹${totalSpent.toLocaleString('en-IN')}`;
  if (countEl) countEl.innerText = count;
  if (avgEl) avgEl.innerText = `₹${avg.toLocaleString('en-IN')}`;
  
  if (monthTx.length === 0) {
    feedContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💸</div>
        <div class="empty-text">No ${selectedTag !== 'all' ? selectedTag : ''} transactions recorded for ${activeMonth}</div>
      </div>
    `;
    return;
  }
  
  feedContainer.innerHTML = monthTx.map(tx => `
    <div class="tx-card">
      <div class="tx-left">
        <div class="tx-icon">💳</div>
        <div class="tx-details">
          <span class="tx-purpose">${escapeHtml(tx.purpose)}</span>
          <div class="tx-meta">
            <span>${formatMobileDate(tx.date || dateInfo.mobileCalendarDate)}</span>
            <span>•</span>
            <span class="tx-tag-badge">${escapeHtml(tx.tag || 'General')}</span>
          </div>
        </div>
      </div>
      <div class="tx-amount">- ₹${(parseFloat(tx.amt) || 0).toLocaleString('en-IN')}</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, function (m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}

// Export Monthly Transactions Statement as PDF
function downloadMonthlyPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast("PDF generator loading... Please try again in a moment.", true);
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const dateInfo = calculateMonthAndDates(state.currentDate);
  const activeMonth = state.selectedMonth || dateInfo.monthName;
  const year = dateInfo.year;

  // Filter transactions for selected month
  let monthTx = state.transactions.filter(t => 
    !t.month || t.month.toLowerCase() === activeMonth.toLowerCase()
  );

  if (monthTx.length === 0) {
    showToast(`No transactions recorded to export for ${activeMonth}`, true);
    return;
  }

  // Parse and sort chronologically from starting date of month to last date
  monthTx.sort((a, b) => {
    const parseDateStr = (dStr) => {
      if (!dStr) return new Date(0);
      const parts = String(dStr).split(' ');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mIdx = monthNames.findIndex(m => m.toLowerCase() === parts[1].substring(0, 3).toLowerCase());
        const y = parseInt(parts[2], 10);
        if (mIdx !== -1) return new Date(y, mIdx, day);
      }
      return new Date(dStr);
    };
    return parseDateStr(a.date) - parseDateStr(b.date);
  });

  const totalSpent = monthTx.reduce((sum, t) => sum + (parseFloat(t.amt) || 0), 0);
  const count = monthTx.length;
  const avg = count > 0 ? Math.round(totalSpent / count) : 0;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Matte dark slate header
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text("RECORD VAULT", 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Monthly Transaction Statement • ${activeMonth} ${year}`, 14, 28);

  doc.setFontSize(8);
  doc.text(`Generated: ${dateInfo.mobileCalendarDate}`, 196, 28, { align: 'right' });

  // Summary Stat Cards
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 44, 56, 22, 3, 3, 'FD');
  doc.roundedRect(77, 44, 56, 22, 3, 3, 'FD');
  doc.roundedRect(140, 44, 56, 22, 3, 3, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text("TOTAL OUTFLOW", 18, 51);
  doc.text("TRANSACTIONS", 81, 51);
  doc.text("AVG PER TRANSACTION", 144, 51);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${totalSpent.toLocaleString('en-IN')}`, 18, 60);
  doc.text(`${count}`, 81, 60);
  doc.text(`INR ${avg.toLocaleString('en-IN')}`, 144, 60);

  // Table Data Columns & Rows
  const tableColumn = ["#", "Date & Time", "Purpose / Note", "Tag / Area", "Amount"];
  const tableRows = monthTx.map((tx, idx) => [
    idx + 1,
    `${formatMobileDate(tx.date || dateInfo.mobileCalendarDate)} ${tx.time || ''}`.trim(),
    tx.purpose || '-',
    tx.tag || 'General',
    `INR ${(parseFloat(tx.amt) || 0).toLocaleString('en-IN')}`
  ]);

  doc.autoTable({
    startY: 72,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 70 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    }
  });

  // Footer Signature Line
  const finalY = doc.lastAutoTable.finalY || 150;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, finalY + 12, 196, finalY + 12);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text("Record Vault Monthly Statement — Official Record", 14, finalY + 18);
  doc.text(`Page 1 of 1`, 196, finalY + 18, { align: 'right' });

  // Download PDF
  const fileName = `RecordVault_${activeMonth}_${year}_Statement.pdf`;
  doc.save(fileName);
  showToast(`Statement exported: ${fileName}`);
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  renderDateInfo();
  
  const form = document.getElementById('add-transaction-form');
  if (form) {
    form.addEventListener('submit', handleAddTransaction);
  }
  
  renderTransactionList();

  // Keep-Alive Heartbeat every 60 seconds (1 minute) to keep Render backend awake
  setInterval(async () => {
    try {
      await fetch(`${API_BASE_URL}/ping`);
    } catch (e) {
      // Silent catch for offline or initial loading states
    }
  }, 60000);
});

