export type TreatmentCategory = 'Preventive' | 'Cosmetic' | 'Implants & Ortho';

export type QuestionTopic =
  | 'Toothache & Sensitivity'
  | 'Cosmetic & Whitening'
  | 'Braces & Aligners'
  | 'Implants & Crowns'
  | 'Preventive Care';

export type VisitType = 'New Patient' | 'Returning Patient';

export type UrgencyLevel = 'Routine' | 'Urgent Pain';

export type PaymentMethod = 'UPI / QR' | 'Card' | 'Pay at Clinic';

export type PaymentStatus = 'Paid (₹500)' | 'Pay ₹500 at Clinic';

export interface Doctor {
  id: string;
  name: string;
  role: string;
  credentials: string;
  experienceYears: number;
  rating: string;
  reviewCount: number;
  availability: string;
  bio: string;
  imageUrl: string;
  specialties: string[];
}

export interface Treatment {
  id: string;
  indexLabel: string;
  title: string;
  category: TreatmentCategory;
  duration: string;
  priceRange: string;
  summary: string;
  imageUrl?: string;
  steps: string[];
  recommendedDoctorId: string;
}

export interface DentalQuestion {
  id: string;
  patientName: string;
  patientEmail: string;
  topic: QuestionTopic;
  question: string;
  createdAt: string;
  answeredByDoctorName?: string;
  answeredByRole?: string;
  answer?: string;
  status: 'Answered' | 'Pending Review';
}

export interface Appointment {
  id: string;
  patientName: string;
  patientAge: number;
  patientEmail: string;
  patientPhone: string;
  visitType: VisitType;
  urgency: UrgencyLevel;
  reminderOptIn: boolean;
  doctorId: string;
  treatmentId: string;
  date: string;
  timeSlot: string;
  notes: string;
  bookingFeeInr: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentRef: string;
  status: 'Confirmed' | 'Cancelled';
  createdAt: string;
}

export interface PatientTestimonial {
  id: string;
  patientName: string;
  procedure: string;
  visitDate: string;
  quote: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
}

export interface DoctorCredential {
  doctorId: string;
  email: string;
  password: string;
}

export type AuthSession =
  | {
      role: 'customer';
      id: string;
      name: string;
      email: string;
      phone: string;
    }
  | {
      role: 'doctor';
      doctorId: string;
      name: string;
      email: string;
      roleTitle: string;
    };
