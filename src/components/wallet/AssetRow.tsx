interface AssetRowProps {
  icon: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  trusted: boolean;
  onSend: () => void;
  onReceive: () => void;
  onToggleTrustline: () => void;
}

export function AssetRow({
  icon,
  name,
  balance,
  usdValue,
  change24h,
  trusted,
  onSend,
  onReceive,
  onToggleTrustline,
}: AssetRowProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-gray-500">Balance: {balance}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold">${usdValue.toFixed(2)}</p>
          <p
            className={`text-sm ${
              change24h >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {change24h >= 0 ? "+" : ""}
            {change24h}%
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onSend}
          className="px-3 py-1 rounded bg-blue-500 text-white text-sm"
        >
          Send
        </button>

        <button
          onClick={onReceive}
          className="px-3 py-1 rounded bg-green-500 text-white text-sm"
        >
          Receive
        </button>

        <button
          onClick={onToggleTrustline}
          className="px-3 py-1 rounded bg-gray-200 text-sm"
        >
          {trusted ? "Remove Trustline" : "Add Trustline"}
        </button>
      </div>
    </div>
  );
}