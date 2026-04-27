import { useNavigate } from 'react-router-dom';
import { STELLAR_CONFIG } from '../../config/stellar.config';

interface Props {
  txHash: string;
  mentorName: string;
}

export default function SuccessScreen({ txHash, mentorName }: Props) {
  const navigate = useNavigate();
  const explorerUrl = `${STELLAR_CONFIG.explorerUrl}${txHash}`;

  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      <div className="text-6xl">🎉</div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Payment confirmed</h2>
        <p className="text-gray-500 mt-1 text-sm">Your session with {mentorName} is booked.</p>
      </div>

      <div className="w-full bg-gray-50 rounded-lg border border-gray-200 p-4 text-left space-y-1">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Transaction hash</p>
        <p className="text-xs font-mono text-gray-700 break-all">{txHash}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition-colors"
        >
          View on Stellar Explorer ↗
        </a>
        <button
          onClick={() => navigate('/learner/sessions')}
          className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Go to My Sessions
        </button>
      </div>
    </div>
  );
}
