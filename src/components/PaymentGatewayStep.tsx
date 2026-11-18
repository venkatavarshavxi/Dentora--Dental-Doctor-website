import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { BOOKING_FEE_INR, DOCTORS, TREATMENTS } from '../data/seedData';
import { PaymentMethod } from '../types/dental';
import { formatReadableDate } from '../utils/clinicDates';

interface PaymentGatewayStepProps {
  patientName: string;
  patientEmail: string;
  doctorId: string;
  treatmentId: string;
  date: string;
  timeSlot: string;
  paymentMethod: Extract<PaymentMethod, 'UPI / QR' | 'Card'>;
  error: string;
  onBack: () => void;
  onConfirmPaid: (paymentRef?: string) => void;
}

const CLINIC_UPI_ID = 'dentora.studio@upi';

export function PaymentGatewayStep({
  patientName,
  patientEmail,
  doctorId,
  treatmentId,
  date,
  timeSlot,
  paymentMethod,
  error,
  onBack,
  onConfirmPaid,
}: PaymentGatewayStepProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const doctor = DOCTORS.find((d) => d.id === doctorId);
  const treatment = TREATMENTS.find((t) => t.id === treatmentId);

  const upiUri = `upi://pay?pa=${encodeURIComponent(CLINIC_UPI_ID)}&pn=${encodeURIComponent('Dentora Dental Studio')}&am=${BOOKING_FEE_INR}&cu=INR&tn=${encodeURIComponent(`Dentora Slot ${date} ${timeSlot}`)}`;

  useEffect(() => {
    if (paymentMethod !== 'UPI / QR') return;
    let active = true;
    QRCode.toDataURL(upiUri, {
      width: 220,
      margin: 2,
      color: {
        dark: '#091830',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [paymentMethod, upiUri]);

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(CLINIC_UPI_ID);
    setCopiedUpi(true);
    window.setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCompletePayment = () => {
    const cleanUtr = utrNumber.trim().toUpperCase();
    onConfirmPaid(cleanUtr ? `UPI-${cleanUtr}` : undefined);
  };

  return (
    <div className="py-1">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Back to Booking Details</span>
      </button>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-blue-700">
            {paymentMethod === 'UPI / QR' ? 'UPI QR Checkout' : 'Card Reservation'}
          </p>
          <h3
            id="booking-modal-title"
            className="mt-0.5 font-display text-2xl font-bold tracking-tight text-slate-900"
          >
            Pay ₹{BOOKING_FEE_INR} to Confirm Slot
          </h3>
        </div>

        <span className="font-mono-num inline-flex items-center rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-lg font-bold text-blue-700">
          <IndianRupee className="h-4 w-4" aria-hidden="true" />
          {BOOKING_FEE_INR}.00
        </span>
      </div>

      {/* Booking Summary Bar */}
      <div className="mt-4 rounded-xl border border-blue-100 bg-white p-4 text-xs">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <span className="text-slate-500">Patient:</span>{' '}
            <span className="font-semibold text-slate-900">{patientName}</span>
          </div>
          <div>
            <span className="text-slate-500">Email:</span>{' '}
            <span className="font-medium text-slate-800">{patientEmail}</span>
          </div>
          <div>
            <span className="text-slate-500">Specialist:</span>{' '}
            <span className="font-semibold text-slate-900">{doctor?.name}</span>
          </div>
          <div>
            <span className="text-slate-500">Slot:</span>{' '}
            <span className="font-mono-num font-semibold text-blue-700">
              {formatReadableDate(date)} · {timeSlot}
            </span>
          </div>
        </div>
        <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
          Procedure: {treatment?.title} · Fee is 100% adjusted against final treatment bill.
        </p>
      </div>

      {paymentMethod === 'UPI / QR' ? (
        <div className="mt-4 rounded-2xl border border-blue-200 bg-white p-5 text-center">
          <p className="text-xs font-semibold text-slate-800">
            Scan with Google Pay, PhonePe, Paytm, or any UPI app
          </p>

          <div className="mx-auto mt-4 inline-flex flex-col items-center rounded-2xl border-2 border-[#091830] bg-white p-3 shadow-sm">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`UPI QR code to pay ₹${BOOKING_FEE_INR} to Dentora Dental Studio`}
                className="h-48 w-48"
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center text-xs text-slate-400">
                Generating UPI QR...
              </div>
            )}
            <p className="font-mono-num mt-1 text-[11px] font-bold text-[#091830]">
              Dentora Dental Studio · ₹{BOOKING_FEE_INR}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="font-mono-num rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800">
              {CLINIC_UPI_ID}
            </span>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
            >
              {copiedUpi ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copiedUpi ? 'Copied' : 'Copy UPI ID'}</span>
            </button>
          </div>

          <div className="mt-4 text-left">
            <label
              htmlFor="upi-utr"
              className="block text-xs font-semibold text-slate-700"
            >
              UPI Transaction / UTR Reference (Optional)
            </label>
            <input
              id="upi-utr"
              type="text"
              maxLength={24}
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
              placeholder="e.g. 432198765432"
              className="font-mono-num mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-blue-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 shrink-0">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Card Chair Reservation (₹{BOOKING_FEE_INR})
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Confirm your ₹{BOOKING_FEE_INR} slot reservation below to generate your
                official Dentora Appointment Slip and payment receipt.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-5 space-y-2.5">
        <button
          type="button"
          onClick={handleCompletePayment}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 active:scale-[0.99] transition-all cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>I Have Paid ₹{BOOKING_FEE_INR} · Generate Appointment Slip</span>
        </button>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-700" aria-hidden="true" />
          <span>Slot locks immediately &amp; official slip generates after payment</span>
        </p>
      </div>
    </div>
  );
}
