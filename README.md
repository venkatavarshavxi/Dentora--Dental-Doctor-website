Dentora — Dental Studio & Patient Care Portal
A modern, responsive dental clinic web application built with React 19, TypeScript, Vite, and Tailwind CSS v4. Dentora allows patients to explore treatments, consult board-certified dental specialists, book chair slots with QR-coded appointment slips, share slips via WhatsApp, and ask dental questions online — alongside a dedicated Doctor Dashboard for specialists.
Live Website: https://dentora-dental-doctor-website.vercel.app/
Features
Specialist Directory & Fixed Procedures: Browse 6 board-certified dental specialists, each paired with their dedicated primary procedure in the booking flow.
Interactive Treatment Explorer: Explore preventive, restorative, cosmetic, endodontic, orthodontic, pediatric, periodontal, and maxillofacial treatments with clinical step-by-step care details.
Instant Appointment Booking & QR Slips:
Real-time chair slot availability (Mon – Sat, closed Sundays, max capacity enforcement per slot).
Auto-generated booking reference ID, QR pass, Print/PDF support, and downloadable HTML appointment slip.
One-click Send Slip on WhatsApp and direct Clinic Desk WhatsApp link.
Customer & Doctor Accounts:
Patients: Sign up or log in to pre-fill booking forms, view personal appointments, reschedule slots, and download/share slips.
Doctors: Dedicated Doctor Dashboard to inspect scheduled patients by specialist, cancel or reschedule visits, and publish specialist answers in the Ask a Dentist Q&A.
Ask a Dentist Q&A: Patients can submit dental questions; verified specialists can answer them directly from the Q&A panel or Doctor Dashboard.
Browser Persistence: Uses localStorage so appointments, Q&A threads, and accounts persist seamlessly across page reloads without requiring a backend server.
Tech Stack
Frontend: React 19, TypeScript, Vite
Styling: Tailwind CSS v4
Icons & Utilities: Lucide React, qrcode
Deployment: Vercel (connected to GitHub for automatic deployments)
Getting Started (Local Development)
1. Clone the Repository
Bash
git clone https://github.com/venkatavarshavxi/Dentora--Dental-Doctor-website.git
cd Dentora--Dental-Doctor-website
2. Install Dependencies
Bash
npm install --legacy-peer-deps
3. Run the Development Server
Bash
npm run dev
The app will start on http://localhost:3000.
4. Build & Type-Check
Bash
npm run lint
npm run build
Demo Accounts
Patient Account
Email: meera.k@example.com
Password: patient123
(New patients can also create an account directly from the Login / Sign Up modal.)
Specialist (Doctor) Accounts
All specialist accounts use password doctor123:
ananya@dentora.com — Dr. Ananya Sharma (Cosmetic & Restorative Dentist)
thomas@dentora.com — Dr. Thomas Alistair (Implantologist & Oral Surgeon)
priya@dentora.com — Dr. Priya Sharma (Orthodontist & Endodontist)
rohan@dentora.com — Dr. Rohan Sharma (Pediatric & Preventive Dentist)
meera@dentora.com — Dr. Meera Iyer (Periodontist & Laser Gum Specialist)
kabir@dentora.com — Dr. Kabir Malhotra (Maxillofacial & TMJ Surgeon)
Project Structure
Text
├── database/               # Reference SQL schema and JSON seed snapshot
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Clinic & specialist imagery
│   ├── components/         # UI sections, booking modal, slip card, doctor dashboard
│   ├── data/               # Seed data for doctors, treatments, slots, Q&A
│   ├── db/                 # localStorage stores for appointments, Q&A, and auth
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Clinic date helpers, HTML slip exporter, WhatsApp URL builder
│   ├── App.tsx             # Root application & state coordination
│   └── main.tsx            # App entry point
├── index.html
├── package.json
└── vite.config.ts
Deployment on Vercel
This project requires no environment variables to run in production. Every push to the main branch on GitHub automatically triggers a Vite production build (npm run build → dist/) and updates the live Vercel deployment.