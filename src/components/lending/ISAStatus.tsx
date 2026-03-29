import React from 'react';
import { BadgeCheck, Clock3, Coins, Sparkles } from 'lucide-react';
import type { ISAAgreement } from '../../hooks/useISA';

interface ISAStatusProps {
  agreement: ISAAgreement;
}

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const ISAStatus: React.FC<ISAStatusProps> = ({ agreement }) => {
  const completionPercent = Math.min(100, Math.round((agreement.repaidAmount / agreement.totalCap) * 100));

  return (
    <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Active ISA Status</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{agreement.title}</h2>
          <p className="mt-2 text-sm text-slate-600">
            Funded by <span className="font-semibold text-slate-900">{agreement.funderName}</span> for {agreement.learnerName}.
          </p>
        </div>

        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
          agreement.status === 'completed'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-slate-950 text-white'
        }`}>
          {agreement.status === 'completed' ? <Sparkles className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
          {agreement.status === 'completed' ? 'Cap reached' : 'Active'}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total funded</p>
          <p className="mt-3 text-2xl font-black text-slate-950">{currency(agreement.fundedAmount)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total repaid</p>
          <p className="mt-3 text-2xl font-black text-slate-950">{currency(agreement.repaidAmount)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Remaining cap</p>
          <p className="mt-3 text-2xl font-black text-slate-950">{currency(agreement.remainingCap)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Months left</p>
          <p className="mt-3 text-2xl font-black text-slate-950">{agreement.monthsLeft}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Repayment progress</p>
            <p className="mt-2 text-2xl font-black">{completionPercent}% of cap returned</p>
          </div>
          <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
            {agreement.sharePercent}% income share
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400"
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="flex items-center gap-2 text-white/70">
              <Coins className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">Cap</span>
            </div>
            <p className="mt-3 text-xl font-black">{currency(agreement.totalCap)}</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="flex items-center gap-2 text-white/70">
              <Clock3 className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">Duration</span>
            </div>
            <p className="mt-3 text-xl font-black">{agreement.durationMonths} months</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Signature</p>
            <p className="mt-3 text-sm font-semibold text-white">{agreement.signatureLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ISAStatus;
