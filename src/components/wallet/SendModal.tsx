interface SendModalProps {
  assetName: string;
  onClose: () => void;
}

export function SendModal({ assetName, onClose }: SendModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Send {assetName}</h2>
        <input
          type="text"
          placeholder="Recipient address"
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="Amount"
          className="w-full border rounded px-3 py-2"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">
            Cancel
          </button>
          <button className="px-4 py-2 rounded bg-blue-500 text-white">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}