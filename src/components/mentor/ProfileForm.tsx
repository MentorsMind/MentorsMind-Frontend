import React, { useState } from 'react';
import type { MentorProfile, SocialLinks } from '../../hooks/useMentorProfile';
import { SkillTagSelector } from './SkillTagSelector';
import { PhotoUpload } from './PhotoUpload';
import { PortfolioSection } from './PortfolioSection';

interface ProfileFormProps {
  profile: MentorProfile;
  onUpdate: (updates: Partial<MentorProfile>) => void;
  onAddPortfolio: (item: any) => void;
  onRemovePortfolio: (id: string) => void;
}

export const ProfileForm = ({
  profile,
  onUpdate,
  onAddPortfolio,
  onRemovePortfolio,
}: ProfileFormProps) => {
  const [showSensitiveFields, setShowSensitiveFields] = useState(false);

  const updateSocialLinks = (platform: keyof SocialLinks, value: string) => {
    onUpdate({
      socialLinks: { ...profile.socialLinks, [platform]: value },
    });
  };

  const updateNotificationPreference = (key: string, value: boolean) => {
    onUpdate({
      notificationPreferences: {
        ...profile.notificationPreferences,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8">
      <PhotoUpload
        currentPhoto={profile.photoUrl}
        onPhotoChange={(photoUrl) => onUpdate({ photoUrl })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => onUpdate({ firstName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => onUpdate({ lastName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
        <input
          type="text"
          value={profile.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="e.g., Senior Software Engineer, Product Manager"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio & Introduction</label>
        <textarea
          value={profile.bio}
          onChange={(e) => onUpdate({ bio: e.target.value })}
          placeholder="Tell learners about your experience, expertise, and what you can help them with..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={5}
        />
      </div>

      <SkillTagSelector
        selectedSkills={profile.skills}
        onChange={(skills) => onUpdate({ skills })}
        label="Skills"
      />

      <SkillTagSelector
        selectedSkills={profile.expertise}
        onChange={(expertise) => onUpdate({ expertise })}
        label="Areas of Expertise"
        placeholder="Add expertise area..."
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
        <input
          type="number"
          value={profile.hourlyRate || ''}
          onChange={(e) => onUpdate({ hourlyRate: parseFloat(e.target.value) || 0 })}
          min="0"
          step="5"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <PortfolioSection
        items={profile.portfolio}
        onAdd={onAddPortfolio}
        onRemove={onRemovePortfolio}
      />

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Social Links</label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">LinkedIn</label>
            <input
              type="url"
              value={profile.socialLinks.linkedin || ''}
              onChange={(e) => updateSocialLinks('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">GitHub</label>
            <input
              type="url"
              value={profile.socialLinks.github || ''}
              onChange={(e) => updateSocialLinks('github', e.target.value)}
              placeholder="https://github.com/username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Twitter</label>
            <input
              type="url"
              value={profile.socialLinks.twitter || ''}
              onChange={(e) => updateSocialLinks('twitter', e.target.value)}
              placeholder="https://twitter.com/username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Website</label>
            <input
              type="url"
              value={profile.socialLinks.website || ''}
              onChange={(e) => updateSocialLinks('website', e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Notification Preferences</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(profile.notificationPreferences.email)}
              onChange={(e) => updateNotificationPreference('email', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span>Email notifications</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(profile.notificationPreferences.sms)}
              onChange={(e) => updateNotificationPreference('sms', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span>SMS notifications</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(profile.notificationPreferences.push)}
              onChange={(e) => updateNotificationPreference('push', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span>Push notifications</span>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Sensitive Information</h3>
          <button
            type="button"
            onClick={() => setShowSensitiveFields((prev) => !prev)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showSensitiveFields ? 'Hide sensitive fields' : 'Show sensitive fields'}
          </button>
        </div>
        {showSensitiveFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profile.phoneNumber || ''}
                onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={profile.dateOfBirth || ''}
                onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Government ID Number</label>
              <input
                type="text"
                value={profile.governmentIdNumber || ''}
                onChange={(e) => onUpdate({ governmentIdNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Details</label>
              <input
                type="text"
                value={profile.bankAccountDetails || ''}
                onChange={(e) => onUpdate({ bankAccountDetails: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="profileVisible"
            checked={profile.isVisible}
            onChange={(e) => onUpdate({ isVisible: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="profileVisible" className="text-sm text-gray-700">
            Make my profile visible to learners
          </label>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Verification Status</h4>
              <p className="text-xs text-gray-600 mt-1">
                {profile.isVerified
                  ? 'Your profile has been verified'
                  : 'Complete your profile to request verification'}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                profile.isVerified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {profile.isVerified ? '✓ Verified' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
