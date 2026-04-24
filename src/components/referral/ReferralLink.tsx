import React, { useState } from 'react';
import {
  Copy,
  CheckCircle,
  MessageCircle,
  Twitter,
  Mail,
  Share2,
} from 'lucide-react';
import { referralService } from '../../services/referral.service';

interface ReferralLinkProps {
  referralLink: string;
  referralCode: string;
  userName: string;
}

export const ReferralLink: React.FC<ReferralLinkProps> = ({
  referralLink,
  referralCode,
  userName,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    'whatsapp' | 'twitter' | 'email' | null
  >(null);

  const handleCopyLink = async () => {
    const success = await referralService.copyToClipboard(referralLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const templates = referralService.getShareTemplates(
    referralLink,
    userName
  );

  const shareButtons = [
    {
      id: 'whatsapp' as const,
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'bg-green-50 text-green-600 hover:bg-green-100',
    },
    {
      id: 'twitter' as const,
      icon: Twitter,
      label: 'Twitter/X',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    },
    {
      id: 'email' as const,
      icon: Mail,
      label: 'Email',
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Copy to Clipboard Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Your Referral Link
        </h3>

        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={referralLink}
              readOnly
              aria-label="Your referral link"
              placeholder="Referral link"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600"
            />
          </div>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Referral Code: <span className="font-mono font-semibold">{referralCode}</span>
        </p>
      </div>

      {/* Share Buttons Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Share2 className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Share on Social Media
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {shareButtons.map((button) => {
            const Icon = button.icon;
            const template = templates[button.id];
            return (
              <a
                key={button.id}
                href={template.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition ${button.color}`}
              >
                <Icon className="h-5 w-5" />
                {button.label}
              </a>
            );
          })}
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-gray-700">Share Message:</p>
          <div className="flex gap-2">
            {shareButtons.map((button) => (
              <button
                key={`preview-${button.id}`}
                onClick={() =>
                  setSelectedTemplate(
                    selectedTemplate === button.id ? null : button.id
                  )
                }
                className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                {button.label} Preview
              </button>
            ))}
          </div>

          {selectedTemplate && (
            <div className="mt-3 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {templates[selectedTemplate].message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h4 className="mb-3 font-semibold text-amber-900">Pro Tips</h4>
        <ul className="space-y-2 text-sm text-amber-800">
          <li>
            • Share your referral link on social media to reach more people
          </li>
          <li>• Your friends get a welcome bonus when they join using your code</li>
          <li>• You earn rewards when your friends complete their first booking</li>
          <li>• Track all your referrals and rewards in the history below</li>
        </ul>
      </div>
    </div>
  );
};
