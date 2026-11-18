import {
  Appointment,
  DentalQuestion,
  Doctor,
  FaqItem,
  PatientTestimonial,
  Treatment,
} from '../types/dental';

export const HERO_DENTIST_PATIENT_IMAGE =
  '/src/assets/images/hero_dentist_patient_care_1794910290150.jpg';

export const HERO_SMILE_IMAGE =
  '/src/assets/images/dental_white_smile_hero_1794909934520.jpg';

export const HERO_CLINIC_IMAGE =
  '/src/assets/images/hero_dentora_clinic_1794908433903.jpg';

export const DIGITAL_SCAN_IMAGE =
  '/src/assets/images/treatment_digital_scan_1794908435533.jpg';

export const CLEAR_ALIGNERS_IMAGE =
  '/src/assets/images/treatment_clear_aligners_1794909934982.jpg';

export const IMPLANT_CROWN_IMAGE =
  '/src/assets/images/treatment_implant_crown_1794909935068.jpg';

export const WHITENING_CARE_IMAGE =
  '/src/assets/images/treatment_whitening_care_1794909936015.jpg';

export const ROOT_CANAL_IMAGE =
  '/src/assets/images/treatment_root_canal_care_1794910680942.jpg';

export const MAX_SLOT_CAPACITY = 4;
export const CLINIC_WHATSAPP_DIGITS = '919840012345';
export const CLINIC_WHATSAPP_DISPLAY = '+91 98400 12345';

export const DOCTORS: Doctor[] = [
  {
    id: 'doc-ananya',
    name: 'Dr. Ananya Sharma',
    role: 'Cosmetic & Restorative Dentist',
    credentials: 'BDS, MDS (Prosthodontics)',
    experienceYears: 12,
    rating: '4.9',
    reviewCount: 318,
    availability: 'Mon – Fri · 9:00 AM – 5:30 PM',
    bio: 'Specializes in ultra-thin porcelain veneers, biocompatible ceramic crowns, and minimally invasive smile restorations.',
    imageUrl: '/src/assets/images/doctor_elena_vance_1794908434385.jpg',
    specialties: ['Porcelain Veneers', 'Smile Design', 'Laser Whitening'],
  },
  {
    id: 'doc-thomas',
    name: 'Dr. Thomas Alistair',
    role: 'Implantologist & Oral Surgeon',
    credentials: 'DDS, Fellow ICOI',
    experienceYears: 15,
    rating: '4.9',
    reviewCount: 402,
    availability: 'Tue – Sat · 10:00 AM – 6:30 PM',
    bio: 'Focuses on 3D CBCT-guided dental implants, painless wisdom tooth extractions, and full-arch restorative rehabilitation.',
    imageUrl: '/src/assets/images/doctor_marcus_chen_1794908434839.jpg',
    specialties: ['3D Guided Implants', 'Wisdom Tooth Surgery', 'Bone Grafting'],
  },
  {
    id: 'doc-priya',
    name: 'Dr. Priya Sharma',
    role: 'Orthodontist & Endodontist',
    credentials: 'BDS, MDS (Orthodontics)',
    experienceYears: 10,
    rating: '5.0',
    reviewCount: 274,
    availability: 'Mon – Sat · 9:30 AM – 6:00 PM',
    bio: 'Combines digital clear aligner planning with microscopic single-sitting root canal therapy for calm, predictable care.',
    imageUrl: '/src/assets/images/doctor_priya_nair_1794908436899.jpg',
    specialties: ['Clear Aligners', 'Microscopic Root Canal', 'Pediatric Care'],
  },
  {
    id: 'doc-rohan',
    name: 'Dr. Rohan Sharma',
    role: 'Pediatric & Preventive Dentist',
    credentials: 'BDS, MDS (Pedodontics)',
    experienceYears: 11,
    rating: '4.9',
    reviewCount: 246,
    availability: 'Mon – Sat · 9:00 AM – 5:00 PM',
    bio: 'Dedicated to anxiety-free children’s dentistry, painless pit-and-fissure sealants, and gentle preventive hygiene care.',
    imageUrl: '/src/assets/images/doctor_rohan_kulkarni_1794982116990.jpg',
    specialties: ['Kids Dentistry', 'Fluoride & Sealants', 'Habit Counseling'],
  },
  {
    id: 'doc-meera',
    name: 'Dr. Meera Iyer',
    role: 'Periodontist & Laser Gum Specialist',
    credentials: 'BDS, MDS (Periodontology)',
    experienceYears: 13,
    rating: '4.9',
    reviewCount: 215,
    availability: 'Tue – Sat · 10:00 AM – 6:00 PM',
    bio: 'Performs laser-assisted gum contouring, painless pocket therapy, and regenerative periodontal care for lasting tooth support.',
    imageUrl: '/src/assets/images/doctor_meera_iyer_1794982117233.jpg',
    specialties: ['Laser Gum Care', 'Bleeding Gums', 'Smile Contouring'],
  },
  {
    id: 'doc-kabir',
    name: 'Dr. Kabir Malhotra',
    role: 'Maxillofacial & TMJ Surgeon',
    credentials: 'BDS, MDS (OMFS)',
    experienceYears: 14,
    rating: '4.8',
    reviewCount: 189,
    availability: 'Mon – Fri · 11:00 AM – 6:30 PM',
    bio: 'Treats complex impacted wisdom teeth, jaw joint (TMJ) disorders, and facial trauma using low-radiation 3D imaging.',
    imageUrl: '/src/assets/images/doctor_kabir_malhotra_1794982117656.jpg',
    specialties: ['Impacted Wisdom Teeth', 'TMJ Jaw Care', 'Oral Surgery'],
  },
];

export const TREATMENTS: Treatment[] = [
  {
    id: 'tr-digital-scan',
    indexLabel: '01',
    title: '3D Intraoral Scanning & Ceramic Crowns',
    category: 'Cosmetic',
    duration: '45 min',
    summary:
      'Optical 3D tooth mapping eliminates messy putty impressions and crafts precision-milled zirconia crowns in a single visit.',
    imageUrl: DIGITAL_SCAN_IMAGE,
    steps: [
      'High-resolution 3D optical intraoral scan (2 minutes, radiation-free)',
      'Digital bite alignment & natural shade matching under daylight',
      'CAD/CAM milled ceramic restoration bonded under isolation',
    ],
    recommendedDoctorId: 'doc-ananya',
  },
  {
    id: 'tr-hygiene',
    indexLabel: '02',
    title: 'Guided Biofilm Cleaning & Exam',
    category: 'Preventive',
    duration: '35 min',
    summary:
      'Gentle warm-water ultrasonic scaling, enamel polishing, and digital cavity screening for long-term gum health.',
    imageUrl: HERO_SMILE_IMAGE,
    steps: [
      'Digital low-dose X-ray screening and gum pocket charting',
      'Warm-water air-polishing to remove plaque without scraping enamel',
      'Desensitizing fluoride varnish application',
    ],
    recommendedDoctorId: 'doc-ananya',
  },
  {
    id: 'tr-implants',
    indexLabel: '03',
    title: 'Guided Titanium Dental Implants',
    category: 'Implants & Ortho',
    duration: '60 min',
    summary:
      'Computer-guided keyhole implant placement designed for rapid healing and lifelike chewing strength.',
    imageUrl: IMPLANT_CROWN_IMAGE,
    steps: [
      '3D CBCT bone density mapping and custom surgical stent',
      'Minimally invasive keyhole titanium fixture placement',
      'Custom-shaded porcelain crown attachment after integration',
    ],
    recommendedDoctorId: 'doc-thomas',
  },
  {
    id: 'tr-aligners',
    indexLabel: '04',
    title: 'Clear Invisible Aligners',
    category: 'Implants & Ortho',
    duration: '30 min consult',
    summary:
      'Removable, BPA-free transparent aligner trays staged with digital tooth-movement previews before you start.',
    imageUrl: CLEAR_ALIGNERS_IMAGE,
    steps: [
      '3D digital arch scan and week-by-week smile simulation',
      'Custom series of precision-trimmed clear aligner trays',
      'Bi-monthly progress checks and final retention plan',
    ],
    recommendedDoctorId: 'doc-priya',
  },
  {
    id: 'tr-whitening',
    indexLabel: '05',
    title: 'Enamel-Safe Laser Whitening',
    category: 'Cosmetic',
    duration: '40 min',
    summary:
      'pH-balanced clinical whitening gel paired with cold-LED activation to brighten teeth up to 6 shades with zero sensitivity.',
    imageUrl: WHITENING_CARE_IMAGE,
    steps: [
      'Pre-whitening shade assessment and gingival barrier protection',
      'Three 10-minute cold-LED activated desensitizing gel cycles',
      'Post-care nano-hydroxyapatite remineralizing serum',
    ],
    recommendedDoctorId: 'doc-ananya',
  },
  {
    id: 'tr-root-canal',
    indexLabel: '06',
    title: 'Single-Visit Root Canal Care',
    category: 'Preventive',
    duration: '50 min',
    summary:
      'Microscope-assisted endodontic therapy under local comfort numbing to relieve deep toothache and preserve natural teeth.',
    imageUrl: ROOT_CANAL_IMAGE,
    steps: [
      'Targeted local anesthesia and rubber-dam isolation',
      'Microscopic rotary canal cleaning and ultrasonic disinfection',
      'Biocompatible sealing and protective restoration',
    ],
    recommendedDoctorId: 'doc-priya',
  },
];

export const INITIAL_QUESTIONS: DentalQuestion[] = [
  {
    id: 'q-101',
    patientName: 'Rohan Mehta',
    patientEmail: 'rohan.m@example.com',
    topic: 'Toothache & Sensitivity',
    question:
      'I feel a sharp twinge in my lower right molar whenever I drink cold water, but the pain fades within 5 seconds. Should I get it checked?',
    createdAt: '2026-11-14',
    answeredByDoctorName: 'Dr. Priya Sharma',
    answeredByRole: 'Orthodontist & Endodontist',
    answer:
      'Short sensitivity lasting under 10 seconds usually points to exposed dentin, a worn filling edge, or an early cavity rather than deep nerve inflammation. Avoid abrasive whitening pastes for now, use a potassium-nitrate toothpaste, and schedule a quick exam with an X-ray so we can seal it before it reaches the nerve.',
    status: 'Answered',
  },
  {
    id: 'q-102',
    patientName: 'Claire Bennett',
    patientEmail: 'claire.b@example.com',
    topic: 'Implants & Crowns',
    question:
      'How long does it take to heal after a single titanium dental implant, and can I return to office work the next day?',
    createdAt: '2026-11-12',
    answeredByDoctorName: 'Dr. Thomas Alistair',
    answeredByRole: 'Implantologist & Oral Surgeon',
    answer:
      'With 3D guided keyhole placement, most patients feel only mild soreness for 24–48 hours and comfortably return to desk work the next morning. Full bone integration takes 8–12 weeks before we attach your final porcelain crown, and we provide a discreet temporary tooth if it is in your smile zone.',
    status: 'Answered',
  },
  {
    id: 'q-103',
    patientName: 'Siddharth Rao',
    patientEmail: 'sid.rao@example.com',
    topic: 'Braces & Aligners',
    question:
      'I have minor crowding on my lower front teeth. Are clear aligners effective for adults in their 30s?',
    createdAt: '2026-11-09',
    answeredByDoctorName: 'Dr. Priya Sharma',
    answeredByRole: 'Orthodontist & Endodontist',
    answer:
      'Yes—age is never a barrier as long as your gums and supporting bone are healthy. Mild to moderate lower-arch crowding typically responds in 5 to 8 months with clear aligners worn 20–22 hours daily.',
    status: 'Answered',
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-2041',
    patientName: 'Meera Krishnan',
    patientAge: 29,
    patientEmail: 'meera.k@example.com',
    patientPhone: '4158902314',
    whatsappNumber: '4158902314',
    visitType: 'Returning Patient',
    urgency: 'Routine',
    reminderOptIn: true,
    doctorId: 'doc-ananya',
    treatmentId: 'tr-hygiene',
    date: '2026-11-20',
    timeSlot: '10:30 AM',
    notes: 'Routine 6-month cleaning and enamel sensitivity check.',
    status: 'Confirmed',
    createdAt: '2026-11-16',
  },
];

export const PATIENT_TESTIMONIALS: PatientTestimonial[] = [
  {
    id: 'test-1',
    patientName: 'Nadia Alvarez',
    procedure: '3D Ceramic Crown · Dr. Ananya Sharma',
    visitDate: 'October 2026',
    quote:
      'Before visiting Dentora, I dreaded dental impressions. The 3D scanner took two minutes and my ceramic crown matched my natural teeth on the first try.',
  },
  {
    id: 'test-2',
    patientName: 'David Park',
    procedure: 'Guided Implant · Dr. Thomas Alistair',
    visitDate: 'September 2026',
    quote:
      'Dr. Alistair walked me through my 3D CBCT scan step by step. Recovery was practically painless, and I was back at work the following morning.',
  },
  {
    id: 'test-3',
    patientName: 'Sana Kapoor',
    procedure: 'Clear Aligners · Dr. Priya Sharma',
    visitDate: 'November 2026',
    quote:
      'Seeing the digital simulation of my tooth alignment before committing gave me complete confidence. Every check-in ran right on schedule.',
  },
];

export const ACCEPTED_PLANS = [
  'Delta Dental PPO',
  'Cigna Dental',
  'Aetna Vital',
  'MetLife PDP Plus',
  'BlueCross Dental',
  'Direct Care Assistance',
];

export const PRE_VISIT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What should I bring to my first Dentora visit?',
    answer:
      'Please arrive 10 minutes early with a valid photo ID, any dental insurance details, and recent dental X-rays if taken within the last 6 months.',
  },
  {
    id: 'faq-2',
    question: 'Can I reschedule or cancel my appointment?',
    answer:
      'Yes. Open Appointments from the top bar to view your booking slip and reschedule to an open slot, or message our clinic desk on WhatsApp (+91 98400 12345) to request a cancellation.',
  },
  {
    id: 'faq-3',
    question: 'Does laser teeth whitening cause enamel sensitivity?',
    answer:
      'Our pH-balanced whitening gel uses cold-LED activation followed by a nano-hydroxyapatite serum to protect enamel and minimize post-visit sensitivity.',
  },
  {
    id: 'faq-4',
    question: 'Do you reserve slots for sudden toothache or emergencies?',
    answer:
      'Yes. Select "Urgent Pain" in the booking form and our reception desk prioritizes same-day pain relief evaluation.',
  },
];

export const TIME_SLOTS = [
  '09:30 AM',
  '10:30 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
];
