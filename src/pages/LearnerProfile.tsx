import React, { useState } from 'react';
import type { AuthState } from '../types';
import { useLearnerProfile } from '../hooks/useLearnerProfile';
import { ProfileForm } from '../components/learner/ProfileForm';
import AchievementBadges from '../components/learner/AchievementBadges';
import { CertificateGrid } from '../components/learner/CertificateGrid';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Navbar } from '../components/navigation/Navbar';
import { Edit2, User, Target, Award, Settings } from 'lucide-react';

export const LearnerProfilePage: React.FC = () => {
  const { profile, updateProfile, uploadPhoto, isLoading } = useLearnerProfile();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const navbarAuth: AuthState = {
    isAuthenticated: true,
    isLoading: false,
    user: {
      name: profile.fullName,
      email: profile.email,
      role: 'learner',
      emailVerified: true,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar auth={navbarAuth} onLogout={() => {}} />
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Header section */}
              <div className="md:flex md:items-center md:justify-between md:space-x-5 mb-8">
                <div className="flex items-start space-x-5">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                      />
                      <span className="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="pt-1.5">
                    <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                    <p className="text-sm font-medium text-gray-500">
                      {profile.email} • {profile.timezone}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isEditing ? (
                      <>
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isEditing ? (
                <ProfileForm
                  initialData={profile}
                  onSubmit={(data) => {
                    updateProfile(data);
                    setIsEditing(false);
                  }}
                  onPhotoUpload={uploadPhoto}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  {/* Main profile content */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Bio and Intro */}
                    <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-500" />
                        About Me
                      </h2>
                      <div className="prose prose-sm text-gray-500 max-w-none">
                        <p className="font-medium text-gray-700 mb-2">{profile.bio}</p>
                        <p>{profile.introduction}</p>
                      </div>
                    </section>

                    {/* Learning Goals */}
                    <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-blue-500" />
                        Learning Goals
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {profile.learningGoals.map((goal) => (
                          <span
                            key={goal}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* Achievements */}
                    <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-blue-500" />
                        Achievements
                      </h2>
                      <AchievementBadges achievements={profile.achievements} />
                    </section>

                    <CertificateGrid learnerId={profile.id} />
                  </div>

                  {/* Sidebar stats/info */}
                  <div className="space-y-8">
                    <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-blue-500" />
                        Preferences
                      </h2>
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Learning Style</dt>
                          <dd className="mt-1 text-sm text-gray-900 capitalize">{profile.preferredLearningStyle}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Language</dt>
                          <dd className="mt-1 text-sm text-gray-900">{profile.language}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Profile Visibility</dt>
                          <dd className="mt-1 text-sm text-gray-900 capitalize">{profile.visibility}</dd>
                        </div>
                      </dl>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
