import { useState } from 'react';
import { AlertTriangle, FileText, Upload, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Modal, Button, Alert, Spinner } from '../ui';
import { TextArea, Select, FileUpload } from '../forms';
import { createDispute, uploadDisputeEvidence } from '../../services/dispute.service';

const REASONS = [
  { value: 'no_show', label: 'Mentor did not show up' },
  { value: 'poor_quality', label: 'Poor quality of session' },
  { value: 'technical_issues', label: 'Technical issues' },
  { value: 'incorrect_charge', label: 'Incorrect charges' },
  { value: 'other', label: 'Other' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  transactionId: string;
  onSuccess: (disputeId: string) => void;
}

export default function DisputeFormModal({ isOpen, onClose, bookingId, transactionId, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const dispute = await createDispute({
        transaction_id: transactionId,
        reason,
        description,
      });

      if (files.length > 0) {
        // Upload evidence for each file
        await Promise.all(
          files.map((file) =>
            uploadDisputeEvidence({
              disputeId: dispute.id,
              text_content: `Evidence file: ${file.name}`,
              file,
            })
          )
        );
      }

      onSuccess(dispute.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to file dispute');
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 1) return !!reason;
    if (step === 2) return description.length >= 20;
    return true;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="File a Dispute"
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors
                ${s < step ? 'bg-green-500 text-white' : s === step ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}
              >
                {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 rounded-full ${s < step ? 'bg-green-500' : 'bg-gray-100'}`} />
              )}
            </div>
          ))}
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <div className="min-h-[240px]">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-2xl">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <p className="text-sm font-medium">
                  Please select the primary reason for this dispute. This helps our team review your case faster.
                </p>
              </div>
              <Select
                label="Reason for dispute"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                options={REASONS}
                placeholder="Select a reason..."
                required
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50 p-4 rounded-2xl">
                <FileText className="w-6 h-6 shrink-0" />
                <p className="text-sm font-medium">
                  Describe what happened in detail. Include dates, times, and any specific issues encountered.
                </p>
              </div>
              <TextArea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue (minimum 20 characters)..."
                rows={6}
                required
              />
              <p className="text-xs text-gray-500 text-right">
                {description.length} characters (min 20)
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50 p-4 rounded-2xl">
                <Upload className="w-6 h-6 shrink-0" />
                <p className="text-sm font-medium">
                  Upload any supporting evidence such as screenshots, PDFs, or images.
                </p>
              </div>
              <FileUpload
                label="Evidence Files"
                onFilesSelected={(selectedFiles) => setFiles(Array.from(selectedFiles))}
                multiple
                accept="image/*,.pdf"
              />
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Selected Files</p>
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <span className="text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || loading}
          >
            Back
          </Button>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!canNext()}
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!canNext()}
              >
                {loading ? 'Submitting...' : 'Submit Dispute'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
