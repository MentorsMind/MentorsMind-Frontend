import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import DatePicker from '../forms/DatePicker';
import Select from '../forms/Select';
import PaymentModal from '../payment/PaymentModal';
import type { Mentor } from '../../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor;
}

const DURATIONS = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

export default function BookingModal({ isOpen, onClose, mentor }: BookingModalProps) {
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('60');
  const [showPayment, setShowPayment] = useState(false);

  if (showPayment) return (
    <PaymentModal isOpen={isOpen} onClose={onClose} mentor={mentor} sessionDuration={Number(duration)} onSuccess={() => onClose()} />
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book ${mentor.name}`} size="md">
      <div className="space-y-4">
        <DatePicker label="Date & Time" value={date} onChange={setDate} min={new Date().toISOString().slice(0, 16)} />
        <Select label="Duration" options={DURATIONS} value={duration} onChange={setDuration} />
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
          Estimated cost: <strong>{((mentor.hourlyRate * Number(duration)) / 60).toFixed(2)} {mentor.currency}</strong>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => setShowPayment(true)} disabled={!date} className="flex-1">Continue to Payment</Button>
        </div>
      </div>
    </Modal>
  );
}
