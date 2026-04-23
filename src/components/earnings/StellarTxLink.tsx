import { truncateTxHash, buildStellarUrl } from '../../utils/earnings.utils';

interface StellarTxLinkProps {
  txHash?: string | null;
}

export default function StellarTxLink({ txHash }: StellarTxLinkProps) {
  if (!txHash) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <a
      href={buildStellarUrl(txHash)}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
    >
      {truncateTxHash(txHash)}
    </a>
  );
}
