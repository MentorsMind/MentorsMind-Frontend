import React, { useState } from 'react'
import MobilePaymentModal from '../payment/MobilePaymentModal'
import useMobilePayment from '../../hooks/useMobilePayment'

export const MobilePaymentFlow: React.FC = () => {
  const { initiatePayment, status } = useMobilePayment()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(9.99)

  const handleConfirm = async (amt: number) => {
    setAmount(amt)
    await initiatePayment({ amount: amt })
    setOpen(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Quick Payment</div>
          <div className="text-xs text-gray-500">Optimized for mobile wallets</div>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-stellar px-4 py-2 text-white">Pay</button>
      </div>

      <div className="text-xs text-gray-500">Status: {status}</div>

      <MobilePaymentModal
        open={open}
        amount={amount}
        onClose={() => setOpen(false)}
        onConfirm={async (amt) => handleConfirm(amt)}
      />
    </div>
  )
}

export default MobilePaymentFlow
