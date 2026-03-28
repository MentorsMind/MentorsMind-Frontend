import React, { useEffect, useId } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { LearningCertificate } from '../../types/learner.types';
import { getCertificateVerificationUrl } from '../../utils/certificate.utils';
import { getStellarExpertLink, getAccountLink } from '../../utils/stellar.utils';

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const titleId = useId();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export interface CertificateQrModalProps {
  open: boolean;
  certificate: LearningCertificate | null;
  onClose: () => void;
}

export const CertificateQrModal: React.FC<CertificateQrModalProps> = ({
  open,
  certificate,
  onClose,
}) => {
  if (!open || !certificate) return null;
  const url = getCertificateVerificationUrl(certificate);

  return (
    <ModalShell title="Verify certificate" onClose={onClose}>
      <p className="mb-4 text-sm text-gray-600">
        Scan this code to open the public verification page. Employers can confirm this credential
        without logging in.
      </p>
      <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <QRCodeSVG value={url} size={200} level="M" includeMargin />
        <p className="max-w-full break-all text-center text-xs text-gray-500">{url}</p>
      </div>
    </ModalShell>
  );
};

export interface CertificateDetailModalProps {
  open: boolean;
  certificate: LearningCertificate | null;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-gray-100 py-2 sm:grid-cols-3 sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 sm:col-span-2">{value}</dd>
    </div>
  );
}

export const CertificateDetailModal: React.FC<CertificateDetailModalProps> = ({
  open,
  certificate,
  onClose,
}) => {
  if (!open || !certificate) return null;
  const url = getCertificateVerificationUrl(certificate);

  return (
    <ModalShell title="Certificate details" onClose={onClose}>
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <dl>
          <DetailRow label="Skill" value={certificate.skillName} />
          <DetailRow label="Mentor" value={certificate.mentorName} />
          <DetailRow label="Sessions completed" value={certificate.sessionsCompleted} />
          <DetailRow label="Issued" value={new Date(certificate.issuedAt).toLocaleString()} />
          <DetailRow
            label="Status"
            value={
              certificate.status === 'verified' ? (
                <span className="text-emerald-700">Verified (on-chain)</span>
              ) : (
                <span className="text-amber-800">Revoked</span>
              )
            }
          />
          <DetailRow
            label="Verification token"
            value={<code className="text-xs">{certificate.verificationToken}</code>}
          />
          <DetailRow label="Verification URL" value={<span className="break-all text-xs">{url}</span>} />
          {certificate.contractId ? (
            <DetailRow
              label="Contract"
              value={
                <a
                  href={getAccountLink(certificate.contractId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  {certificate.contractId}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              }
            />
          ) : null}
          {certificate.mintTxHash ? (
            <DetailRow
              label="Mint transaction"
              value={
                <a
                  href={getStellarExpertLink(certificate.mintTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  View on Stellar Expert
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              }
            />
          ) : null}
          {certificate.mentorPublicKey ? (
            <DetailRow
              label="Mentor public key"
              value={
                <a
                  href={getAccountLink(certificate.mentorPublicKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 break-all text-blue-600 hover:underline"
                >
                  {certificate.mentorPublicKey}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </a>
              }
            />
          ) : null}
        </dl>
      </div>
    </ModalShell>
  );
};
