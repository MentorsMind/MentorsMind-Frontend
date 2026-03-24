import { useState } from 'react';

const faqs = [
  {
    q: 'How does escrow protection work?',
    a: 'Funds are held securely until the mentor completes the session. If issues arise, a fair resolution process is followed.',
  },
  {
    q: 'Do I need a bank account to use the platform?',
    a: 'No. Stellar enables borderless payments without traditional banking. You can use supported wallets.',
  },
  {
    q: 'What are the fees?',
    a: 'Mentors earn 80% per session. The platform takes 20% to support operations. Stellar network fees are minimal.',
  },
  {
    q: 'Is transaction history transparent?',
    a: 'Yes. Stellar provides on-chain transparency and auditable records for all payments.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" aria-label="FAQ" className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
          <p className="text-gray-600 mt-3">Answers to common questions about the platform.</p>
        </div>
        <div className="mt-8 max-w-3xl mx-auto divide-y divide-gray-100 rounded-3xl border border-gray-100 bg-white">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q}>
                <button
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between"
                >
                  <span className="font-bold">{item.q}</span>
                  <span aria-hidden="true" className="text-stellar">{isOpen ? '−' : '+'}</span>
                </button>
                <div
                  id={`faq-panel-${i}`}
                  hidden={!isOpen}
                  className="px-6 pb-6 text-gray-600"
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
