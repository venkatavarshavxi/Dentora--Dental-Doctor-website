import { Lock, Stethoscope, UserRound, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { DOCTORS } from '../data/seedData';
import {
  DOCTOR_CREDENTIALS,
  loginCustomer,
  loginDoctor,
  registerCustomer,
} from '../db/authStore';
import { AuthSession } from '../types/dental';
import { ToothIcon } from './ToothIcon';

interface LoginModalProps {
  isOpen: boolean;
  initialRole?: 'customer' | 'doctor';
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
}

const ALPHABETS_ONLY_REGEX = /^[A-Za-z\s.'-]{2,}$/;
const PHONE_10_DIGITS_REGEX = /^\d{10}$/;

export function LoginModal({
  isOpen,
  initialRole = 'customer',
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [roleTab, setRoleTab] = useState<'customer' | 'doctor'>(initialRole);
  const [customerMode, setCustomerMode] = useState<'signin' | 'signup'>('signin');

  // Customer fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Doctor fields
  const [docEmail, setDocEmail] = useState(DOCTOR_CREDENTIALS[0].email);
  const [docPassword, setDocPassword] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRoleTab(initialRole);
      setCustomerMode('signin');
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setDocPassword('');
      setError('');
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleCustomerSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (customerMode === 'signup') {
      if (!ALPHABETS_ONLY_REGEX.test(name.trim())) {
        setError('Please enter your name using alphabets only (min 2 letters).');
        return;
      }
      if (!PHONE_10_DIGITS_REGEX.test(phone)) {
        setError('Please enter a valid 10-digit phone number.');
        return;
      }

      const res = registerCustomer({ name, email, phone, password });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onLoginSuccess(res.session);
      onClose();
      return;
    }

    const res = loginCustomer(email, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onLoginSuccess(res.session);
    onClose();
  };

  const handleDoctorSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const res = loginDoctor(docEmail, docPassword);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onLoginSuccess(res.session);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
    >
      <div className="popup-enter relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-blue-200 bg-[#F4F8FD] p-6 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login dialog"
          className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#091830] text-sky-400">
            <ToothIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-700">Dentora Portal</p>
            <h3
              id="login-modal-title"
              className="font-display text-xl font-bold text-slate-900"
            >
              Sign In to Dentora
            </h3>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => {
              setRoleTab('customer');
              setError('');
            }}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
              roleTab === 'customer'
                ? 'bg-blue-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Customer Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleTab('doctor');
              setError('');
            }}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
              roleTab === 'doctor'
                ? 'bg-[#091830] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Doctor Login</span>
          </button>
        </div>

        {roleTab === 'customer' ? (
          <form onSubmit={handleCustomerSubmit} className="mt-5 space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('signin');
                  setError('');
                }}
                className={`rounded-md py-1.5 font-semibold transition-colors cursor-pointer ${
                  customerMode === 'signin'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('signup');
                  setError('');
                }}
                className={`rounded-md py-1.5 font-semibold transition-colors cursor-pointer ${
                  customerMode === 'signup'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {customerMode === 'signup' && (
              <>
                <div>
                  <label
                    htmlFor="login-name"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Full Name (Alphabets only)
                  </label>
                  <input
                    id="login-name"
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value.replace(/[^A-Za-z\s.'-]/g, ''))
                    }
                    placeholder="e.g. Priya Verma"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-phone"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Phone Number (10 digits)
                  </label>
                  <input
                    id="login-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    placeholder="9876543210"
                    className="font-mono-num mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 4 characters"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            {customerMode === 'signin' && (
              <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-white px-3 py-2 text-[11px] text-slate-600">
                <span>Demo: meera.k@example.com / patient123</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('meera.k@example.com');
                    setPassword('patient123');
                  }}
                  className="font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  Use Demo
                </button>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer"
            >
              {customerMode === 'signin'
                ? 'Sign In as Customer'
                : 'Create Account & Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleDoctorSubmit} className="mt-5 space-y-4" noValidate>
            <p className="text-xs text-slate-600">
              Sign in as a Dentora specialist to manage your scheduled chair slots
              and reply to patient dental questions.
            </p>

            <div>
              <label
                htmlFor="doc-select"
                className="block text-xs font-semibold text-slate-700"
              >
                Select Specialist Account
              </label>
              <select
                id="doc-select"
                value={docEmail}
                onChange={(e) => setDocEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                {DOCTOR_CREDENTIALS.map((cred) => {
                  const doc = DOCTORS.find((d) => d.id === cred.doctorId);
                  return (
                    <option key={cred.doctorId} value={cred.email}>
                      {doc?.name} ({cred.email})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label
                htmlFor="doc-password"
                className="block text-xs font-semibold text-slate-700"
              >
                Specialist PIN / Password
              </label>
              <div className="relative mt-1.5">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="doc-password"
                  type="password"
                  value={docPassword}
                  onChange={(e) => setDocPassword(e.target.value)}
                  placeholder="Enter specialist password"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-white px-3 py-2 text-[11px] text-slate-600">
              <span>Demo Password: <strong className="font-mono-num">doctor123</strong></span>
              <button
                type="button"
                onClick={() => setDocPassword('doctor123')}
                className="font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-[#091830] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Sign In to Doctor Portal
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
