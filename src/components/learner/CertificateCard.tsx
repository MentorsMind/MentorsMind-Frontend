import React, { useEffect, useMemo, useState } from 'react';
import { useShare } from '../../hooks/useShare';
import { applyMetaTags, buildCertificateTwitterMeta } from '../../utils/og-meta.utils';

export interface CertificateCardProps {
  skill: string;
  earnedAt?: string;
  certificateId?: string;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  skill,
  earnedAt,
  certificateId,
}) => {
  const { share } = useShare();
  const [status, setStatus] = useState<string>('');

  const shareUrl = useMemo(() => {
    const id = certificateId ?? skill.toLowerCase().replace(/\s+/g, '-');
    return `${window.location.origin}/certificates/${id}`;
  }, [certificateId, skill]);

  useEffect(() => {
    const cleanup = applyMetaTags(buildCertificateTwitterMeta(skill));
    return cleanup;
  }, [skill]);

  const handleShareCertificate = async () => {
    try {
      const message = `I earned a ${skill} certificate on MentorMinds!`;
      const result = await share({
        title: `${skill} Certificate`,
        text: message,
        url: shareUrl,
      });

      setStatus(result.method === 'native' ? 'Shared successfully.' : 'Certificate link copied to clipboard.');
    } catch {
      setStatus('Unable to share right now.');
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-gray-900">{skill} Certificate</h4>
          <p className="mt-1 text-xs text-gray-600">
            {earnedAt ? `Earned ${new Date(earnedAt).toLocaleDateString()}` : 'Certificate unlocked'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleShareCertificate}
          className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
        >
          Share Certificate
        </button>
      </div>
      {status && <p className="mt-2 text-xs font-medium text-emerald-700">{status}</p>}
    </div>
  );
};

export default CertificateCard;