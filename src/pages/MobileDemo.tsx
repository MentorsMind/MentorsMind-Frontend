import React, { useState } from 'react';
import { Bell, Settings, Share2, Trash2 } from 'lucide-react';
import { MobileNavigation, MobileHeader, MobileTabBar } from '../components/mobile/MobileNavigation';
import { MobileModal, BottomSheet, ActionSheet } from '../components/mobile/MobileModal';
import { TouchGestures } from '../components/mobile/TouchGestures';
import { PullToRefresh } from '../components/mobile/PullToRefresh';
import { MobileInput, MobileButton, MobileForm, MobileTextarea } from '../components/mobile/MobileForm';
import { MobileLoading, CardSkeleton, ProgressBar } from '../components/mobile/MobileLoading';
import { ResponsiveImage, Avatar } from '../components/mobile/ResponsiveImage';
import { useMobile } from '../hooks/useMobile';

export const MobileDemo: React.FC = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  
  const { isMobile, breakpoint, orientation } = useMobile();

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setShowModal(false);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: <span>🏠</span>, href: '/' },
    { id: 'search', label: 'Search', icon: <span>🔍</span>, href: '/search' },
    { id: 'notifications', label: 'Alerts', icon: <Bell className="w-6 h-6" />, href: '/notifications', badge: 3 },
    { id: 'profile', label: 'Profile', icon: <span>👤</span>, href: '/profile' },
  ];

  const tabs = [
    { id: 'all', label: 'All', count: 24 },
    { id: 'active', label: 'Active', count: 8 },
    { id: 'completed', label: 'Completed', count: 16 },
  ];

  const actions = [
    { label: 'Share', onClick: () => console.log('Share'), icon: <Share2 className="w-5 h-5" /> },
    { label: 'Settings', onClick: () => console.log('Settings'), icon: <Settings className="w-5 h-5" /> },
    { label: 'Delete', onClick: () => console.log('Delete'), variant: 'danger' as const, icon: <Trash2 className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <MobileHeader
        title="Mobile Components Demo"
        showMenuButton
        onMenuClick={() => setShowActionSheet(true)}
        rightAction={
          <button
            onClick={() => setShowModal(true)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-full"
          >
            <Settings className="w-6 h-6" />
          </button>
        }
      />

      {/* Device Info Banner */}
      <div className="bg-primary-50 border-b border-primary-100 p-4">
        <div className="text-sm space-y-1">
          <p><strong>Device:</strong> {isMobile ? 'Mobile' : 'Desktop'}</p>
          <p><strong>Breakpoint:</strong> {breakpoint}</p>
          <p><strong>Orientation:</strong> {orientation}</p>
        </div>
      </div>

      {/* Tab Bar */}
      <MobileTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Pull to Refresh Content */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="p-4 space-y-6">
          {/* Touch Gestures Demo */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Touch Gestures</h2>
            <TouchGestures
              onSwipeLeft={() => alert('Swiped Left!')}
              onSwipeRight={() => alert('Swiped Right!')}
              onTap={() => console.log('Tapped')}
              onDoubleTap={() => alert('Double Tapped!')}
              onLongPress={() => alert('Long Pressed!')}
              className="bg-gradient-to-r from-primary-500 to-stellar rounded-lg p-8 text-white text-center"
            >
              <p className="font-medium">Try gestures here!</p>
              <p className="text-sm mt-2 opacity-90">
                Swipe, tap, double tap, or long press
              </p>
            </TouchGestures>
          </section>

          {/* Avatars */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Avatars</h2>
            <div className="flex items-center gap-4">
              <Avatar size="xs" alt="User" fallbackText="John Doe" />
              <Avatar size="sm" alt="User" fallbackText="Jane Smith" />
              <Avatar size="md" alt="User" fallbackText="Bob Wilson" />
              <Avatar size="lg" alt="User" fallbackText="Alice Brown" />
              <Avatar size="xl" alt="User" fallbackText="Charlie Davis" />
            </div>
          </section>

          {/* Buttons */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Buttons</h2>
            <div className="space-y-3">
              <MobileButton variant="primary" fullWidth>
                Primary Button
              </MobileButton>
              <MobileButton variant="secondary" fullWidth>
                Secondary Button
              </MobileButton>
              <MobileButton variant="outline" fullWidth>
                Outline Button
              </MobileButton>
              <MobileButton variant="ghost" fullWidth>
                Ghost Button
              </MobileButton>
              <MobileButton variant="primary" fullWidth loading>
                Loading Button
              </MobileButton>
            </div>
          </section>

          {/* Progress Bar */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Progress Indicators</h2>
            <div className="space-y-4">
              <ProgressBar value={25} showLabel color="primary" />
              <ProgressBar value={50} showLabel color="success" />
              <ProgressBar value={75} showLabel color="warning" />
              <ProgressBar value={90} showLabel color="danger" />
            </div>
          </section>

          {/* Loading States */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Loading States</h2>
            {isLoading ? (
              <CardSkeleton count={2} />
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">Content loaded!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Pull down to refresh
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">More content</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Swipe for gestures
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Modal Triggers */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Modals</h2>
            <div className="space-y-3">
              <MobileButton
                variant="primary"
                fullWidth
                onClick={() => setShowModal(true)}
              >
                Open Modal
              </MobileButton>
              <MobileButton
                variant="secondary"
                fullWidth
                onClick={() => setShowBottomSheet(true)}
              >
                Open Bottom Sheet
              </MobileButton>
              <MobileButton
                variant="outline"
                fullWidth
                onClick={() => setShowActionSheet(true)}
              >
                Open Action Sheet
              </MobileButton>
            </div>
          </section>

          {/* Responsive Images */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Responsive Images</h2>
            <div className="grid grid-cols-2 gap-4">
              <ResponsiveImage
                src="https://via.placeholder.com/400x400"
                alt="Square"
                aspectRatio="1:1"
              />
              <ResponsiveImage
                src="https://via.placeholder.com/400x300"
                alt="4:3"
                aspectRatio="4:3"
              />
            </div>
          </section>
        </div>
      </PullToRefresh>

      {/* Bottom Navigation */}
      <MobileNavigation
        items={navItems}
        activeItem={activeNav}
        onItemClick={setActiveNav}
      />

      {/* Modal with Form */}
      <MobileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Contact Form"
        position="center"
      >
        <div className="p-4">
          <MobileForm onSubmit={handleFormSubmit}>
            <MobileInput
              id="name"
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <MobileInput
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <MobileTextarea
              id="message"
              label="Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              required
            />
            <MobileButton type="submit" variant="primary" fullWidth>
              Submit
            </MobileButton>
          </MobileForm>
        </div>
      </MobileModal>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        title="Bottom Sheet"
      >
        <div className="p-4 space-y-4">
          <p className="text-gray-600">
            This is a bottom sheet modal that slides up from the bottom of the screen.
            Perfect for mobile interactions!
          </p>
          <MobileButton
            variant="primary"
            fullWidth
            onClick={() => setShowBottomSheet(false)}
          >
            Close
          </MobileButton>
        </div>
      </BottomSheet>

      {/* Action Sheet */}
      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Choose an action"
        actions={actions}
      />
    </div>
  );
};
