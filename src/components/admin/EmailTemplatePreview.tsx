import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import AdminService from '../../services/admin.service';
import { EmailPreviewResponse } from '../../types/admin.types';
import { Alert, Button, Spinner } from '../ui';

const EmailTemplatePreview: React.FC = () => {
  const { template } = useParams<{ template: string }>();
  const [data, setData] = useState<EmailPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html');
  const [sampleDataJson, setSampleDataJson] = useState<string>('{}');
  const [reRendering, setReRendering] = useState(false);

  // Requirement: Render the email preview HTML inside a sandboxed iframe using a blob URL
  const blobUrl = useMemo(() => {
    if (!data?.html) return null;
    const blob = new Blob([data.html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [data?.html]);

  // Requirement: Revoke the blob URL with URL.revokeObjectURL() when the component unmounts
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const fetchPreview = async (renderData?: any) => {
    if (!template) return;
    if (renderData) setReRendering(true);
    else setLoading(true);
    
    setError(null);
    try {
      const response = await AdminService.previewEmailTemplate(template, { sampleData: renderData });
      setData(response);
      setSampleDataJson(JSON.stringify(response.sampleData, null, 2));
    } catch (err: any) {
      console.error('Failed to fetch email preview:', err);
      // Requirement: show the error message from response.data.error in a red alert box
      const apiError = err.response?.data?.error || err.message || 'Failed to load preview';
      setError(apiError);
    } finally {
      setLoading(false);
      setReRendering(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [template]);

  const handleReRender = () => {
    try {
      const parsedData = JSON.parse(sampleDataJson);
      fetchPreview(parsedData);
    } catch (e) {
      setError('Invalid JSON in sample data editor');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Template Preview</h1>
          <p className="text-gray-500 font-mono text-sm">{template}</p>
        </div>
        <Button onClick={() => window.history.back()} variant="secondary">Back</Button>
      </div>

      {error && <Alert type="error" title="Error">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Preview Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Subject Line */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <div className="flex gap-3">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-tight">Subject:</span>
                <span className="text-sm font-semibold text-gray-800">{data?.subject || '(No Subject)'}</span>
              </div>
            </div>

            {/* Tab Selection */}
            <div className="border-b border-gray-200 bg-white">
              <div className="flex px-6">
                <button
                  onClick={() => setActiveTab('html')}
                  className={`px-4 py-4 text-sm font-bold transition-colors border-b-2 ${
                    activeTab === 'html'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  HTML Preview
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-4 py-4 text-sm font-bold transition-colors border-b-2 ${
                    activeTab === 'text'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Plain Text
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[600px] bg-gray-50">
              {activeTab === 'html' ? (
                blobUrl ? (
                  <iframe
                    src={blobUrl}
                    title="Email Preview"
                    className="w-full h-[650px] border-none bg-white"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[500px] text-gray-400">
                    <p>No HTML content to display</p>
                  </div>
                )
              ) : (
                <div className="p-8 h-[650px] overflow-auto">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700 bg-gray-100 p-6 rounded-lg border border-gray-200">
                    {data?.text || 'No plain text version available'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Editor */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sample Data</h3>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">JSON</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Modify the JSON below to simulate dynamic template variables.
            </p>
            <textarea
              value={sampleDataJson}
              onChange={(e) => setSampleDataJson(e.target.value)}
              className="w-full h-[450px] font-mono text-[11px] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50 text-gray-800 transition-all shadow-inner"
              spellCheck={false}
            />
            <Button
              onClick={handleReRender}
              className="w-full py-3 font-bold"
              disabled={reRendering}
            >
              {reRendering ? <Spinner size="sm" className="mr-2 text-white" /> : null}
              Re-render Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplatePreview;
