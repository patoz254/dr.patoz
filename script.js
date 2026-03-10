// ============================================
// script.js — Dr. Amara Osei Psychology Website
// ============================================

const SERVER_URL = 'http://localhost:3000';

let selectedPrice = 3000;
let selectedType  = 'Consultation / First Visit';

// ============================================
// SESSION SELECTION
// ============================================
function selectSession(el, name, price) {
  document.querySelectorAll('.session-type').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  selectedPrice = price;
  selectedType  = name;
  const fee = Math.round(price * 0.02);
  document.getElementById('summary-type').textContent  = name;
  document.getElementById('summary-price').textContent = 'KES ' + price.toLocaleString();
  document.getElementById('summary-fee').textContent   = 'KES ' + fee.toLocaleString();
  document.getElementById('summary-total').textContent = 'KES ' + (price + fee).toLocaleString();
}

// ============================================
// PAYMENT METHOD SELECTION
// ============================================
function selectPayment(el) {
  document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('active'));
  el.classList.add('active');
  const label = el.textContent;
  const cf = document.getElementById('card-fields');
  if (label.includes('Card')) {
    cf.innerHTML = `
      <input type="text" placeholder="Cardholder Name" />
      <input type="text" placeholder="Card Number (16 digits)" maxlength="19" oninput="formatCard(this)" />
      <div class="card-row">
        <input type="text" placeholder="MM / YY" maxlength="7" />
        <input type="text" placeholder="CVV" maxlength="3" />
      </div>`;
  } else if (label.includes('M-Pesa')) {
    cf.innerHTML = `
      <input type="tel" id="mpesa-number" placeholder="M-Pesa Phone Number e.g. 0712 345 678" style="width:100%;padding:0.75rem 1rem;border:1.5px solid var(--border);background:white;font-family:'DM Sans',sans-serif;font-size:0.85rem;outline:none;" />
      <p style="font-size:0.78rem;color:var(--text-light);margin-top:0.5rem;">You will receive an STK push to complete payment on your phone.</p>`;
  } else {
    cf.innerHTML = `
      <div style="font-size:0.85rem;line-height:1.8;color:var(--text-light);padding:0.5rem 0;">
        <strong style="color:var(--text);">Bank Transfer Details</strong><br>
        Bank: Equity Bank Kenya<br>
        Account Name: Dr. Amara Osei Psychology<br>
        Account No: 0123456789<br>
        Branch: Westlands
      </div>`;
  }
}

// ============================================
// FORMAT CARD NUMBER
// ============================================
function formatCard(el) {
  let v = el.value.replace(/\D/g, '').substring(0, 16);
  el.value = v.replace(/(.{4})/g, '$1 ').trim();
}

// ============================================
// FAQ TOGGLE
// ============================================
function toggleFAQ(btn) {
  const item   = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ============================================
// HANDLE BOOKING FORM SUBMISSION
// ============================================
async function handleBooking() {
  // ── Collect form values ──────────────────
  const first_name   = document.getElementById('first-name').value.trim();
  const last_name    = document.getElementById('last-name').value.trim();
  const email        = document.getElementById('email').value.trim();
  const phone        = document.getElementById('phone').value.trim();
  const session_date = document.getElementById('session-date').value;
  const session_time = document.getElementById('session-time').value;

  // ── Validate required fields ─────────────
  if (!first_name || !last_name || !email || !session_date || !session_time) {
    showError('Please fill in all required fields before booking.');
    return;
  }

  // ── Email format check ───────────────────
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('Please enter a valid email address.');
    return;
  }

  // ── Show loading state on button ─────────
  const btn = document.querySelector('.submit-btn');
  btn.textContent = 'Saving your booking...';
  btn.disabled    = true;

  try {
    // ── Send booking to server ─────────────
    const response = await fetch(`${SERVER_URL}/api/bookings`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        phone,
        session_type: selectedType,
        session_date,
        session_time,
        amount: selectedPrice
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Something went wrong.');
    }

    // ── Success! Show confirmation modal ───
    showModal(first_name, selectedType, session_date, session_time);
    clearForm();

  } catch (err) {
    showError('Could not complete booking: ' + err.message);
  } finally {
    // ── Reset button ───────────────────────
    btn.textContent = 'Confirm & Pay Securely';
    btn.disabled    = false;
  }
}

// ============================================
// SHOW SUCCESS MODAL
// ============================================
function showModal(name, type, date, time) {
  const formatted = new Date(date).toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  document.getElementById('modal-body').innerHTML = `
    <p>Thank you <strong>${name}</strong>! Your <strong>${type}</strong> session has been booked for:</p>
    <p style="margin-top:0.8rem;font-size:1rem;color:var(--blue);font-weight:500;">${formatted} at ${time}</p>
    <p style="margin-top:0.8rem;">A confirmation email will be sent to you shortly. See you soon!</p>
  `;
  document.getElementById('modal').classList.add('active');
}

// ============================================
// SHOW ERROR MESSAGE
// ============================================
function showError(msg) {
  // Remove any existing error
  const existing = document.getElementById('booking-error');
  if (existing) existing.remove();

  const err = document.createElement('div');
  err.id = 'booking-error';
  err.style.cssText = 'background:#fff0f0;border:1.5px solid #ffb3b3;color:#cc0000;padding:0.9rem 1rem;font-size:0.85rem;margin-bottom:1rem;';
  err.textContent = msg;

  const form = document.querySelector('.booking-form');
  form.insertBefore(err, form.firstChild);

  // Auto remove after 5 seconds
  setTimeout(() => err.remove(), 5000);
}

// ============================================
// CLEAR FORM AFTER SUCCESSFUL BOOKING
// ============================================
function clearForm() {
  document.getElementById('first-name').value   = '';
  document.getElementById('last-name').value    = '';
  document.getElementById('email').value        = '';
  document.getElementById('phone').value        = '';
  document.getElementById('session-date').value = '';
  document.getElementById('session-time').value = '9:00 AM';
}

// ============================================
// SET MIN DATE (no past dates)
// ============================================
const dateInput = document.getElementById('session-date');
const today     = new Date();
const dd        = String(today.getDate()).padStart(2, '0');
const mm        = String(today.getMonth() + 1).padStart(2, '0');
dateInput.min   = `${today.getFullYear()}-${mm}-${dd}`;