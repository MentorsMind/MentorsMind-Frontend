interface ReceiveModalProps {
  assetName: string;
  onClose: () => void;
}

export function ReceiveModal({ assetName, onClose }: ReceiveModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Receive {assetName}</h2>
        <div className="p-4 rounded bg-gray-100 text-sm break-all">
          GABC123EXAMPLEWALLETADDRESSFORRECEIVE
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}