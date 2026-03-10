// ══════════════════════════════════════
// DATA — fetched from server or mocked
// ══════════════════════════════════════
const SERVER = 'https://drpatoz-production.up.railway.app';

let allBookings = [];
let allClients  = [];
let allMessages = [];
let selectedBookingId = null;
let bookingFilter = 'all';
let typeFilter = '';
let paymentFilter = '';

// ── Seed mock data (used when server is offline) ──
const mockBookings = [
{ id:1,  first_name:'Njeri',   last_name:'Kamau',   email:'njeri@mail.com',    phone:'0712111222', session_type:'Individual Therapy',       session_date:'2026-03-09', session_time:'9:00 AM',  amount:6000, status:'confirmed', payment_status:'paid' },
{ id:2,  first_name:'David',   last_name:'Mutua',   email:'david@mail.com',    phone:'0723333444', session_type:'Couples Therapy',           session_date:'2026-03-09', session_time:'11:00 AM', amount:8500, status:'confirmed', payment_status:'paid' },
{ id:3,  first_name:'Amina',   last_name:'Farah',   email:'amina@mail.com',    phone:'0734555666', session_type:'Online Session',            session_date:'2026-03-09', session_time:'2:00 PM',  amount:5500, status:'pending',   payment_status:'unpaid' },
{ id:4,  first_name:'Kipchoge',last_name:'Ruto',    email:'kip@mail.com',      phone:'0745667788', session_type:'Consultation / First Visit', session_date:'2026-03-09', session_time:'4:00 PM',  amount:3000, status:'pending',   payment_status:'unpaid' },
{ id:5,  first_name:'Grace',   last_name:'Wanjiru', email:'grace@mail.com',    phone:'0756789900', session_type:'Anxiety & Stress',          session_date:'2026-03-10', session_time:'10:00 AM', amount:6000, status:'confirmed', payment_status:'paid' },
{ id:6,  first_name:'Samuel',  last_name:'Otieno',  email:'samuel@mail.com',   phone:'0767890011', session_type:'Individual Therapy',         session_date:'2026-03-11', session_time:'1:00 PM',  amount:6000, status:'cancelled', payment_status:'unpaid' },
{ id:7,  first_name:'Aisha',   last_name:'Hassan',  email:'aisha@mail.com',    phone:'0778901122', session_type:'Mindfulness-Based Therapy',  session_date:'2026-03-12', session_time:'3:00 PM',  amount:6000, status:'pending',   payment_status:'unpaid' },
];

const mockClients = [
{ id:1, first_name:'Njeri',    last_name:'Kamau',   email:'njeri@mail.com',   phone:'0712111222', notes:'Anxiety, CBT focus', created_at:'2025-09-01' },
{ id:2, first_name:'David',    last_name:'Mutua',   email:'david@mail.com',   phone:'0723333444', notes:'Couples sessions', created_at:'2025-10-15' },
{ id:3, first_name:'Amina',    last_name:'Farah',   email:'amina@mail.com',   phone:'0734555666', notes:'Online only', created_at:'2025-11-20' },
{ id:4, first_name:'Grace',    last_name:'Wanjiru', email:'grace@mail.com',   phone:'0756789900', notes:'Stress management', created_at:'2026-01-05' },
{ id:5, first_name:'Samuel',   last_name:'Otieno',  email:'samuel@mail.com',  phone:'0767890011', notes:'', created_at:'2026-02-10' },
];

const mockMessages = [
{ id:1, name:'Lena Mwangi',  email:'lena@mail.com',   message:'Hi, I would like to enquire about your availability for couples sessions next week.', created_at:'2026-03-09', unread:true },
{ id:2, name:'Tom Kirui',    email:'tom@mail.com',    message:'Thank you for the wonderful session yesterday. I feel much better already!', created_at:'2026-03-08', unread:true },
{ id:3, name:'Zara Odhiambo',email:'zara@mail.com',   message:'Could I get a receipt for my last payment please?', created_at:'2026-03-07', unread:false },
{ id:4, name:'Ben Ndung\'u', email:'ben@mail.com',    message:'I need to reschedule my session on Friday. Is 3pm available?', created_at:'2026-03-06', unread:false },
];

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const revenueData = [18000,22000,31000,27000,35000,41000,38000,44000,29000,33000,48000,28000];
const revenueLast = [12000,18000,22000,20000,28000,35000,30000,38000,25000,29000,42000,22000];

// ══════════════════════════════════════
// INIT — parallel load + cache
// ══════════════════════════════════════
let _initialized = false;

async function init() {
if (_initialized) return; // prevent double-init on re-login
_initialized = true;

// Show skeleton immediately
showSkeletonStats();

// Load data and render in parallel
await loadData();

// Render all at once after data is ready
renderDashboard();
renderBookings();
renderClients();
renderMessages();
renderChart();
}

function showSkeletonStats() {
['stat-total','stat-revenue','stat-pending','stat-clients'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '<span style="opacity:0.3">—</span>';
});
}

async function loadData() {
try {
  const [bRes, cRes, mRes] = await Promise.all([
    fetch(`${SERVER}/api/bookings`),
    fetch(`${SERVER}/api/clients`),
    fetch(`${SERVER}/api/messages`)
  ]);
  if (bRes.ok) allBookings = await bRes.json();
  else allBookings = mockBookings;
  if (cRes.ok) allClients = await cRes.json();
  else allClients = mockClients;
  if (mRes.ok) allMessages = await mRes.json();
  else allMessages = mockMessages;
} catch {
  allBookings = mockBookings;
  allClients  = mockClients;
  allMessages = mockMessages;
}
}

// ══════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════
const pageTitles = {
dashboard: ['Overview',  'Monday, 9 March 2026'],
bookings:  ['Bookings',  'Manage all client appointments'],
clients:   ['Clients',   'Your client roster'],
messages:  ['Messages',  'Client enquiries & contact'],
revenue:   ['Revenue',   'Financial summary'],
settings:  ['Settings',  'Practice configuration'],
};

function showPage(page, el) {
document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
document.getElementById('page-' + page).classList.add('active');

if (el) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}

const [title, sub] = pageTitles[page] || ['Dashboard', ''];
document.getElementById('page-title').textContent = title;
document.getElementById('page-sub').textContent   = sub;
}

// ══════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════
function renderDashboard() {
const total   = allBookings.length;
const pending = allBookings.filter(b => b.status === 'pending').length;
const revenue = allBookings.filter(b => b.payment_status === 'paid').reduce((s,b) => s + (b.amount||0), 0);
const clients = allClients.length;

document.getElementById('stat-total').textContent   = total;
document.getElementById('stat-revenue').textContent = (revenue/1000).toFixed(0) + 'K';
document.getElementById('stat-pending').textContent = pending;
document.getElementById('stat-clients').textContent = clients;
document.getElementById('pending-count').textContent = pending;

// Today
const today = new Date().toISOString().split('T')[0];
const todaySessions = allBookings.filter(b => b.session_date === today);
document.getElementById('today-count').textContent = todaySessions.length;

// Today schedule
const sched = document.getElementById('today-schedule');
if (todaySessions.length === 0) {
  sched.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div>No sessions today</div>';
} else {
  sched.innerHTML = todaySessions
    .sort((a,b) => a.session_time.localeCompare(b.session_time))
    .map(b => {
      const dotClass = b.status === 'confirmed' ? (b.session_type.toLowerCase().includes('online') ? 'online' : 'confirmed') : 'pending';
      return `<div class="schedule-item" onclick="openBookingModal(${b.id})">
        <div class="schedule-time">${b.session_time}</div>
        <div class="schedule-dot ${dotClass}"></div>
        <div>
          <div class="schedule-name">${b.first_name} ${b.last_name}</div>
          <div class="schedule-type">${b.session_type}</div>
        </div>
      </div>`;
    }).join('');
}

// Recent bookings (last 5)
const recent = [...allBookings].slice(-5).reverse();
document.getElementById('recent-bookings-body').innerHTML = recent.map(b => `
  <tr onclick="openBookingModal(${b.id})" style="cursor:pointer;">
    <td>
      <div class="client-cell">
        <div class="client-avatar">${b.first_name[0]}${b.last_name[0]}</div>
        <div>
          <div class="client-name">${b.first_name} ${b.last_name}</div>
        </div>
      </div>
    </td>
    <td>${b.session_type}</td>
    <td>${formatDate(b.session_date)}</td>
    <td><span class="badge badge-${b.status}">${cap(b.status)}</span></td>
  </tr>
`).join('');

// Messages
const msgList = document.getElementById('messages-list');
msgList.innerHTML = allMessages.slice(0,4).map(m => `
  <div class="msg-item ${m.unread ? 'unread' : ''}">
    <div class="msg-avatar">${m.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
    <div style="flex:1;min-width:0;">
      <div class="msg-name">${m.name}</div>
      <div class="msg-preview">${m.message}</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem;">
      <div class="msg-time">${formatMsgDate(m.created_at)}</div>
      ${m.unread ? '<div class="msg-unread-dot"></div>' : ''}
    </div>
  </div>
`).join('');
}

// ══════════════════════════════════════
// CHART
// ══════════════════════════════════════
function renderChart() {
const maxVal = Math.max(...revenueData, ...revenueLast);
const bars = document.getElementById('revenue-chart');
const labels = document.getElementById('chart-months');

bars.innerHTML = months.map((m,i) => {
  const h1 = Math.round((revenueData[i] / maxVal) * 110);
  const h2 = Math.round((revenueLast[i] / maxVal) * 110);
  return `<div class="chart-bar-wrap">
    <div style="display:flex;gap:2px;align-items:flex-end;height:110px;">
      <div class="chart-bar secondary" style="height:${h2}px;flex:1;" title="Last year: KES ${revenueLast[i].toLocaleString()}"></div>
      <div class="chart-bar primary" style="height:${h1}px;flex:1;" title="This year: KES ${revenueData[i].toLocaleString()}"></div>
    </div>
  </div>`;
}).join('');

labels.innerHTML = months.map(m => `<span class="chart-label">${m}</span>`).join('');
}

// ══════════════════════════════════════
// BOOKINGS PAGE
// ══════════════════════════════════════
function renderBookings(filter = bookingFilter) {
let data = [...allBookings];
if (filter !== 'all') data = data.filter(b => b.status === filter);
if (typeFilter)       data = data.filter(b => b.session_type === typeFilter);
if (paymentFilter)    data = data.filter(b => b.payment_status === paymentFilter);

const tbody = document.getElementById('all-bookings-body');
if (!data.length) {
  tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div>No bookings found</div></td></tr>';
  return;
}
tbody.innerHTML = data.map(b => `
  <tr>
    <td>
      <div class="client-cell">
        <div class="client-avatar">${b.first_name[0]}${b.last_name[0]}</div>
        <div>
          <div class="client-name">${b.first_name} ${b.last_name}</div>
          <div class="client-email">${b.email}</div>
        </div>
      </div>
    </td>
    <td>${b.session_type}</td>
    <td>${formatDate(b.session_date)} · ${b.session_time}</td>
    <td>KES ${(b.amount||0).toLocaleString()}</td>
    <td><span class="badge badge-${b.payment_status}">${cap(b.payment_status)}</span></td>
    <td><span class="badge badge-${b.status}">${cap(b.status)}</span></td>
    <td>
      <div class="action-btns">
        <button class="action-btn" onclick="openBookingModal(${b.id})">View</button>
        <button class="action-btn danger" onclick="quickCancel(${b.id})">Cancel</button>
      </div>
    </td>
  </tr>
`).join('');
}

function filterBookings(status, el) {
bookingFilter = status;
document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
if (el) el.classList.add('active');
renderBookings(status);
}

function filterByType(val)    { typeFilter = val; renderBookings(); }
function filterByPayment(val) { paymentFilter = val; renderBookings(); }

// ══════════════════════════════════════
// BOOKING MODAL
// ══════════════════════════════════════
function openBookingModal(id) {
const b = allBookings.find(b => b.id === id);
if (!b) return;
selectedBookingId = id;

document.getElementById('booking-modal-content').innerHTML = `
  <div class="modal-field"><label>Client</label><div class="value">${b.first_name} ${b.last_name}</div></div>
  <div class="modal-field"><label>Session Type</label><div class="value">${b.session_type}</div></div>
  <div class="modal-field"><label>Email</label><div class="value">${b.email}</div></div>
  <div class="modal-field"><label>Phone</label><div class="value">${b.phone||'—'}</div></div>
  <div class="modal-field"><label>Date</label><div class="value">${formatDate(b.session_date)}</div></div>
  <div class="modal-field"><label>Time</label><div class="value">${b.session_time}</div></div>
  <div class="modal-field"><label>Amount</label><div class="value">KES ${(b.amount||0).toLocaleString()}</div></div>
  <div class="modal-field"><label>Status</label><div class="value"><span class="badge badge-${b.status}">${cap(b.status)}</span></div></div>
  <div class="modal-field"><label>Payment</label><div class="value"><span class="badge badge-${b.payment_status}">${cap(b.payment_status)}</span></div></div>
  <div class="modal-field"><label>Booking ID</label><div class="value" style="color:var(--text-light);font-size:0.78rem;">#${b.id}</div></div>
`;
document.getElementById('booking-modal').classList.add('active');
}

async function confirmBooking() {
if (!selectedBookingId) return;
try {
  await fetch(`${SERVER}/api/bookings/${selectedBookingId}/status`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ status:'confirmed', payment_status:'paid' })
  });
} catch {}
const b = allBookings.find(b => b.id === selectedBookingId);
if (b) { b.status = 'confirmed'; b.payment_status = 'paid'; }
closeModal('booking-modal');
renderDashboard(); renderBookings();
showToast('Booking confirmed & marked as paid ✓');
}

async function cancelBooking() {
if (!selectedBookingId) return;
try {
  await fetch(`${SERVER}/api/bookings/${selectedBookingId}`, { method:'DELETE' });
} catch {}
const b = allBookings.find(b => b.id === selectedBookingId);
if (b) b.status = 'cancelled';
closeModal('booking-modal');
renderDashboard(); renderBookings();
showToast('Booking cancelled');
}

async function quickCancel(id) {
if (!confirm('Cancel this booking?')) return;
try { await fetch(`${SERVER}/api/bookings/${id}`, { method:'DELETE' }); } catch {}
const b = allBookings.find(b => b.id === id);
if (b) b.status = 'cancelled';
renderDashboard(); renderBookings();
showToast('Booking cancelled');
}

// ══════════════════════════════════════
// CLIENTS PAGE
// ══════════════════════════════════════
function renderClients() {
const tbody = document.getElementById('clients-body');
if (!allClients.length) {
  tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No clients yet</div></td></tr>';
  return;
}
tbody.innerHTML = allClients.map(c => {
  const sessions = allBookings.filter(b => b.email === c.email).length;
  const last     = allBookings.filter(b => b.email === c.email).slice(-1)[0];
  return `<tr>
    <td>
      <div class="client-cell">
        <div class="client-avatar">${c.first_name[0]}${(c.last_name||'')[0]||''}</div>
        <div>
          <div class="client-name">${c.first_name} ${c.last_name||''}</div>
          <div class="client-email">${c.email}</div>
        </div>
      </div>
    </td>
    <td>${c.phone||'—'}</td>
    <td>${sessions}</td>
    <td>${last ? formatDate(last.session_date) : '—'}</td>
    <td style="color:var(--text-light);font-size:0.8rem;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.notes||'—'}</td>
    <td><button class="action-btn">View</button></td>
  </tr>`;
}).join('');
}

function openNewClientModal() {
document.getElementById('client-modal').classList.add('active');
}

async function saveNewClient() {
const first = document.getElementById('nc-first').value.trim();
const last  = document.getElementById('nc-last').value.trim();
const email = document.getElementById('nc-email').value.trim();
const phone = document.getElementById('nc-phone').value.trim();
const notes = document.getElementById('nc-notes').value.trim();
if (!first || !email) { showToast('Name and email are required'); return; }

const newClient = { id: Date.now(), first_name:first, last_name:last, email, phone, notes };
try {
  const res = await fetch(`${SERVER}/api/clients`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(newClient)
  });
  if (res.ok) { const d = await res.json(); allClients.push(d.client); }
  else allClients.push(newClient);
} catch { allClients.push(newClient); }

closeModal('client-modal');
renderClients();
showToast('Client added successfully ✓');
}

// ══════════════════════════════════════
// MESSAGES PAGE
// ══════════════════════════════════════
function renderMessages() {
const unread = allMessages.filter(m => m.unread).length;
document.getElementById('msg-count').textContent = unread || '0';

const list = document.getElementById('all-messages-list');
list.innerHTML = allMessages.map(m => `
  <div class="msg-item ${m.unread ? 'unread' : ''}" onclick="markRead(${m.id}, this)" style="padding:1.2rem 1.5rem;">
    <div class="msg-avatar">${m.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
    <div style="flex:1;min-width:0;">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem;">
        <div class="msg-name">${m.name}</div>
        <div style="font-size:0.72rem;color:var(--text-light);">${m.email}</div>
      </div>
      <div style="font-size:0.83rem;color:var(--text);line-height:1.5;">${m.message}</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem;">
      <div class="msg-time">${formatMsgDate(m.created_at)}</div>
      ${m.unread ? '<div class="msg-unread-dot"></div>' : ''}
    </div>
  </div>
`).join('');
}

function markRead(id, el) {
const m = allMessages.find(m => m.id === id);
if (m) m.unread = false;
el.classList.remove('unread');
const unread = allMessages.filter(m => m.unread).length;
document.getElementById('msg-count').textContent = unread || '0';
}

// ══════════════════════════════════════
// SEARCH — debounced for performance
// ══════════════════════════════════════
let searchTimer = null;
function handleSearch(query) {
clearTimeout(searchTimer);
searchTimer = setTimeout(() => {
  if (!query) { renderBookings(); return; }
  const q = query.toLowerCase();
  const filtered = allBookings.filter(b =>
    (b.first_name + ' ' + b.last_name + ' ' + b.email + ' ' + b.session_type).toLowerCase().includes(q)
  );
  const tbody = document.getElementById('all-bookings-body');
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🔍</div>No results found for "' + query + '"</div></td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(b => `
    <tr>
      <td>
        <div class="client-cell">
          <div class="client-avatar">${b.first_name[0]}${b.last_name[0]}</div>
          <div>
            <div class="client-name">${b.first_name} ${b.last_name}</div>
            <div class="client-email">${b.email}</div>
          </div>
        </div>
      </td>
      <td>${b.session_type}</td>
      <td>${formatDate(b.session_date)} · ${b.session_time}</td>
      <td>KES ${(b.amount||0).toLocaleString()}</td>
      <td><span class="badge badge-${b.payment_status}">${cap(b.payment_status)}</span></td>
      <td><span class="badge badge-${b.status}">${cap(b.status)}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn" onclick="openBookingModal(${b.id})">View</button>
          <button class="action-btn danger" onclick="quickCancel(${b.id})">Cancel</button>
        </div>
      </td>
    </tr>
  `).join('');
  // Switch to bookings page to show results
  showPage('bookings', document.querySelector('.nav-item:nth-child(3)'));
}, 280);
}

// ══════════════════════════════════════
// EXPORT CSV
// ══════════════════════════════════════
function exportCSV() {
const rows = [['ID','First Name','Last Name','Email','Phone','Session Type','Date','Time','Amount','Status','Payment']];
allBookings.forEach(b => rows.push([
  b.id, b.first_name, b.last_name, b.email, b.phone,
  b.session_type, b.session_date, b.session_time, b.amount, b.status, b.payment_status
]));
const csv = rows.map(r => r.join(',')).join('\n');
const a = document.createElement('a');
a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
a.download = 'bookings-' + new Date().toISOString().split('T')[0] + '.csv';
a.click();
showToast('CSV exported ✓');
}

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function showToast(msg) {
const t = document.getElementById('toast');
document.getElementById('toast-msg').textContent = msg;
t.classList.add('show');
setTimeout(() => t.classList.remove('show'), 3000);
}

function formatDate(d) {
if (!d) return '—';
return new Date(d + 'T00:00:00').toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' });
}

function formatMsgDate(d) {
const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
if (diff === 0) return 'Today';
if (diff === 1) return 'Yesterday';
return diff + 'd ago';
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

// ── Close modals on overlay click ──
document.querySelectorAll('.modal-overlay').forEach(o => {
o.addEventListener('click', e => { if (e.target === o) o.classList.remove('active'); });
});

// ══════════════════════════════════════
// AUTH — Login & Session Management
// ══════════════════════════════════════

// Credentials (in production move these to server-side auth)
const ADMIN_CREDENTIALS = [
{ username: 'admin',    password: 'DrOsei2026!' },
{ username: 'dramarao', password: 'Amara@2026'  },
];

const SESSION_KEY     = 'dr_osei_admin_session';
const SESSION_HOURS   = 8;

function getSession() {
try {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  const s = JSON.parse(raw);
  // Check expiry
  if (Date.now() > s.expires) {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
  return s;
} catch { return null; }
}

function createSession(username) {
const session = {
  username,
  loggedIn: true,
  expires: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  loginTime: new Date().toISOString()
};
sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
return session;
}

function destroySession() {
sessionStorage.removeItem(SESSION_KEY);
location.reload();
}

function attemptLogin() {
const username = document.getElementById('login-user').value.trim();
const password = document.getElementById('login-pass').value;
const btn      = document.getElementById('login-btn');
const errEl    = document.getElementById('login-error');
const passEl   = document.getElementById('login-pass');
const userEl   = document.getElementById('login-user');

if (!username || !password) {
  errEl.textContent = 'Please enter your username and password.';
  errEl.classList.add('show');
  return;
}

// Disable button while "checking"
btn.disabled    = true;
btn.textContent = 'Signing in…';
errEl.classList.remove('show');

// Small delay for UX feel (simulates server check)
setTimeout(() => {
  const match = ADMIN_CREDENTIALS.find(
    c => c.username === username && c.password === password
  );

  if (match) {
    createSession(match.username);
    document.getElementById('login-screen').classList.add('hidden');
    // Update admin name in sidebar
    document.querySelector('.admin-name').textContent = match.username === 'admin' ? 'Dr. Amara Osei' : match.username;
    btn.textContent = 'Sign In';
    btn.disabled    = false;
    init();
  } else {
    // Wrong credentials
    errEl.textContent = 'Incorrect username or password. Please try again.';
    errEl.classList.add('show');
    passEl.value = '';
    passEl.classList.add('shake');
    userEl.classList.add('shake');
    setTimeout(() => {
      passEl.classList.remove('shake');
      userEl.classList.remove('shake');
    }, 400);
    btn.textContent = 'Sign In';
    btn.disabled    = false;
  }
}, 500);
}

// Wire up logout button
document.querySelector('.logout-btn').addEventListener('click', () => {
if (confirm('Sign out of the admin dashboard?')) destroySession();
});

// ── Session timer display ──
function updateSessionTimer() {
const session = getSession();
const el = document.getElementById('session-timer');
if (!session || !el) return;
const remaining = Math.max(0, session.expires - Date.now());
const hrs  = Math.floor(remaining / 3600000);
const mins = Math.floor((remaining % 3600000) / 60000);
el.textContent = `Session expires in ${hrs}h ${mins}m`;
if (remaining < 30 * 60 * 1000) el.style.color = 'rgba(239,68,68,0.7)'; // red warning under 30min
}
setInterval(updateSessionTimer, 60000);
setTimeout(updateSessionTimer, 800);
(function checkAuth() {
const session = getSession();
if (session) {
  // Already logged in — hide login screen immediately, no flash
  document.getElementById('login-screen').classList.add('hidden');
  init();
}
// else: login screen stays visible, init() called after successful login
})();
