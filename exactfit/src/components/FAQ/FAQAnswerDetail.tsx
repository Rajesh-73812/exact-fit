'use client';

import { useState, useRef } from 'react';
import {
  Search,
  Phone,
  ChevronDown,
  Wrench,
  Zap,
  Droplets,
  Sparkles,
  Trees,
  Building2,
  ArrowRight,
} from 'lucide-react';
import Navbar from '../Navbar/Navbar';

/* ================= FAQ DATA ================= */

const FAQS = [
  {
    id: 0,
    question: 'What services does Exact Fit provide?',
    answer:
      'Exact Fit provides air conditioning, electrical, plumbing, cleaning, gardening, and building maintenance services for residential and commercial properties.',
  },
  {
    id: 1,
    question: 'How do I schedule a service appointment?',
    answer:
      'You can schedule a service appointment online through our website, by calling our support number, or by using the mobile app.',
  },
  {
    id: 2,
    question: 'Do you offer emergency services?',
    answer:
      'Yes, we offer 24/7 emergency services for AC, plumbing, and electrical issues.',
  },
  {
    id: 3,
    question: 'What are your maintenance package options?',
    answer:
      'We offer Basic, Standard, and Executive maintenance packages with varying service frequencies and benefits.',
  },
  {
    id: 4,
    question: 'Are your technicians licensed and insured?',
    answer:
      'Yes, all Exact Fit technicians are fully licensed, background-verified, and insured.',
  },
  {
    id: 5,
    question: 'What is your pricing structure?',
    answer:
      'Pricing depends on the service type, scope of work, and urgency. Transparent pricing is provided before service begins.',
  },
  {
    id: 6,
    question: 'What is your cancellation and rescheduling policy?',
    answer:
      'Appointments can be cancelled or rescheduled up to 4 hours in advance without any charges.',
  },
  {
    id: 7,
    question: 'Do you provide warranties on your work?',
    answer:
      'Yes, all services come with a workmanship warranty. Some services also include manufacturer warranties.',
  },
  {
    id: 8,
    question: 'What payment methods do you accept?',
    answer:
      'We accept cash, credit/debit cards, online payments, and bank transfers.',
  },
  {
    id: 9,
    question: 'How do I prepare for a service visit?',
    answer:
      'Ensure access to the service area, secure pets, and keep relevant documents or previous service details handy.',
  },
];

/* ================= SERVICE CATEGORIES ================= */

const SERVICE_CATEGORIES = [
  { title: 'Air Conditioning', desc: 'Installation, maintenance, repairs, and emergency AC', count: 45, icon: Wrench },
  { title: 'Electrical Services', desc: 'Wiring, repairs, upgrades, panel installations', count: 38, icon: Zap },
  { title: 'Plumbing', desc: 'Leak repairs, pipe installations, drain cleaning', count: 52, icon: Droplets },
  { title: 'Cleaning Services', desc: 'Residential & commercial cleaning services', count: 29, icon: Sparkles },
  { title: 'Gardening', desc: 'Landscaping, trimming, lawn care', count: 34, icon: Trees },
  { title: 'Building Services', desc: 'Renovations, repairs, painting, carpentry', count: 41, icon: Building2 },
];

/* ================= TRENDING ================= */

const TRENDING = [
  { q: 'How often should I service my air conditioning?', cat: 'Air Conditioning', views: '15,847' },
  { q: "What's included in the Executive maintenance plan?", cat: 'Maintenance Plans', views: '12,563' },
  { q: 'Do you offer same-day emergency plumbing?', cat: 'Plumbing', views: '11,294' },
  { q: 'How much does electrical panel upgrade cost?', cat: 'Electrical', views: '9,876' },
  { q: 'What areas do you provide services in?', cat: 'General', views: '8,945' },
  { q: 'Can I customize my maintenance package?', cat: 'Maintenance Plans', views: '7,632' },
];

/* ================= COMPONENT ================= */

export default function FAQHomepage() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const faqRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectSuggestion = (faqId: number) => {
    setOpenId(faqId);
    setShowSuggestions(false);

    setTimeout(() => {
      faqRefs.current[faqId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  };

  return (
    <div className="w-full bg-white">
      <div className="p-8">
        <Navbar />
      </div>

      {/* ================= HERO ================= */}
      <section className="py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          How Can We Help You Today?
        </h1>

        <p className="text-gray-500 max-w-2xl mx-auto mb-6">
          Search our comprehensive FAQ knowledge center for instant answers
        </p>

        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Search for answers..."
            className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
          />

          {showSuggestions && search && (
            <div className="absolute z-20 w-full bg-white border rounded-lg mt-1 shadow-md">
              {filteredFaqs.map((f) => (
                <div
                  key={f.id}
                  onClick={() => handleSelectSuggestion(f.id)}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-100"
                >
                  <p className="font-medium">{f.question}</p>
                  <p className="text-xs text-gray-500 truncate">{f.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= QUICK HELP ================= */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">
            Quick Help Center
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((f) => (
              <div
                key={f.id}
                ref={(el) => {
                  faqRefs.current[f.id] = el;
                }}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition ${
                  openId === f.id ? 'ring-2 ring-red-500' : ''
                }`}
                onClick={() =>
                  setOpenId(openId === f.id ? null : f.id)
                }
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium">{f.question}</p>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      openId === f.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {openId === f.id && (
                  <p className="text-sm text-gray-600 mt-3">{f.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SERVICE CATEGORIES ================= */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_CATEGORIES.map((c, i) => (
              <div key={i} className="border rounded-xl p-5">
                <c.icon className="w-6 h-6 text-red-500 mb-3" />
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TRENDING ================= */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-6">
          {TRENDING.map((t, i) => (
            <div key={i} className="bg-white border rounded-xl p-5 flex gap-4">
              <div className="bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-md font-bold">
                {i + 1}
              </div>
              <div>
                <p className="font-medium">{t.q}</p>
                <p className="text-xs text-gray-400">
                  {t.cat} · {t.views} views
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= NEED MORE HELP ================= */}
      <section className="py-16 text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto px-4">
          {['Schedule Service', 'Get a Quote', 'Contact Support'].map((t, i) => (
            <div key={i} className="border rounded-xl p-6 flex justify-between">
              <span className="font-medium">{t}</span>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
