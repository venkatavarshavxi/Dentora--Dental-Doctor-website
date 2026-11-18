import { useEffect, useState } from 'react';
import { AppointmentsDrawer } from './components/AppointmentsDrawer';
import { AskDentistSection } from './components/AskDentistSection';
import { BookingModal } from './components/BookingModal';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { PreVisitSection } from './components/PreVisitSection';
import { SpecialistGrid } from './components/SpecialistGrid';
import { ToastPopup } from './components/ToastPopup';
import { TreatmentDetailModal } from './components/TreatmentDetailModal';
import { TreatmentShowcase } from './components/TreatmentShowcase';
import {
  cancelAppointment,
  loadAppointments,
  loadQuestions,
  replyToQuestion,
  rescheduleAppointment,
  saveAppointment,
  saveQuestion,
} from './db/dentalStore';
import {
  Appointment,
  DentalQuestion,
  Doctor,
  QuestionTopic,
  Treatment,
  UrgencyLevel,
  VisitType,
} from './types/dental';

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadAppointments(),
  );
  const [questions, setQuestions] = useState<DentalQuestion[]>(() =>
    loadQuestions(),
  );

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [appointmentsDrawerOpen, setAppointmentsDrawerOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(
    null,
  );
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<
    string | undefined
  >(undefined);
  const [preselectedTreatmentId, setPreselectedTreatmentId] = useState<
    string | undefined
  >(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const confirmedCount = appointments.filter(
    (item) => item.status === 'Confirmed',
  ).length;

  const openBooking = (doctorId?: string, treatmentId?: string) => {
    setPreselectedDoctorId(doctorId);
    setPreselectedTreatmentId(treatmentId);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = (input: {
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
  }) => {
    const result = saveAppointment(input);
    if (result.ok) {
      setAppointments(result.appointments);
      setToastMessage(
        `Appointment confirmed for ${input.date} at ${input.timeSlot}.`,
      );
      return { ok: true as const, appointment: result.appointment };
    }
    return result;
  };

  const handleRescheduleAppointment = (
    id: string,
    newDate: string,
    newTimeSlot: string,
  ) => {
    const result = rescheduleAppointment(id, newDate, newTimeSlot);
    if (result.ok) {
      setAppointments(result.appointments);
      setToastMessage(`Appointment rescheduled to ${newDate} at ${newTimeSlot}.`);
      return { ok: true as const };
    }
    return result;
  };

  const handleCancelAppointment = (id: string) => {
    const updated = cancelAppointment(id);
    setAppointments(updated);
    setToastMessage('Appointment cancelled and slot released.');
  };

  const handleSubmitQuestion = (input: {
    patientName: string;
    patientEmail: string;
    topic: QuestionTopic;
    question: string;
  }) => {
    const updated = saveQuestion(input);
    setQuestions(updated);
    setToastMessage('Your dental question was posted to the specialist feed.');
  };

  const handleReplyQuestion = (
    questionId: string,
    doctorId: string,
    answerText: string,
  ) => {
    const updated = replyToQuestion(questionId, doctorId, answerText);
    setQuestions(updated);
    setToastMessage('Specialist answer published to the Q&A feed.');
  };

  const handleBookWithDoctor = (doctor: Doctor) => {
    setSelectedDoctor(null);
    openBooking(doctor.id, undefined);
  };

  const handleBookTreatment = (treatment: Treatment) => {
    setSelectedTreatment(null);
    openBooking(treatment.recommendedDoctorId, treatment.id);
  };

  return (
    <div className="min-h-screen bg-[#F0F5FB] text-slate-900">
      <Navbar
        appointmentCount={confirmedCount}
        onOpenBooking={() => openBooking()}
        onOpenAppointments={() => setAppointmentsDrawerOpen(true)}
      />

      <main>
        <HeroSection onBookVisit={() => openBooking()} />

        <TreatmentShowcase
          onSelectTreatment={(treatment) => setSelectedTreatment(treatment)}
          onQuickBook={(treatment) =>
            openBooking(treatment.recommendedDoctorId, treatment.id)
          }
        />

        <SpecialistGrid
          onSelectDoctor={(doctor) => setSelectedDoctor(doctor)}
          onBookWithDoctor={handleBookWithDoctor}
        />

        <AskDentistSection
          questions={questions}
          onSubmitQuestion={handleSubmitQuestion}
          onReplyQuestion={handleReplyQuestion}
          onBookConsultation={() => openBooking()}
        />

        <PreVisitSection />
      </main>

      <Footer onBookVisit={() => openBooking()} />

      <BookingModal
        isOpen={bookingModalOpen}
        initialDoctorId={preselectedDoctorId}
        initialTreatmentId={preselectedTreatmentId}
        existingAppointments={appointments}
        onClose={() => setBookingModalOpen(false)}
        onConfirmBooking={handleConfirmBooking}
      />

      <TreatmentDetailModal
        treatment={selectedTreatment}
        onClose={() => setSelectedTreatment(null)}
        onBookTreatment={handleBookTreatment}
      />

      <DoctorDetailModal
        doctor={selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        onBookDoctor={handleBookWithDoctor}
      />

      <AppointmentsDrawer
        isOpen={appointmentsDrawerOpen}
        appointments={appointments}
        onClose={() => setAppointmentsDrawerOpen(false)}
        onCancelAppointment={handleCancelAppointment}
        onRescheduleAppointment={handleRescheduleAppointment}
        onNewBooking={() => openBooking()}
      />

      <ToastPopup
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />
    </div>
  );
}
