import { DOCTORS, TREATMENTS } from '../data/seedData';
import { Appointment } from '../types/dental';
import { formatReadableDate } from './clinicDates';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildBarcodeBars(seed: string): { x: number; width: number }[] {
  const bars: { x: number; width: number }[] = [];
  let cursor = 0;
  const code = `${seed}-DENTORA-2026`;
  for (let i = 0; i < 36; i++) {
    const ch = code.charCodeAt(i % code.length);
    const width = (ch % 3) + 1;
    const gap = ((ch >> 1) % 2) + 1.5;
    bars.push({ x: cursor, width });
    cursor += width + gap;
  }
  return bars;
}

export function downloadAppointmentSlip(apt: Appointment) {
  const doc = DOCTORS.find((d) => d.id === apt.doctorId);
  const tr = TREATMENTS.find((t) => t.id === apt.treatmentId);
  const readableDate = formatReadableDate(apt.date);
  const bars = buildBarcodeBars(apt.id);
  const totalWidth =
    bars.length > 0
      ? bars[bars.length - 1].x + bars[bars.length - 1].width
      : 120;

  const barcodeRects = bars
    .map(
      (b) =>
        `<rect x="${b.x.toFixed(1)}" y="0" width="${b.width}" height="32" rx="0.5" fill="#0f172a" />`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dentora Appointment Slip - ${escapeHtml(apt.id.toUpperCase())}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #edf3fb;
      color: #0f172a;
      padding: 32px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .actions {
      width: 100%;
      max-width: 620px;
      display: flex;
      justify-content: flex-end;
      margin-bottom: 14px;
    }
    .print-btn {
      background: #1d4ed8;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .print-btn:hover { background: #1e40af; }
    .pass {
      width: 100%;
      max-width: 620px;
      background: #ffffff;
      border: 1px solid #bfdbfe;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 20px 44px -14px rgba(15, 23, 42, 0.16);
    }
    .pass-header {
      background: linear-gradient(135deg, #091830 0%, #143463 100%);
      color: #ffffff;
      padding: 22px 26px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-title { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .brand-sub { font-size: 12px; color: #bae6fd; margin-top: 2px; }
    .ref-block { text-align: right; }
    .ref-label { font-size: 11px; color: #93c5fd; }
    .ref-id { font-family: ui-monospace, monospace; font-size: 15px; font-weight: 700; margin-top: 2px; }
    .status-line { font-size: 12px; color: #86efac; font-weight: 600; margin-top: 3px; }
    .schedule-strip {
      background: #eff6ff;
      border-bottom: 1px solid #dbeafe;
      padding: 18px 26px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .metric-label { font-size: 11px; font-weight: 600; color: #475569; }
    .metric-value { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 4px; font-variant-numeric: tabular-nums; }
    .metric-value.accent { color: #1d4ed8; }
    .perforation {
      position: relative;
      height: 22px;
      display: flex;
      align-items: center;
      background: #ffffff;
    }
    .perforation::before, .perforation::after {
      content: "";
      width: 18px;
      height: 18px;
      background: #edf3fb;
      border: 1px solid #bfdbfe;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
    .perforation::before { left: -10px; }
    .perforation::after { right: -10px; }
    .perforation-line {
      width: 100%;
      border-top: 1.5px dashed #cbd5e1;
      margin: 0 18px;
    }
    .body { padding: 14px 26px 24px; }
    .clinical-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
    }
    .section-label { font-size: 11px; font-weight: 600; color: #64748b; }
    .primary-text { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 4px; }
    .secondary-text { font-size: 12px; color: #475569; margin-top: 2px; }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 18px;
      padding: 16px 0;
    }
    .notes-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 16px;
    }
    .footer-strip {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 16px 26px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .clinic-info { font-size: 12px; color: #475569; line-height: 1.55; }
    .clinic-info strong { color: #0f172a; }
    .barcode-wrap { text-align: right; }
    .barcode-code { font-family: ui-monospace, monospace; font-size: 10px; color: #64748b; margin-top: 4px; letter-spacing: 0.08em; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .actions { display: none; }
      .pass { box-shadow: none; border-color: #cbd5e1; }
      .perforation::before, .perforation::after { background: #ffffff; }
    }
    @media (max-width: 540px) {
      .schedule-strip, .clinical-row, .details-grid { grid-template-columns: 1fr; }
      .pass-header, .footer-strip { flex-direction: column; align-items: flex-start; }
      .ref-block, .barcode-wrap { text-align: left; }
    }
  </style>
</head>
<body>
  <div class="actions">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="pass">
    <div class="pass-header">
      <div class="brand">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7.2 3.2C5.2 3.2 3.8 5 3.8 7.5c0 2.1.7 3.8 1.4 5.8.7 2 1.2 4.7 1.8 6.5.3.9 1.5 1 1.9.1l1.7-4.4c.4-1 1.4-1.5 1.4-1.5s1 .5 1.4 1.5l1.7 4.4c.4.9 1.6.8 1.9-.1.6-1.8 1.1-4.5 1.8-6.5.7-2 1.4-3.7 1.4-5.8 0-2.5-1.4-4.3-3.4-4.3-1.4 0-2.5.6-3.4 1.2-.8.5-2 .5-2.8 0C9.7 3.8 8.6 3.2 7.2 3.2Z" />
        </svg>
        <div>
          <div class="brand-title">Dentora</div>
          <div class="brand-sub">Official Chair Reservation Pass</div>
        </div>
      </div>
      <div class="ref-block">
        <div class="ref-label">Booking Reference</div>
        <div class="ref-id">${escapeHtml(apt.id.toUpperCase())}</div>
        <div class="status-line">● ${escapeHtml(apt.status)}</div>
      </div>
    </div>

    <div class="schedule-strip">
      <div>
        <div class="metric-label">Appointment Date</div>
        <div class="metric-value">${escapeHtml(readableDate)}</div>
      </div>
      <div>
        <div class="metric-label">Chair Time</div>
        <div class="metric-value accent">${escapeHtml(apt.timeSlot)}</div>
      </div>
      <div>
        <div class="metric-label">Est. Duration</div>
        <div class="metric-value">${escapeHtml(tr?.duration || '45 min')}</div>
      </div>
    </div>

    <div class="perforation"><div class="perforation-line"></div></div>

    <div class="body">
      <div class="clinical-row">
        <div>
          <div class="section-label">Assigned Specialist</div>
          <div class="primary-text">${escapeHtml(doc?.name || 'Dentora Specialist')}</div>
          <div class="secondary-text">${escapeHtml(doc?.role || '')} · ${escapeHtml(doc?.credentials || '')}</div>
        </div>
        <div>
          <div class="section-label">Scheduled Procedure</div>
          <div class="primary-text">${escapeHtml(tr?.title || 'Dental Consultation')}</div>
          <div class="secondary-text">Est. Fee: ${escapeHtml(tr?.priceRange || 'Confirmed at clinic')}</div>
        </div>
      </div>

      <div class="details-grid">
        <div>
          <div class="section-label">Patient Name</div>
          <div class="primary-text">${escapeHtml(apt.patientName)} (Age ${apt.patientAge})</div>
        </div>
        <div>
          <div class="section-label">Contact Phone</div>
          <div class="primary-text">${escapeHtml(apt.patientPhone)}</div>
        </div>
        <div>
          <div class="section-label">Email Address</div>
          <div class="secondary-text" style="font-size:13px;color:#0f172a;font-weight:600;margin-top:4px;">${escapeHtml(apt.patientEmail)}</div>
        </div>
        <div>
          <div class="section-label">Visit Type &amp; Priority</div>
          <div class="secondary-text" style="font-size:13px;color:#0f172a;font-weight:600;margin-top:4px;">${escapeHtml(apt.visitType)} · ${escapeHtml(apt.urgency)}</div>
        </div>
        <div style="grid-column: 1 / -1; background:#f4f8fd; border:1px solid #dbeafe; border-radius:10px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
          <div>
            <div class="section-label">Chair Reservation Fee</div>
            <div style="font-size:13px;color:#0f172a;font-weight:700;margin-top:2px;">₹${apt.bookingFeeInr} · ${escapeHtml(apt.paymentStatus)}</div>
          </div>
          <div style="text-align:right;">
            <div class="secondary-text" style="margin-top:0;">Method: ${escapeHtml(apt.paymentMethod)}</div>
            <div style="font-family:ui-monospace,monospace;font-size:11px;font-weight:700;color:#1d4ed8;margin-top:2px;">Receipt: ${escapeHtml(apt.paymentRef)}</div>
          </div>
        </div>
      </div>

      ${
        apt.notes
          ? `<div class="notes-box"><div class="section-label">Clinical Notes</div><div class="secondary-text" style="margin-top:4px;color:#1e293b;">${escapeHtml(apt.notes)}</div></div>`
          : ''
      }
    </div>

    <div class="footer-strip">
      <div class="clinic-info">
        <strong>Dentora Dental Studio</strong><br />
        420 Meridian Dental Plaza, Suite 300<br />
        Mon – Sat · 9:00 AM – 6:30 PM (Closed Sundays)<br />
        Helpline: +1 (415) 890-4400
      </div>
      <div class="barcode-wrap">
        <svg width="144" height="32" viewBox="0 0 ${totalWidth} 32" aria-hidden="true">${barcodeRects}</svg>
        <div class="barcode-code">${escapeHtml(apt.id.toUpperCase())} · VERIFIED</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dentora-appointment-slip-${apt.id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
