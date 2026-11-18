import { CheckCircle2, MessageSquarePlus, Search, Stethoscope } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { DOCTORS } from '../data/seedData';
import { DentalQuestion, QuestionTopic } from '../types/dental';

interface AskDentistSectionProps {
  questions: DentalQuestion[];
  onSubmitQuestion: (input: {
    patientName: string;
    patientEmail: string;
    topic: QuestionTopic;
    question: string;
  }) => void;
  onReplyQuestion: (
    questionId: string,
    doctorId: string,
    answerText: string,
  ) => void;
  onBookConsultation: () => void;
}

const TOPICS: QuestionTopic[] = [
  'Toothache & Sensitivity',
  'Cosmetic & Whitening',
  'Braces & Aligners',
  'Implants & Crowns',
  'Preventive Care',
];

const ALPHABETS_ONLY_REGEX = /^[A-Za-z\s.'-]{2,}$/;

export function AskDentistSection({
  questions,
  onSubmitQuestion,
  onReplyQuestion,
  onBookConsultation,
}: AskDentistSectionProps) {
  const [patientName, setPatientName] = useState('');
  const [nameHint, setNameHint] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [topic, setTopic] = useState<QuestionTopic>('Toothache & Sensitivity');
  const [questionText, setQuestionText] = useState('');
  const [formError, setFormError] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<'All' | QuestionTopic>('All');

  // Doctor reply composer state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDoctorId, setReplyDoctorId] = useState(DOCTORS[0].id);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState('');

  const handleNameChange = (rawValue: string) => {
    const cleaned = rawValue.replace(/[^A-Za-z\s.'-]/g, '');
    if (cleaned !== rawValue) {
      setNameHint('Only alphabets are allowed in your name (no numbers).');
    } else {
      setNameHint('');
    }
    setPatientName(cleaned);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    setSubmittedSuccess(false);

    if (!ALPHABETS_ONLY_REGEX.test(patientName.trim())) {
      setFormError(
        'Please enter your full name using alphabets only (at least 2 letters, no numbers).',
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail.trim())) {
      setFormError('Please enter a valid email address for specialist reply.');
      return;
    }

    if (questionText.trim().length < 15) {
      setFormError(
        'Please describe your dental symptom or question in at least 15 characters.',
      );
      return;
    }

    onSubmitQuestion({
      patientName,
      patientEmail,
      topic,
      question: questionText,
    });

    setPatientName('');
    setNameHint('');
    setPatientEmail('');
    setQuestionText('');
    setSubmittedSuccess(true);
  };

  const handlePublishReply = (questionId: string) => {
    setReplyError('');
    if (replyText.trim().length < 10) {
      setReplyError('Please write a clinical answer (at least 10 characters).');
      return;
    }
    onReplyQuestion(questionId, replyDoctorId, replyText);
    setReplyingToId(null);
    setReplyText('');
  };

  const filteredQuestions = questions.filter((item) => {
    const matchesTopic = topicFilter === 'All' || item.topic === topicFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.question.toLowerCase().includes(query) ||
      item.topic.toLowerCase().includes(query) ||
      (item.answer && item.answer.toLowerCase().includes(query));
    return matchesTopic && matchesSearch;
  });

  return (
    <section
      id="ask-sec"
      className="bg-gradient-to-b from-[#091830] to-[#0F274A] py-16 text-white lg:py-20"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-wide text-sky-300">
            Ask a Dentist Online
          </p>
          <h2
            className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            Have a dental concern? Get direct clinical guidance.
          </h2>
          <p className="mt-3 text-base text-slate-200">
            Submit your question below or browse verified answers from our
            specialists before booking an in-clinic exam.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Crisp White Form Card */}
          <div className="rounded-2xl border border-blue-200/30 bg-white p-6 text-slate-900 shadow-xl sm:p-7 lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <MessageSquarePlus
                className="h-5 w-5 text-blue-700"
                aria-hidden="true"
              />
              <h3 className="font-display text-lg font-bold text-slate-900">
                Submit a Dental Question
              </h3>
            </div>
            <p className="mt-1.5 text-sm text-slate-600">
              Questions are saved in your browser portal and can be answered
              directly by a specialist.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="ask-name"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Your Name
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Alphabets only
                  </span>
                </div>
                <input
                  id="ask-name"
                  type="text"
                  value={patientName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Aarav Patel"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
                {nameHint && (
                  <p className="mt-1 text-[11px] font-medium text-amber-700">
                    {nameHint}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="ask-email"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Email Address
                </label>
                <input
                  id="ask-email"
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label
                  htmlFor="ask-topic"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Dental Topic
                </label>
                <select
                  id="ask-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as QuestionTopic)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  {TOPICS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ask-question"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Describe Symptoms or Question
                </label>
                <textarea
                  id="ask-question"
                  rows={4}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Share when discomfort started, sensitivity triggers, or procedure questions..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              {formError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
                >
                  {formError}
                </p>
              )}

              {submittedSuccess && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs font-medium text-blue-900"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-700"
                    aria-hidden="true"
                  />
                  <span>
                    Question saved to the specialist feed. Need urgent relief?{' '}
                    <button
                      type="button"
                      onClick={onBookConsultation}
                      className="font-semibold underline underline-offset-2 cursor-pointer"
                    >
                      Book a same-day slot
                    </button>
                    .
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 active:scale-[0.99] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Post Question to Specialists
              </button>
            </form>
          </div>

          {/* Right Column: Search & Verified Specialist Q&A Feed */}
          <div className="space-y-5 lg:col-span-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search dental questions"
                  placeholder="Search toothache, implants, aligners..."
                  className="w-full rounded-lg border border-white/15 bg-white/[0.08] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
                />
              </div>

              <select
                aria-label="Filter Q&A by topic"
                value={topicFilter}
                onChange={(e) =>
                  setTopicFilter(e.target.value as 'All' | QuestionTopic)
                }
                className="rounded-lg border border-white/15 bg-[#122E58] px-3.5 py-2.5 text-sm font-medium text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
              >
                <option value="All">All Topics</option>
                {TOPICS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-8 text-center">
                <p className="text-sm font-semibold text-white">
                  No matching questions found.
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Clear your search filter or submit a new question using the
                  form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((item) => (
                  <article
                    key={item.id}
                    className="card-pop-dark rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sky-300">
                          {item.topic}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Asked by {item.patientName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">{item.createdAt}</span>
                      </div>
                      <span
                        className={`font-semibold ${
                          item.status === 'Answered'
                            ? 'text-sky-300'
                            : 'text-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h4 className="mt-2.5 font-display text-base font-bold text-white leading-snug">
                      {item.question}
                    </h4>

                    {item.answer ? (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="text-xs font-semibold text-sky-200">
                          {item.answeredByDoctorName} ·{' '}
                          <span className="font-normal text-slate-300">
                            {item.answeredByRole}
                          </span>
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
                          {item.answer}
                        </p>
                      </div>
                    ) : replyingToId === item.id ? (
                      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-xs font-semibold text-sky-200">
                            Replying Specialist
                          </label>
                          <select
                            value={replyDoctorId}
                            onChange={(e) => setReplyDoctorId(e.target.value)}
                            className="rounded-lg border border-white/20 bg-[#122E58] px-3 py-1.5 text-xs text-white"
                          >
                            {DOCTORS.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write specialist clinical advice..."
                          className="w-full rounded-lg border border-white/20 bg-white/[0.08] px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
                        />
                        {replyError && (
                          <p className="text-xs font-medium text-amber-300">
                            {replyError}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePublishReply(item.id)}
                            className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                          >
                            Publish Answer
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToId(null);
                              setReplyError('');
                            }}
                            className="rounded-lg border border-white/20 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                        <p className="text-xs text-slate-300">
                          Queued for specialist review.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(item.id);
                            setReplyText('');
                            setReplyError('');
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300 hover:text-white cursor-pointer"
                        >
                          <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" />
                          Specialist Reply
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
