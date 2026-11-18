import { DOCTORS } from '../data/seedData';
import {
  AuthSession,
  CustomerAccount,
  DoctorCredential,
} from '../types/dental';

const CUSTOMERS_KEY = 'dentora_customers_v1';
const SESSION_KEY = 'dentora_auth_session_v1';

const INITIAL_CUSTOMERS: CustomerAccount[] = [
  {
    id: 'cust-101',
    name: 'Meera Krishnan',
    email: 'meera.k@example.com',
    phone: '4158902314',
    password: 'patient123',
    createdAt: '2026-11-16',
  },
];

export const DOCTOR_CREDENTIALS: DoctorCredential[] = [
  { doctorId: 'doc-ananya', email: 'ananya@dentora.com', password: 'doctor123' },
  { doctorId: 'doc-thomas', email: 'thomas@dentora.com', password: 'doctor123' },
  { doctorId: 'doc-priya', email: 'priya@dentora.com', password: 'doctor123' },
  { doctorId: 'doc-rohan', email: 'rohan@dentora.com', password: 'doctor123' },
  { doctorId: 'doc-meera', email: 'meera@dentora.com', password: 'doctor123' },
  { doctorId: 'doc-kabir', email: 'kabir@dentora.com', password: 'doctor123' },
];

export function loadCustomers(): CustomerAccount[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    const parsed = JSON.parse(raw) as CustomerAccount[];
    return Array.isArray(parsed) ? parsed : INITIAL_CUSTOMERS;
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession | null): void {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function registerCustomer(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): { ok: true; session: AuthSession } | { ok: false; error: string } {
  const customers = loadCustomers();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (customers.some((c) => c.email.toLowerCase() === normalizedEmail)) {
    return {
      ok: false,
      error: 'An account with this email already exists. Please sign in instead.',
    };
  }

  const account: CustomerAccount = {
    id: `cust-${Date.now().toString().slice(-5)}`,
    name: input.name.trim(),
    email: normalizedEmail,
    phone: input.phone.trim(),
    password: input.password,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify([account, ...customers]));

  const session: AuthSession = {
    role: 'customer',
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
  };
  saveSession(session);
  return { ok: true, session };
}

export function loginCustomer(
  email: string,
  password: string,
): { ok: true; session: AuthSession } | { ok: false; error: string } {
  const customers = loadCustomers();
  const normalizedEmail = email.trim().toLowerCase();
  const match = customers.find(
    (c) => c.email.toLowerCase() === normalizedEmail && c.password === password,
  );

  if (!match) {
    return {
      ok: false,
      error: 'Invalid patient email or password.',
    };
  }

  const session: AuthSession = {
    role: 'customer',
    id: match.id,
    name: match.name,
    email: match.email,
    phone: match.phone,
  };
  saveSession(session);
  return { ok: true, session };
}

export function loginDoctor(
  email: string,
  password: string,
): { ok: true; session: AuthSession } | { ok: false; error: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const cred = DOCTOR_CREDENTIALS.find(
    (d) => d.email.toLowerCase() === normalizedEmail && d.password === password,
  );

  if (!cred) {
    return {
      ok: false,
      error: 'Invalid specialist email or password.',
    };
  }

  const doctor = DOCTORS.find((doc) => doc.id === cred.doctorId);
  if (!doctor) {
    return { ok: false, error: 'Specialist profile not found.' };
  }

  const session: AuthSession = {
    role: 'doctor',
    doctorId: doctor.id,
    name: doctor.name,
    email: cred.email,
    roleTitle: doctor.role,
  };
  saveSession(session);
  return { ok: true, session };
}
