// ============================================
// payment.js — Paystack Payment Integration
// Handles both M-Pesa and Card payments
// ============================================

const PAYSTACK_PUBLIC_KEY = 'pk_test_678149142e9f4edd6e42393f536680dd4f29ae5a'; // Replace with your key

// ============================================
// INITIALIZE PAYSTACK PAYMENT
// Called after booking is saved successfully
// ============================================
function initializePayment(bookingData) {
  const { first_name, last_name, email, phone, amount, session_type, session_date, session_time, bookingId } = bookingData;

  const handler = PaystackPop.setup({
    key:       PAYSTACK_PUBLIC_KEY,
    email:     email,
    amount:    amount * 100,          // Paystack uses kobo/cents — multiply by 100
    currency:  'KES',
    ref:       'DR-OSEI-' + Date.now(), // unique transaction reference
    label:     first_name + ' ' + last_name,
    metadata: {
      booking_id:   bookingId,
      session_type: session_type,
      phone:        phone,
      custom_fields: [
        { display_name: 'Session Type', variable_name: 'session_type', value: session_type },
        { display_name: 'Phone',        variable_name: 'phone',        value: phone }
      ]
    },

    // ── Called when payment is successful ──
    callback: async function(response) {
      console.log('Payment successful:', response);

      // Verify payment on your server
      const verified = await verifyPayment(response.reference, bookingId);

      if (verified) {
        showModal(first_name, session_type, session_date, session_time);
        clearForm();
      } else {
        showError('Payment verification failed. Please contact us at hello@dramaraosei.co.ke');
      }

      // Reset button
      const btn       = document.querySelector('.submit-btn');
      btn.textContent = 'Confirm & Pay Securely';
      btn.disabled    = false;
    },

    // ── Called when user closes the popup ──
    onClose: function() {
      console.log('Payment popup closed.');
      const btn       = document.querySelector('.submit-btn');
      btn.textContent = 'Confirm & Pay Securely';
      btn.disabled    = false;
    }
  });

  handler.openIframe();
}

// ============================================
// VERIFY PAYMENT ON SERVER
// Confirms payment is genuine before updating DB
// ============================================
async function verifyPayment(reference, bookingId) {
  try {
    const response = await fetch('http://localhost:3000/api/payments/verify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ reference, booking_id: bookingId })
    });

    const result = await response.json();
    return result.verified === true;

  } catch (err) {
    console.error('Verification error:', err);
    return false;
  }
}