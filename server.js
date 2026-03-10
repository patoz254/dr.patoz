// ============================================
// server.js — Dr. Amara Osei Psychology Website
// Stack: Node.js + Express + Supabase + Paystack + Resend
// ============================================

const express = require('express');
const cors    = require('cors');
const https   = require('https');
const path    = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Resend }       = require('resend');

// ── Resend Email Client ──────────────────────
const resend = new Resend(process.env.RESEND_API_KEY || 're_8VGZ52Xd_3XDGYyTBUviUXXd3EooEKnpF');
const ADMIN_EMAIL    = 'hello@dramaraosei.co.ke'; // Dr. Osei's email
const FROM_EMAIL     = 'onboarding@resend.dev'; // use this for testing; switch to your domain after verifying it in Resend
const ZOOM_LINK      = 'https://zoom.us/j/YOUR_ZOOM_MEETING_ID'; // replace with Dr. Osei's fixed Zoom link

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Supabase connection ──────────────────────
const supabase = createClient(
  'https://gsircxsyvcjwcvooarjy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaXJjeHN5dmNqd2N2b29hcmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjk3MTUsImV4cCI6MjA4ODYwNTcxNX0.h9hIOaWG9VWWOC1RZQtoNhArYXHOluJs5gP6E4AVAZo'
);

// ── Paystack Secret Key ──────────────────────
const PAYSTACK_SECRET_KEY = 'sk_test_3d31805a750664886aab3d949fc99d8625f025ff'; // Replace with your key

// ── Middleware ───────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================
// EMAIL HELPERS
// ============================================

function formatDateNice(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ── 1. Client Booking Confirmation ──────────
async function sendClientConfirmation(booking) {
  const { first_name, last_name, email, session_type, session_date, session_time, amount } = booking;
  try {
    await resend.emails.send({
      from: `Dr. Amara Osei <${FROM_EMAIL}>`,
      to:   email,
      subject: `Your session is confirmed — ${formatDateNice(session_date)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"/></head>
        <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

                <!-- Header -->
                <tr>
                  <td style="background:#1e2535;padding:32px 40px;text-align:center;">
                    <div style="font-family:Georgia,serif;font-size:22px;color:#ffffff;letter-spacing:0.03em;">Dr. Amara Osei</div>
                    <div style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6b9dff;margin-top:4px;">Licensed Clinical Psychologist</div>
                  </td>
                </tr>

                <!-- Green bar -->
                <tr><td style="background:#10b981;height:3px;"></td></tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <p style="font-size:15px;color:#5a6480;margin:0 0 8px;">Hello ${first_name},</p>
                    <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#0f1422;margin:0 0 24px;">Your session is <em style="color:#2563ff;">confirmed</em> ✓</h1>

                    <!-- Session Details Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;border-radius:8px;border:1px solid #dde3f0;margin-bottom:28px;">
                      <tr><td style="padding:24px 28px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:8px 0;border-bottom:1px solid #dde3f0;">
                              <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#5a6480;">Session Type</span><br/>
                              <span style="font-size:15px;color:#0f1422;font-weight:500;margin-top:3px;display:block;">${session_type}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;border-bottom:1px solid #dde3f0;">
                              <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#5a6480;">Date</span><br/>
                              <span style="font-size:15px;color:#0f1422;font-weight:500;margin-top:3px;display:block;">${formatDateNice(session_date)}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;border-bottom:1px solid #dde3f0;">
                              <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#5a6480;">Time</span><br/>
                              <span style="font-size:15px;color:#0f1422;font-weight:500;margin-top:3px;display:block;">${session_time}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;">
                              <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#5a6480;">Amount Paid</span><br/>
                              <span style="font-size:15px;color:#0f1422;font-weight:500;margin-top:3px;display:block;">KES ${amount.toLocaleString()}</span>
                            </td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>

                    <p style="font-size:14px;color:#5a6480;line-height:1.7;margin:0 0 16px;">
                      ${session_type.toLowerCase().includes('online') ? `
                      This is an <strong>online session</strong>. Use the link below to join at your scheduled time:
                      </p>
                      <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                        <tr>
                          <td style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:8px;padding:16px 24px;">
                            <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#5a6480;margin-bottom:6px;">Your Zoom Link</div>
                            <a href="${ZOOM_LINK}" style="font-size:15px;color:#2563ff;font-weight:500;word-break:break-all;">${ZOOM_LINK}</a>
                            <div style="font-size:12px;color:#5a6480;margin-top:6px;">Join 5 minutes early · No download needed</div>
                          </td>
                        </tr>
                      </table>
                      <p style="font-size:14px;color:#5a6480;line-height:1.7;margin:0 0 16px;">
                      ` : `Please arrive 5 minutes early at our Westlands, Nairobi offices.`}
                    </p>
                    <p style="font-size:14px;color:#5a6480;line-height:1.7;margin:0 0 28px;">
                      Need to reschedule? Contact us at least 24 hours in advance at
                      <a href="mailto:${ADMIN_EMAIL}" style="color:#2563ff;">${ADMIN_EMAIL}</a>
                    </p>

                    <!-- CTA -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#2563ff;border-radius:6px;">
                          <a href="mailto:${ADMIN_EMAIL}" style="display:block;padding:12px 28px;color:#ffffff;text-decoration:none;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;">Contact Us</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f4f6fb;padding:24px 40px;border-top:1px solid #dde3f0;text-align:center;">
                    <p style="font-size:12px;color:#5a6480;margin:0;">Dr. Amara Osei Psychology · Westlands, Nairobi</p>
                    <p style="font-size:12px;color:#5a6480;margin:4px 0 0;">
                      <a href="mailto:${ADMIN_EMAIL}" style="color:#2563ff;">${ADMIN_EMAIL}</a> · +254 700 000 000
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `
    });
    console.log(`✅ Confirmation email sent to ${email}`);
  } catch (err) {
    console.error('❌ Failed to send client confirmation:', err.message);
  }
}

// ── 2. Admin New Booking Notification ───────
async function sendAdminNotification(booking) {
  const { first_name, last_name, email, phone, session_type, session_date, session_time, amount } = booking;
  try {
    await resend.emails.send({
      from: `Booking System <${FROM_EMAIL}>`,
      to:   ADMIN_EMAIL,
      subject: `New booking: ${first_name} ${last_name} — ${session_type}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
            <tr><td align="center">
              <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

                <tr>
                  <td style="background:#1e2535;padding:28px 36px;">
                    <div style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6b9dff;margin-bottom:4px;">New Booking</div>
                    <div style="font-family:Georgia,serif;font-size:20px;color:#ffffff;">Admin Notification</div>
                  </td>
                </tr>
                <tr><td style="background:#2563ff;height:3px;"></td></tr>

                <tr>
                  <td style="padding:32px 36px;">
                    <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#0f1422;margin:0 0 20px;">
                      ${first_name} ${last_name} just booked a session
                    </h2>

                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;border-radius:8px;border:1px solid #dde3f0;margin-bottom:24px;">
                      <tr><td style="padding:20px 24px;">
                        <table width="100%" cellpadding="6">
                          <tr>
                            <td style="font-size:12px;color:#5a6480;width:130px;">Client</td>
                            <td style="font-size:14px;color:#0f1422;font-weight:500;">${first_name} ${last_name}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:#5a6480;">Email</td>
                            <td style="font-size:14px;color:#2563ff;"><a href="mailto:${email}" style="color:#2563ff;">${email}</a></td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:#5a6480;">Phone</td>
                            <td style="font-size:14px;color:#0f1422;">${phone || '—'}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:#5a6480;">Session</td>
                            <td style="font-size:14px;color:#0f1422;font-weight:500;">${session_type}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:#5a6480;">Date & Time</td>
                            <td style="font-size:14px;color:#0f1422;">${formatDateNice(session_date)} at ${session_time}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:#5a6480;">Amount</td>
                            <td style="font-size:14px;color:#10b981;font-weight:600;">KES ${amount.toLocaleString()}</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>

                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#1e2535;border-radius:6px;">
                          <a href="http://localhost:3000/admin.html" style="display:block;padding:11px 24px;color:#ffffff;text-decoration:none;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;">View in Dashboard →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="background:#f4f6fb;padding:18px 36px;border-top:1px solid #dde3f0;text-align:center;">
                    <p style="font-size:11px;color:#5a6480;margin:0;">Dr. Amara Osei Psychology · Admin System</p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `
    });
    console.log(`✅ Admin notification sent to ${ADMIN_EMAIL}`);
  } catch (err) {
    console.error('❌ Failed to send admin notification:', err.message);
  }
}

// ── 3. Client Cancellation Notice ───────────
async function sendCancellationEmail(booking) {
  const { first_name, email, session_type, session_date, session_time } = booking;
  try {
    await resend.emails.send({
      from: `Dr. Amara Osei <${FROM_EMAIL}>`,
      to:   email,
      subject: `Your session has been cancelled`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
            <tr><td align="center">
              <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

                <tr>
                  <td style="background:#1e2535;padding:32px 40px;text-align:center;">
                    <div style="font-family:Georgia,serif;font-size:22px;color:#ffffff;">Dr. Amara Osei</div>
                    <div style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6b9dff;margin-top:4px;">Licensed Clinical Psychologist</div>
                  </td>
                </tr>
                <tr><td style="background:#ef4444;height:3px;"></td></tr>

                <tr>
                  <td style="padding:40px 40px 32px;">
                    <p style="font-size:15px;color:#5a6480;margin:0 0 8px;">Hello ${first_name},</p>
                    <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#0f1422;margin:0 0 20px;">
                      Your session has been <em style="color:#ef4444;">cancelled</em>
                    </h1>

                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:8px;border:1px solid #fecaca;margin-bottom:24px;">
                      <tr><td style="padding:20px 24px;">
                        <table width="100%" cellpadding="6">
                          <tr>
                            <td style="font-size:12px;color:#5a6480;width:130px;">Session</td>
                            <td style="font-size:14px;color:#0f1422;font-weight:500;">${session_type}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:#5a6480;">Date</td>
                            <td style="font-size:14px;color:#0f1422;">${formatDateNice(session_date)}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:#5a6480;">Time</td>
                            <td style="font-size:14px;color:#0f1422;">${session_time}</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>

                    <p style="font-size:14px;color:#5a6480;line-height:1.7;margin:0 0 24px;">
                      We're sorry for any inconvenience. If you'd like to reschedule or have any questions, please don't hesitate to reach out.
                    </p>

                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#2563ff;border-radius:6px;">
                          <a href="http://dramaraosei.co.ke/#booking" style="display:block;padding:12px 28px;color:#ffffff;text-decoration:none;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;">Book Again</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="background:#f4f6fb;padding:24px 40px;border-top:1px solid #dde3f0;text-align:center;">
                    <p style="font-size:12px;color:#5a6480;margin:0;">Dr. Amara Osei Psychology · Westlands, Nairobi</p>
                    <p style="font-size:12px;color:#5a6480;margin:4px 0 0;">
                      <a href="mailto:${ADMIN_EMAIL}" style="color:#2563ff;">${ADMIN_EMAIL}</a> · +254 700 000 000
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `
    });
    console.log(`✅ Cancellation email sent to ${email}`);
  } catch (err) {
    console.error('❌ Failed to send cancellation email:', err.message);
  }
}

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running and connected to Supabase!' });
});

// ============================================
// BOOKINGS
// ============================================

// POST /api/bookings — save a new booking
app.post('/api/bookings', async (req, res) => {
  const { first_name, last_name, email, phone, session_type, session_date, session_time, message, amount } = req.body;

  if (!first_name || !last_name || !email || !session_type || !session_date || !session_time) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      first_name, last_name, email,
      phone:         phone    || '',
      session_type,  session_date, session_time,
      message:       message  || '',
      amount:        amount   || 0,
      status:        'pending',
      payment_status:'unpaid'
    }])
    .select()
    .single();

  if (error) {
    console.error('Booking error:', error.message);
    return res.status(500).json({ error: 'Could not save booking. Please try again.' });
  }

  // ── Send emails (non-blocking — don't delay the response) ──
  sendClientConfirmation(data);
  sendAdminNotification(data);

  res.status(201).json({ success: true, booking: data });
});

// GET /api/bookings — get all bookings
app.get('/api/bookings', async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('session_date', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/bookings/:id — get one booking
app.get('/api/bookings/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Booking not found.' });
  res.json(data);
});

// PATCH /api/bookings/:id/status — update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
  const { status, payment_status } = req.body;

  const { data, error } = await supabase
    .from('bookings')
    .update({ status, payment_status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, booking: data });
});

// DELETE /api/bookings/:id — cancel a booking
app.delete('/api/bookings/:id', async (req, res) => {
  // Fetch booking details before cancelling (for the email)
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', req.params.id)
    .single();

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });

  // ── Send cancellation email (non-blocking) ──
  if (booking) sendCancellationEmail(booking);

  res.json({ success: true, message: 'Booking cancelled.' });
});

// ============================================
// AVAILABILITY
// ============================================
app.get('/api/availability', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required.' });

  const allSlots = ['9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'];

  const { data, error } = await supabase
    .from('bookings')
    .select('session_time')
    .eq('session_date', date)
    .neq('status', 'cancelled');

  if (error) return res.status(500).json({ error: error.message });

  const booked    = data.map(b => b.session_time);
  const available = allSlots.filter(s => !booked.includes(s));
  res.json({ date, available, booked });
});

// ============================================
// MESSAGES
// ============================================
app.post('/api/messages', async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message are required.' });

  const { data, error } = await supabase
    .from('messages')
    .insert([{ name, email, phone: phone||'', message }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ success: true, message: data });
});

app.get('/api/messages', async (req, res) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ============================================
// CLIENTS
// ============================================
app.get('/api/clients', async (req, res) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/clients', async (req, res) => {
  const { first_name, last_name, email, phone, notes } = req.body;
  if (!first_name || !email) return res.status(400).json({ error: 'Name and email are required.' });

  const { data, error } = await supabase
    .from('clients')
    .insert([{ first_name, last_name: last_name||'', email, phone: phone||'', notes: notes||'' }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Client email already exists.' });
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ success: true, client: data });
});

// ============================================
// PAYMENT VERIFICATION — PAYSTACK
// ============================================
app.post('/api/payments/verify', async (req, res) => {
  const { reference, booking_id } = req.body;

  if (!reference || !booking_id) {
    return res.status(400).json({ error: 'Reference and booking ID are required.' });
  }

  try {
    // Verify with Paystack API
    const paystackRes = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.paystack.co',
        path:     `/transaction/verify/${reference}`,
        method:   'GET',
        headers:  { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
      };

      https.get(options, (response) => {
        let body = '';
        response.on('data',  chunk => body += chunk);
        response.on('end',   ()    => resolve(JSON.parse(body)));
        response.on('error', err   => reject(err));
      });
    });

    // Check payment was successful
    if (paystackRes.status && paystackRes.data.status === 'success') {

      // Update booking to confirmed + paid in Supabase
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed', payment_status: 'paid' })
        .eq('id', booking_id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      return res.json({ verified: true, booking: data });
    }

    res.json({ verified: false });

  } catch (err) {
    console.error('Payment verification error:', err.message);
    res.status(500).json({ error: 'Could not verify payment.' });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Server running at http://localhost:${PORT}
🗄️   Database: Supabase
💳  Payments:  Paystack
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});