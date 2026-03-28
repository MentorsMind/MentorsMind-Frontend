import React, { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { useCertificates } from '../../hooks/useCertificates';
import type { LearningCertificate } from '../../types/learner.types';
import { CertificateCard } from './CertificateCard';
import { CertificateDetailModal, CertificateQrModal } from './CertificateModal';

function CertificateSkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex gap-2">
        <div className="h-9 w-9 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-[75%] rounded bg-gray-200" />
          <div className="h-3 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-2/3 rounded bg-gray-100" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 flex-1 rounded-lg bg-gray-200" />
        <div className="h-8 flex-1 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

export interface CertificateGridProps {
  learnerId: string;
}

export const CertificateGrid: React.FC<CertificateGridProps> = ({ learnerId }) => {
  const { certificates, isLoading, error } = useCertificates(learnerId);
  const [detailCert, setDetailCert] = useState<LearningCertificate | null>(null);
  const [qrCert, setQrCert] = useState<LearningCertificate | null>(null);

  return (
    <>
      <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ScrollText className="h-5 w-5 mr-2 text-blue-500" aria-hidden />
          Learning certificates
        </h2>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CertificateSkeletonCard key={i} />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <ScrollText className="mx-auto mb-3 h-10 w-10 text-gray-300" aria-hidden />
            <p className="text-sm font-medium text-gray-700">Complete sessions to earn certificates</p>
            <p className="mt-1 text-xs text-gray-500">
              Soulbound certificates appear here after verified mentorship sessions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {certificates.map((cert) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                onOpenDetail={setDetailCert}
                onOpenQr={setQrCert}
              />
            ))}
          </div>
        )}
      </section>

      <CertificateDetailModal
        open={detailCert !== null}
        certificate={detailCert}
        onClose={() => setDetailCert(null)}
      />
      <CertificateQrModal open={qrCert !== null} certificate={qrCert} onClose={() => setQrCert(null)} />
    </>
  );
};
