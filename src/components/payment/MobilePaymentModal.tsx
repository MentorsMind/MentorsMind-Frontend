import React, { useState } from 'react'

interface MobilePaymentModalProps {
  open: boolean
  amount?: number
  currency?: string
  onClose: () => void
  onConfirm: (amount: number) => Promise<void>
}

export const MobilePaymentModal: React.FC<MobilePaymentModalProps> = ({ open, amount = 0, currency = 'USD', onClose, onConfirm }) => {
  const [value, setValue] = useState(amount.toFixed(2))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submit = async () => {
    setError(null)
    const num = Number(value)
    if (Number.isNaN(num) || num <= 0) {
      setError('Enter a valid amount')
      return
    }
    setLoading(true)
    try {
      await onConfirm(num)
      setSuccess(true)
      try {
        navigator.vibrate?.(50)
      } catch {}
    } catch (e: any) {
      setError(e?.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:w-[420px] rounded-t-lg sm:rounded-lg bg-white p-4 shadow-xl">
        {!success ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Confirm Payment</h3>
              <button onClick={onClose} className="text-gray-500">Close</button>
            </div>
            <div className="text-sm text-gray-600">Touch-friendly controls for mobile wallets and quick payments.</div>
            <div>
              <label className="text-xs text-gray-500">Amount ({currency})</label>
              <input
                inputMode="decimal"
                pattern="[0-9]*([.,][0-9]{1,2})?"
                className="w-full mt-1 rounded-lg border p-3 text-lg"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex gap-2">
              <button
                onClick={() => setValue((prev) => (Number(prev || 0) + 1).toFixed(2))}
                className="flex-1 rounded-lg bg-gray-100 py-3 font-semibold"
              >
                +1
              </button>
              <button
                onClick={() => setValue((prev) => Math.max(0, Number(prev || 0) - 1).toFixed(2))}
                className="flex-1 rounded-lg bg-gray-100 py-3 font-semibold"
              >
                -1
              </button>
              <button
                onClick={() => setValue((prev) => (Number(prev || 0) * 2).toFixed(2))}
                className="flex-1 rounded-lg bg-gray-100 py-3 font-semibold"
              >
                x2
              </button>
            </div>

            <div className="mt-2 flex gap-2">
              <button
                disabled={loading}
                onClick={submit}
                className="flex-1 rounded-lg bg-stellar text-white py-3 font-bold disabled:opacity-60"
              >
                {loading ? 'Processing…' : `Pay ${currency} ${value}`}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-6">
            <svg className="mx-auto h-12 w-12 text-green-500" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h4 className="mt-3 font-semibold">Payment successful</h4>
            <p className="text-sm text-gray-600 mt-2">Thank you — your payment was processed.</p>
            <div className="mt-4">
              <button onClick={onClose} className="px-4 py-2 rounded-lg bg-stellar text-white">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MobilePaymentModal
