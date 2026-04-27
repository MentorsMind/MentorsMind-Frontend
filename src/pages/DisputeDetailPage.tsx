import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronLeft, 
  MessageSquare,
  FileText,
  Calendar
} from 'lucide-react';
import { Card, Badge, Button, Spinner, Alert } from '../components/ui';
import { getDispute, getDisputeStatusLabel, getDisputeStatusColor, type DisputeRecord } from '../services/dispute.service';

export default function DisputeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState<DisputeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDispute() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getDispute(id);
        setDispute(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dispute details');
      } finally {
        setLoading(false);
      }
    }
    loadDispute();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Alert type="error" title="Error Loading Dispute">
          {error || 'Dispute not found'}
        </Alert>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const steps = [
    { key: 'open', label: 'Opened', icon: Clock, date: dispute.created_at },
    { key: 'under_review', label: 'Under Review', icon: ShieldCheck, date: dispute.updated_at },
    { key: 'resolved', label: 'Resolved', icon: CheckCircle2, date: dispute.status === 'resolved' ? dispute.updated_at : null },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === dispute.status);
  const isResolved = dispute.status === 'resolved';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to sessions
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dispute Details</h1>
            <Badge variant={getDisputeStatusColor(dispute.status)}>
              {getDisputeStatusLabel(dispute.status)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">ID: {dispute.id}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-8">Resolution Timeline</h2>
            <div className="relative flex justify-between">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-10" />
              <div 
                className="absolute top-5 left-0 h-0.5 bg-indigo-600 transition-all duration-1000 -z-10" 
                style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center gap-3 text-center">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                      ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-black ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                      {step.date && (
                        <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">
                          {new Date(step.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Details */}
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2">Reason</h3>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-gray-900 font-semibold">{dispute.reason.replace('_', ' ')}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2">Description</h3>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-gray-700 leading-relaxed">{dispute.description}</p>
              </div>
            </div>

            {isResolved && (
              <div className="bg-green-50 border border-green-100 p-6 rounded-3xl space-y-3">
                <div className="flex items-center gap-2 text-green-700">
                  <ShieldCheck className="w-6 h-6" />
                  <h3 className="text-lg font-black">Resolution Outcome</h3>
                </div>
                <p className="text-green-800 leading-relaxed">
                  Our team has reviewed the evidence and resolved the dispute in your favor. 
                  A refund has been processed to your original payment method.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Reference Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase">Filed On</p>
                  <p className="text-sm font-bold text-gray-900">
                    {dispute.created_at ? new Date(dispute.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase">Transaction ID</p>
                  <p className="text-sm font-bold text-gray-900 truncate max-w-[180px]">
                    {dispute.transaction_id}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-indigo-600 text-white border-none shadow-xl shadow-indigo-100">
            <AlertCircle className="w-8 h-8 mb-4 opacity-80" />
            <h3 className="text-lg font-black mb-2">Need help?</h3>
            <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
              If you have additional evidence or questions about the resolution process, please reach out to our support team.
            </p>
            <Button variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white">
              View Support Docs
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
