import React, { useState } from 'react';
import { LearnerProfile, LearningStyle, ProfileVisibility } from '../../types/learner.types';
import { TextInput, TextArea, Select, FileUpload, FormField } from '../forms';
import { LearningGoals } from './LearningGoals';
import { SkillLevelIndicator } from './SkillLevelIndicator';
import { Camera, Save, X } from 'lucide-react';

interface ProfileFormProps {
  initialData: LearnerProfile;
  onSubmit: (data: LearnerProfile) => void;
  onPhotoUpload: (file: File) => Promise<string>;
  onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  onPhotoUpload,
  onCancel,
}) => {
  const [formData, setFormData] = useState<LearnerProfile>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof LearnerProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = async (files: File[]) => {
    if (files.length > 0) {
      try {
        const url = await onPhotoUpload(files[0]);
        handleChange('avatarUrl', url);
      } catch (error) {
        console.error('Failed to upload photo:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const learningStyleOptions: { value: LearningStyle; label: string }[] = [
    { value: 'visual', label: 'Visual' },
    { value: 'auditory', label: 'Auditory' },
    { value: 'reading/writing', label: 'Reading/Writing' },
    { value: 'kinesthetic', label: 'Kinesthetic' },
  ];

  const visibilityOptions: { value: ProfileVisibility; label: string }[] = [
    { value: 'public', label: 'Public' },
    { value: 'mentors-only', label: 'Mentors Only' },
    { value: 'private', label: 'Private' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold leading-6 text-gray-900">Profile Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your personal details and how you appear to mentors.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
              <div className="mt-2 flex items-center space-x-5">
                <div className="relative">
                  <span className="h-20 w-20 overflow-hidden rounded-full bg-gray-100 border-2 border-gray-200 block">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <Camera className="h-8 w-8" />
                      </div>
                    )}
                  </span>
                </div>
                <FileUpload
                  onFileSelect={handlePhotoChange}
                  accept="image/*"
                  maxSize={2 * 1024 * 1024}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <TextInput
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-6">
              <TextArea
                label="Bio"
                name="bio"
                value={formData.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
                description="A brief summary of your professional background (max 160 characters)."
              />
            </div>

            <div className="sm:col-span-6">
              <TextArea
                label="Introduction"
                name="introduction"
                value={formData.introduction || ''}
                onChange={(e) => handleChange('introduction', e.target.value)}
                rows={4}
                description="Introduce yourself to mentors. Mention what you're working on and what you hope to achieve."
              />
            </div>
          </div>
        </div>

        <div className="pt-8">
          <h3 className="text-xl font-semibold leading-6 text-gray-900">Learning Goals & Skills</h3>
          <p className="mt-1 text-sm text-gray-500">
            Define what you want to learn and your current expertise.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <FormField label="Learning Goals" description="Tags that represent your primary learning objectives.">
                <LearningGoals
                  goals={formData.learningGoals}
                  onChange={(goals) => handleChange('learningGoals', goals)}
                />
              </FormField>
            </div>

            <div className="sm:col-span-6">
              <FormField label="Skill Levels" description="Your current proficiency in relevant technical areas.">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {formData.skillLevels.map((skill, index) => (
                    <SkillLevelIndicator
                      key={skill.topic}
                      skill={skill}
                      isEditable
                      onChange={(level) => {
                        const newSkills = [...formData.skillLevels];
                        newSkills[index] = { ...skill, level };
                        handleChange('skillLevels', newSkills);
                      }}
                    />
                  ))}
                </div>
              </FormField>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <h3 className="text-xl font-semibold leading-6 text-gray-900">Preferences & Settings</h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Select
                label="Preferred Learning Style"
                name="preferredLearningStyle"
                value={formData.preferredLearningStyle}
                onChange={(e) => handleChange('preferredLearningStyle', e.target.value)}
                options={learningStyleOptions}
              />
            </div>

            <div className="sm:col-span-3">
              <Select
                label="Timezone"
                name="timezone"
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                options={[
                  { value: 'UTC-8', label: 'Pacific Time (PT)' },
                  { value: 'UTC-5', label: 'Eastern Time (ET)' },
                  { value: 'UTC+0', label: 'Greenwich Mean Time (GMT)' },
                  { value: 'UTC+1', label: 'Central European Time (CET)' },
                ]}
              />
            </div>

            <div className="sm:col-span-3">
              <TextInput
                label="Preferred Language"
                name="language"
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
              />
            </div>

            <div className="sm:col-span-3">
              <Select
                label="Profile Visibility"
                name="visibility"
                value={formData.visibility}
                onChange={(e) => handleChange('visibility', e.target.value)}
                options={visibilityOptions}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white py-2 px-6 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-8 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </form>
  );
};
