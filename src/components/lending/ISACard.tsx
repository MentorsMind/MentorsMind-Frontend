import React from 'react';
import { ArrowRight, BadgeDollarSign, CalendarClock, Percent } from 'lucide-react';
import type { ISAOffer, SignatureMode } from '../../hooks/useISA';

interface ISACardProps {
  offer: ISAOffer;
  signatureMode: SignatureMode;
  isAccepting: boolean;
  onAccept: (offerId: string) => void;
}

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const ISACard: React.FC<ISACardProps> = ({ offer, signatureMode, isAccepting, onAccept }) => {
  const isAccepted = offer.status === 'accepted';

  return (
    <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/70">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">ISA Offer</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{offer.title}</h3>
          <p className="mt-2 text-sm text-slate-600">
            Backed by <span className="font-semibold text-slate-900">{offer.funderName}</span> for {offer.targetRole.toLowerCase()} outcomes.
          </p>
        </div>

        <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
          {signatureMode === 'freighter' ? 'Freighter signing' : 'Preview signing'}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <BadgeDollarSign className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Funded Amount</span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-950">{currency(offer.fundedAmount)}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Percent className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Share</span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-950">{offer.sharePercent}%</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <ArrowRight className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Cap Multiple</span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-950">{offer.capMultiple}x</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <CalendarClock className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Duration</span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-950">{offer.durationMonths} mo</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
        <p className="text-sm font-semibold text-slate-900">Use of funds</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{offer.useOfFunds}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{offer.timelineLabel}</p>
      </div>

      <button
        type="button"
        onClick={() => onAccept(offer.id)}
        disabled={isAccepted || isAccepting}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black transition-all ${
          isAccepted
            ? 'cursor-not-allowed bg-emerald-50 text-emerald-700'
            : 'bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800'
        } disabled:opacity-70`}
      >
        {isAccepted ? 'Accepted' : isAccepting ? 'Awaiting signature...' : 'Accept ISA'}
      </button>
    </article>
  );
};

export default ISACard;
