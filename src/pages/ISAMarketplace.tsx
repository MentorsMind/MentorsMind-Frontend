import React, { useState } from 'react';
import { CheckCircle2, CircleDollarSign, HandCoins, Sparkles, WalletCards } from 'lucide-react';
import MetricCard from '../components/charts/MetricCard';
import LineChart from '../components/charts/LineChart';
import ISACard from '../components/lending/ISACard';
import ISAStatus from '../components/lending/ISAStatus';
import { useISA } from '../hooks/useISA';

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const ISAMarketplace: React.FC = () => {
  const {
    offers,
    activeAgreement,
    completedAgreement,
    repaymentHistory,
    portfolioItems,
    portfolioReturns,
    portfolioSummary,
    explainerSteps,
    faqItems,
    acceptingOfferId,
    acceptanceState,
    acceptanceMessage,
    signatureMode,
    signatureHint,
    acceptOffer,
  } = useISA();
  const [perspective, setPerspective] = useState<'learner' | 'funder'>('learner');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.10),_transparent_38%),linear-gradient(180deg,_#f8fafc,_#ffffff)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-[2.5rem] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-950/10 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Income Share Agreements</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Capital for learners, transparent returns for funders
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Review ISA offers, accept them with a wallet-backed signature flow, track repayment progress, and give funders a clean portfolio view of deployed capital and earnings.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Signature mode</p>
                <p className="mt-2 text-lg font-black text-white">{signatureMode === 'freighter' ? 'Freighter' : 'Preview'}</p>
                <p className="mt-1 text-sm text-slate-300">{signatureHint}</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Active repayment cap</p>
                <p className="mt-2 text-lg font-black text-white">{currency(activeAgreement.remainingCap)}</p>
                <p className="mt-1 text-sm text-slate-300">{activeAgreement.monthsLeft} months left on the current ISA</p>
              </div>
            </div>
          </div>

          <div className="mt-8 inline-flex rounded-full bg-white/10 p-1">
            {([
              { key: 'learner', label: 'Learner view' },
              { key: 'funder', label: 'Funder view' },
            ] as const).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPerspective(item.key)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                  perspective === item.key ? 'bg-white text-slate-950' : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-8 space-y-8">
          {perspective === 'learner' ? (
            <>
              <section className="grid gap-6 xl:grid-cols-[1.5fr_0.95fr]">
                <ISAStatus agreement={activeAgreement} />

                <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Accept ISA</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">Signature flow status</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Accepting an offer requests a signature from Freighter when available. Without the extension, the UI falls back to preview mode so the agreement journey can still be reviewed.
                  </p>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-2 ${
                        acceptanceState === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {acceptanceState === 'error' ? <CircleDollarSign className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Current state: {acceptanceState.replace('-', ' ')}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{acceptanceMessage}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Repayment cap</p>
                      <p className="mt-3 text-2xl font-black text-slate-950">{currency(activeAgreement.totalCap)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Share percentage</p>
                      <p className="mt-3 text-2xl font-black text-slate-950">{activeAgreement.sharePercent}%</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Available offers</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Choose an ISA that matches your current ramp</h2>
                  </div>
                  <div className="rounded-full bg-teal-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                    Wallet-backed acceptance
                  </div>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-3">
                  {offers.map((offer) => (
                    <ISACard
                      key={offer.id}
                      offer={offer}
                      signatureMode={signatureMode}
                      isAccepting={acceptingOfferId === offer.id}
                      onAccept={acceptOffer}
                    />
                  ))}
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <LineChart
                  title="Repayment History"
                  description="Monthly earnings reported and the portion shared under the active ISA."
                  data={repaymentHistory}
                  series={[
                    { key: 'sharedAmount', name: 'Earnings shared', color: '#0f766e' },
                    { key: 'reportedIncome', name: 'Reported income', color: '#0f172a' },
                  ]}
                  valuePrefix="$"
                />

                <div className="rounded-[2rem] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white shadow-xl shadow-emerald-500/10">
                  <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/90">
                    ISA completion celebration
                  </div>
                  <h2 className="mt-4 text-3xl font-black">{completedAgreement.learnerName} reached the cap</h2>
                  <p className="mt-3 text-sm leading-6 text-emerald-50">
                    {completedAgreement.title} closed in {completedAgreement.completedAt} after returning {currency(completedAgreement.totalCap)} to {completedAgreement.funderName}. No further income share is due.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Funded</p>
                      <p className="mt-3 text-2xl font-black">{currency(completedAgreement.fundedAmount)}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Returned</p>
                      <p className="mt-3 text-2xl font-black">{currency(completedAgreement.repaidAmount)}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Cap multiple</p>
                      <p className="mt-3 text-2xl font-black">{completedAgreement.capMultiple}x</p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Total deployed" value={currency(portfolioSummary.totalDeployed)} icon={<HandCoins className="h-5 w-5" />} />
                <MetricCard title="Total returned" value={currency(portfolioSummary.totalReturned)} icon={<CircleDollarSign className="h-5 w-5" />} />
                <MetricCard title="Active ISAs" value={portfolioSummary.activeCount} icon={<WalletCards className="h-5 w-5" />} />
                <MetricCard title="Return multiple" value={portfolioSummary.avgReturnMultiple.toFixed(2)} suffix="x" icon={<Sparkles className="h-5 w-5" />} />
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Funder portfolio</p>
                      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Active ISAs and expected returns</h2>
                    </div>
                    <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                      {portfolioItems.length} positions
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {portfolioItems.map((item) => (
                      <article key={item.id} className="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-black text-slate-950">{item.learnerName}</h3>
                            <p className="text-sm text-slate-600">{item.track}</p>
                          </div>
                          <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                            item.status === 'Cap reached'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-950 text-white'
                          }`}>
                            {item.status}
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Funded</p>
                            <p className="mt-2 text-xl font-black text-slate-950">{currency(item.fundedAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Returned</p>
                            <p className="mt-2 text-xl font-black text-slate-950">{currency(item.returnedAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Remaining cap</p>
                            <p className="mt-2 text-xl font-black text-slate-950">{currency(item.remainingCap)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Months left</p>
                            <p className="mt-2 text-xl font-black text-slate-950">{item.monthsLeft}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
                          <span>{item.sharePercent}% share | {item.capMultiple}x cap</span>
                          <span className="font-semibold text-slate-900">Next payout estimate: {currency(item.nextPayoutAmount)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <LineChart
                  title="Portfolio Earnings"
                  description="Returned cash flow over time across all active ISA positions."
                  data={portfolioReturns}
                  series={[
                    { key: 'returned', name: 'Total returned', color: '#0891b2' },
                    { key: 'deployed', name: 'Total deployed', color: '#0f172a' },
                  ]}
                  valuePrefix="$"
                />
              </section>
            </>
          )}

          <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">How ISAs work</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">A simple contract structure learners and funders can both trust</h2>

              <div className="mt-6 grid gap-4">
                {explainerSteps.map((step) => (
                  <div key={step.title} className="rounded-[1.75rem] bg-slate-50 p-5">
                    <h3 className="text-lg font-black text-slate-950">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">FAQ</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Answers before you accept or deploy</h2>

              <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-[1.75rem] border border-slate-100">
                {faqItems.map((item, index) => {
                  const isOpen = openFaqIndex === index;

                  return (
                    <div key={item.question} className="bg-white">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="font-semibold text-slate-950">{item.question}</span>
                        <span className="text-lg font-black text-teal-600">{isOpen ? '-' : '+'}</span>
                      </button>
                      {isOpen && <p className="px-5 pb-5 text-sm leading-6 text-slate-600">{item.answer}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ISAMarketplace;
