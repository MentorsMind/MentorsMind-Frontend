import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import AccountService from '../../services/account.service';
import type { User } from '../../types';
import toast from 'react-hot-toast';
import UserAvatar from '../ui/UserAvatar';
import { useAuth } from '../../hooks/useAuth';

interface ProfileSettingsProps {
  user: User;
  onDirtyChange: (isDirty: boolean) => void;
  onProfileUpdate: (updatedUser: User) => void;
}

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland',
];

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stellar/30 focus:border-stellar bg-white';

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onDirtyChange, onProfileUpdate }) => {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    timezone: user.timezone || 'UTC',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accountService = new AccountService();

  // Check if form is dirty
  useEffect(() => {
    const isDirty = 
      formData.firstName !== (user.firstName || '') ||
      formData.lastName !== (user.lastName || '') ||
      formData.bio !== (user.bio || '') ||
      formData.timezone !== (user.timezone || 'UTC') ||
      avatarFile !== null;
      
    onDirtyChange(isDirty);
  }, [formData, avatarFile, user, onDirtyChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, we'd open a cropping modal here and use a canvas.
      // For simplicity in this demo, we'll just set it as a preview and upload directly.
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let avatarUrl = user.avatarUrl;
      
      // Upload avatar first if changed
      if (avatarFile) {
        const res = await accountService.uploadAvatar(avatarFile);
        avatarUrl = res.avatarUrl;
        // Immediately sync the new URL into the auth context so the navbar updates
        updateUser({ avatarUrl });
      }

      // Update profile
      const updatedProfile = await accountService.updateProfile({
        ...formData,
        avatarUrl
      });

      onProfileUpdate(updatedProfile);
      setAvatarFile(null);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-sm flex items-center justify-center">
              <UserAvatar
                avatarUrl={avatarPreview ?? user.avatarUrl}
                firstName={user.firstName}
                lastName={user.lastName}
                name={user.name}
                size="xl"
              />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Profile Picture</h3>
          <p className="text-sm text-gray-500 mt-1 mb-3">JPG, GIF or PNG. 1MB max.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
            >
              Upload New
            </button>
            {(avatarPreview || user.avatarUrl) && (
              <button
                type="button"
                onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
                className="px-4 py-2 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors text-gray-500"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={inputClass}
            placeholder="Jane"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={inputClass}
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className={`${inputClass} min-h-[100px] resize-y`}
          placeholder="A brief description about yourself..."
        />
        <p className="text-xs text-gray-500 mt-1.5">
          Brief description for your profile. URLs are hyperlinked.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Timezone</label>
        <select
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
          className={inputClass}
        >
          {TIMEZONES.map(tz => (
            <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-stellar text-white text-sm font-bold rounded-xl hover:bg-stellar-dark transition-colors disabled:opacity-60"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileSettings;
