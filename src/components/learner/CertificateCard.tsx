import React from 'react';
import { Award, CheckCircle2, Share2, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import type { LearningCertificate } from '../../types/learner.types';
import { getCertificateVerificationUrl } from '../../utils/certificate.utils';

export interface CertificateCardProps {
  certificate: LearningCertificate;
  onOpenDetail: (cert: LearningCertificate) => void;
  onOpenQr: (cert: LearningCertificate) => void;
}

function formatIssueDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate: cert,
  onOpenDetail,
  onOpenQr,
}) => {
  const isRevoked = cert.status === 'revoked';
  const url = getCertificateVerificationUrl(cert);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Verification link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <article
      className={`relative flex flex-col rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
        isRevoked ? 'border-amber-200 opacity-90' : 'border-gray-200'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Award className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3
              className={`text-sm font-semibold text-gray-900 ${isRevoked ? 'line-through decoration-2' : ''}`}
            >
              {cert.skillName}
            </h3>
            <p className={`truncate text-xs text-gray-500 ${isRevoked ? 'line-through' : ''}`}>
              with {cert.mentorName}
            </p>
          </div>
        </div>
        {isRevoked ? (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
            Revoked
          </span>
        ) : (
          <span
            className="inline-flex shrink-0 cursor-default items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700"
            title="On-chain verified"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">On-chain verified</span>
          </span>
        )}
      </div>

      <dl className="mb-4 space-y-1 text-xs text-gray-600">
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Sessions</dt>
          <dd className={`font-medium text-gray-900 ${isRevoked ? 'line-through' : ''}`}>
            {cert.sessionsCompleted}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Issued</dt>
          <dd className={`font-medium text-gray-900 ${isRevoked ? 'line-through' : ''}`}>
            {formatIssueDate(cert.issuedAt)}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onOpenDetail(cert)}
          className="flex-1 min-w-[6rem] rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100"
        >
          Details
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex flex-1 min-w-[6rem] items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-100"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden />
          Share Certificate
        </button>
        <button
          type="button"
          onClick={() => onOpenQr(cert)}
          className="inline-flex flex-1 min-w-[6rem] items-center justify-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          title="Show QR code for verification"
        >
          <QrCode className="h-3.5 w-3.5" aria-hidden />
          QR
        </button>
      </div>
    </article>
  );
};
