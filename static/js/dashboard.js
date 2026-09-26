/**
 * NirvaPay Dashboard UI Engine
 * High Performance, Single Page Tabs, Zero Slop
 */

let activeTab = 'ringkasan';
let autoRefreshTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadTabContent('ringkasan');
    initClipboard();
});

// 1. Tab Navigation Routing
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-tab-item');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.getAttribute('data-tab');
            if (tabName) {
                switchTab(tabName);
            }
        });
    });
}

function switchTab(tabName) {
    activeTab = tabName;
    document.querySelectorAll('.nav-tab-item').forEach(el => {
        if (el.getAttribute('data-tab') === tabName) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });

    document.querySelectorAll('.tab-section').forEach(sec => {
        if (sec.id === `section-${tabName}`) {
            sec.classList.remove('hidden');
        } else {
            sec.classList.add('hidden');
        }
    });

    loadTabContent(tabName);
}

// 2. Load Content per Tab
async function loadTabContent(tab) {
    switch (tab) {
        case 'ringkasan':
            await fetchSummaryMetrics();
            break;
        case 'pembayaran':
            await fetchInvoices();
            break;
        case 'mutasi':
            await fetchMutations();
            break;
        case 'koneksi':
            await fetchMerchantConnections();
            break;
        case 'apikeys':
            await fetchApiKeys();
            break;
        case 'webhooks':
            await fetchWebhooks();
            break;
    }
}

// 3. API Calls
async function fetchSummaryMetrics() {
    try {
        const res = await fetch('/api/v1/dashboard/summary');
        const data = await res.json();
        if (data.success) {
            document.getElementById('metric-omset-today').textContent = formatRupiah(data.omset_today);
            document.getElementById('metric-omset-month').textContent = formatRupiah(data.omset_month);
            document.getElementById('metric-total-paid').textContent = data.total_paid_count.toLocaleString('id-ID');
            document.getElementById('metric-pending-count').textContent = data.pending_count.toLocaleString('id-ID');
            document.getElementById('metric-success-rate').textContent = `${data.success_rate}%`;

            renderRecentActivity(data.recent_invoices);
        }
    } catch (err) {
        console.error('Failed to load metrics:', err);
    }
}

function renderRecentActivity(invoices) {
    const tbody = document.getElementById('recent-invoices-tbody');
    if (!tbody) return;
    if (!invoices || invoices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">Belum ada aktivitas transaksi hari ini.</td></tr>`;
        return;
    }

    tbody.innerHTML = invoices.map(inv => `
        <tr>
            <td class="mono font-semibold text-slate-900">${inv.invoice_id}</td>
            <td>${inv.customer_name}</td>
            <td class="mono font-bold text-purple-900">${formatRupiah(inv.total_amount)}</td>
            <td><span class="badge-${inv.status === 'PAID' ? 'success' : (inv.status === 'PENDING' ? 'pending' : 'gold')}">${inv.status}</span></td>
            <td>${inv.payment_channel}</td>
            <td class="text-xs text-slate-500">${new Date(inv.created_at).toLocaleTimeString('id-ID')}</td>
        </tr>
    `).join('');
}

async function fetchInvoices() {
    try {
        const res = await fetch('/api/v1/invoices');
        const data = await res.json();
        const tbody = document.getElementById('invoices-tbody');
        if (!tbody) return;

        if (!data.invoices || data.invoices.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">Belum ada data pembayaran.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.invoices.map(inv => `
            <tr>
                <td class="mono font-semibold text-slate-900">${inv.invoice_id}</td>
                <td>
                    <div class="font-medium text-slate-800">${inv.customer_name}</div>
                    <div class="text-xs text-slate-400">${inv.description || '-'}</div>
                </td>
                <td class="mono font-bold text-purple-950">${formatRupiah(inv.total_amount)}</td>
                <td><span class="badge-${inv.status === 'PAID' ? 'success' : (inv.status === 'PENDING' ? 'pending' : 'gold')}">${inv.status}</span></td>
                <td><span class="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 font-semibold">${inv.payment_channel}</span></td>
                <td class="text-xs text-slate-500">${new Date(inv.created_at).toLocaleString('id-ID')}</td>
                <td>
                    <div class="flex items-center gap-2">
                        <a href="/pay/${inv.invoice_id}" target="_blank" class="px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition">Buka Pay Link</a>
                        <button onclick="copyToClipboard('${window.location.origin}/pay/${inv.invoice_id}')" class="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition">Salin Link</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function fetchMutations() {
    try {
        const res = await fetch('/api/v1/mutations');
        const data = await res.json();
        const tbody = document.getElementById('mutations-tbody');
        if (!tbody) return;

        if (!data.mutations || data.mutations.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400">Belum ada mutasi masuk terdeteksi.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.mutations.map(m => `
            <tr>
                <td><span class="badge-purple font-bold">${m.channel}</span></td>
                <td class="mono font-bold text-emerald-700">+${formatRupiah(m.amount)}</td>
                <td class="text-xs text-slate-600 max-w-xs truncate">${m.raw_text || '-'}</td>
                <td>
                    ${m.is_matched 
                        ? `<span class="badge-success">Matched: ${m.matched_invoice_id}</span>` 
                        : `<span class="badge-pending">Unmatched</span>`}
                </td>
                <td class="text-xs text-slate-500">${new Date(m.created_at).toLocaleString('id-ID')}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function fetchMerchantConnections() {
    try {
        const res = await fetch('/api/v1/connections');
        const data = await res.json();
        const container = document.getElementById('connections-container');
        if (!container) return;

        container.innerHTML = data.connections.map(c => `
            <div class="card-solid p-5 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="font-bold text-slate-900">${c.name}</span>
                        <span class="badge-${c.is_active ? 'success' : 'gold'}">${c.status_text}</span>
                    </div>
                    <p class="text-xs text-slate-500 mb-4">Channel: <code class="mono text-purple-700">${c.channel}</code></p>
                </div>
                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span class="text-xs text-slate-400">Auto Polling Sync</span>
                    <button onclick="testConnection('${c.channel}')" class="px-3 py-1.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition">Tes Sinyal</button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function fetchApiKeys() {
    try {
        const res = await fetch('/api/v1/apikeys');
        const data = await res.json();
        const tbody = document.getElementById('apikeys-tbody');
        if (!tbody) return;

        tbody.innerHTML = data.api_keys.map(k => `
            <tr>
                <td class="font-bold text-slate-900">${k.name}</td>
                <td><span class="badge-${k.is_sandbox ? 'gold' : 'purple'}">${k.is_sandbox ? 'Sandbox' : 'Production'}</span></td>
                <td>
                    <div class="flex items-center gap-2">
                        <code class="mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded">${k.public_key}</code>
                        <button onclick="copyToClipboard('${k.public_key}')" class="text-slate-400 hover:text-purple-700"><i class="fa-solid fa-copy"></i></button>
                    </div>
                </td>
                <td>
                    <div class="flex items-center gap-2">
                        <code class="mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded">${k.secret_key.substring(0, 8)}********</code>
                        <button onclick="copyToClipboard('${k.secret_key}')" class="text-slate-400 hover:text-purple-700"><i class="fa-solid fa-copy"></i></button>
                    </div>
                </td>
                <td><span class="badge-success">Active</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function fetchWebhooks() {
    try {
        const res = await fetch('/api/v1/webhooks');
        const data = await res.json();
        const tbody = document.getElementById('webhooks-tbody');
        if (!tbody) return;

        if (!data.webhooks || data.webhooks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-400">Belum ada webhook endpoint yang didaftarkan.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.webhooks.map(w => `
            <tr>
                <td class="mono font-semibold text-slate-800">${w.url}</td>
                <td class="mono text-xs text-slate-500">${w.secret_key}</td>
                <td><span class="badge-purple">payment.paid</span></td>
                <td><span class="badge-success">Active</span></td>
                <td>
                    <button onclick="testWebhookPing('${w.id}')" class="px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition">Kirim Tes Ping</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

// 4. Modals & Actions
function openCreateInvoiceModal() {
    document.getElementById('modal-create-invoice').classList.remove('hidden');
}

function closeCreateInvoiceModal() {
    document.getElementById('modal-create-invoice').classList.add('hidden');
}

async function submitCreateInvoice(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-submit-invoice');
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Membuat Tagihan...`;

    const payload = {
        amount: parseFloat(document.getElementById('inp-amount').value),
        customer_name: document.getElementById('inp-customer-name').value,
        customer_phone: document.getElementById('inp-customer-phone').value,
        description: document.getElementById('inp-description').value,
        payment_channel: "QRIS",
    };

    try {
        const res = await fetch('/api/v1/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
            showToast('Invoice berhasil dibuat!');
            closeCreateInvoiceModal();
            fetchInvoices();
            window.open(`/pay/${data.invoice.invoice_id}`, '_blank');
        } else {
            alert(data.message || 'Gagal membuat invoice');
        }
    } catch (err) {
        alert('Terjadi kesalahan jaringan');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `Buat Tagihan QRIS`;
    }
}

// 5. Utilities
function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(num || 0);
}

function initClipboard() {
    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Teks disalin ke clipboard!');
        });
    };
}

function showToast(msg) {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-yellow-400"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 2800);
}

function createToastContainer() {
    const div = document.createElement('div');
    div.id = 'toast-container';
    div.className = 'toast-container';
    document.body.appendChild(div);
    return div;
}

// Logout
async function handleLogout() {
    if (!confirm('Apakah Anda yakin ingin keluar dari console?')) return;
    try {
        await fetch('/api/v1/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (e) {
        window.location.href = '/login';
    }
}

// Simulator Test Mutation
async function simulateIncomingMutation() {
    const amount = prompt("Masukkan nominal mutasi untuk simulasi (Contoh: 15234):", "15000");
    if (!amount) return;

    try {
        const res = await fetch('/webhook/gopay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Secret-Key': 'AeternumGoBiz2026Secret'
            },
            body: JSON.stringify({
                title: "GoBiz",
                text: `Pembayaran QRIS sebesar Rp ${parseInt(amount).toLocaleString('id-ID')} berhasil diterima`,
                amount: parseInt(amount)
            })
        });
        const data = await res.json();
        showToast(data.matched ? `Mutasi Berhasil Match ke Invoice ${data.invoice_id}` : `Mutasi Diterima (Unmatched)`);
        fetchMutations();
        fetchSummaryMetrics();
    } catch (err) {
        alert("Gagal mengirim simulasi mutasi");
    }
}
