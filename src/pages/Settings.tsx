import React, { useState, useEffect } from 'react';
import {
  User, Bell, Shield, Link2, AlertTriangle, ChevronRight,
  CheckCircle, Loader2, Wallet, Calendar
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import SanctionsError from '../components/compliance/SanctionsError';
import NotificationSettings from '../components/settings/NotificationSettings';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import DangerZoneSettings from '../components/settings/DangerZoneSettings';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

type SettingsTab =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'connected'
  | 'danger';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode; colorClass?: string }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'connected', label: 'Connected Accounts', icon: <Link2 className="w-4 h-4" /> },
  { id: 'danger', label: 'Danger Zone', icon: <AlertTriangle className="w-4 h-4" />, colorClass: 'text-red-600 hover:bg-red-50 hover:text-red-700' },
];

const DEFAULT_SANCTIONED_WALLETS = [
  'GSANCTIONSDEMO0000000000000000000000000000000000000000000000000000',
];

const selectClass = 'w-full px-3 py-2 border border-border rounded-xl text-sm bg-background text-text focus:outline-none focus:ring-2 focus:ring-stellar/30 focus:border-stellar';

function isSanctionedWallet(address: string) {
  const normalized = address.trim().toUpperCase();
  if (!normalized) return false;

  const storedWallets = (() => {
    try {
      const raw = localStorage.getItem('sanctioned_wallets');
      return raw ? JSON.parse(raw) as string[] : [];
    } catch {
      return [];
    }
  })();

  const flaggedWallets = new Set(
    [...DEFAULT_SANCTIONED_WALLETS, ...storedWallets]
      .map((item) => String(item).trim().toUpperCase()),
  );

  return flaggedWallets.has(normalized) || normalized.includes('SANCTION');
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [pendingTab, setPendingTab] = useState<SettingsTab | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  
  const { settings, updateSettings, saveStatus } = useSettings();
  const { user } = useAuth();
  
  // Create a local mutable copy of user for the Profile settings
  // If user is not yet loaded, we provide a fallback
  const [localUser, setLocalUser] = useState(user || { 
    id: 'user_1', email: 'demo@example.com', role: 'learner', 
    firstName: '', lastName: '', bio: '', timezone: 'UTC', avatarUrl: '' 
  } as any);

  useEffect(() => {
    if (user) {
      setLocalUser(user);
    }
  }, [user]);

  const [walletInput, setWalletInput] = useState(settings.connected.stellarWallet ?? '');
  const walletFlagged = isSanctionedWallet(walletInput);

  // Handle browser back/refresh when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const requestTabChange = (tabId: SettingsTab) => {
    if (tabId === activeTab) return;
    
    if (isDirty) {
      setPendingTab(tabId);
      setShowUnsavedModal(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const confirmTabChange = () => {
    if (pendingTab) {
      setIsDirty(false); // Discard changes state
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
    setShowUnsavedModal(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileSettings 
            user={localUser} 
            onDirtyChange={setIsDirty} 
            onProfileUpdate={(u) => { setLocalUser(u); setIsDirty(false); }}
          />
        );

      case 'security':
        return <SecuritySettings />;

      case 'notifications':
        return (
          <NotificationSettings
            prefs={settings.notifications}
            onChange={updates => updateSettings('notifications', updates)}
          />
        );

      case 'connected':
        return (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Stellar Wallet */}
            <div className="p-5 border border-border rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-stellar/10 rounded-xl flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-stellar" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Stellar Wallet</p>
                  <p className="text-xs text-muted-foreground">Connect your Stellar public key for payments</p>
                </div>
                {settings.connected.stellarWallet && (
                  <span className="ml-auto text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg">Connected</span>
                )}
              </div>
              <input
                type="text"
                placeholder="G... (Stellar public key)"
                value={walletInput}
                onChange={e => setWalletInput(e.target.value)}
                className={selectClass}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updateSettings('connected', { stellarWallet: walletInput || null })}
                  disabled={walletFlagged}
                  className="px-4 py-2 bg-stellar text-white text-sm font-semibold rounded-xl hover:bg-stellar-dark transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {settings.connected.stellarWallet ? 'Update' : 'Connect'}
                </button>
                {settings.connected.stellarWallet && (
                  <button
                    onClick={() => { setWalletInput(''); updateSettings('connected', { stellarWallet: null }); }}
                    className="px-4 py-2 border border-border text-muted-foreground text-sm font-semibold rounded-xl hover:bg-surface transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
              {walletFlagged && <SanctionsError walletAddress={walletInput} />}
            </div>

            {/* Calendar Sync */}
            <div className="p-5 border border-border rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Calendar Sync</p>
                  <p className="text-xs text-muted-foreground">Sync sessions with your calendar</p>
                </div>
                {settings.connected.calendarSync && (
                  <span className="ml-auto text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg">Synced</span>
                )}
              </div>
              {!settings.connected.calendarSync ? (
                <div className="flex gap-2">
                  {(['google', 'outlook'] as const).map(provider => (
                    <button
                      key={provider}
                      onClick={() => updateSettings('connected', { calendarSync: true, calendarProvider: provider })}
                      className="flex-1 px-4 py-2 border border-border text-text text-sm font-semibold rounded-xl hover:bg-surface capitalize transition-colors"
                    >
                      {provider === 'google' ? 'Google Calendar' : 'Outlook'}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground capitalize">
                    Connected to {settings.connected.calendarProvider} Calendar
                  </p>
                  <button
                    onClick={() => updateSettings('connected', { calendarSync: false, calendarProvider: null })}
                    className="text-sm text-destructive hover:opacity-80 font-semibold"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'danger':
        return <DangerZoneSettings />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-text tracking-tight">Settings & Security</h1>
        <p className="text-muted-foreground mt-1">Manage your profile, security preferences, and connected accounts.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <nav className="md:w-56 shrink-0" aria-label="Settings navigation">
          <ul className="space-y-1">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const defaultClasses = isActive
                ? 'bg-stellar text-white shadow-sm shadow-stellar/20'
                : 'text-muted-foreground hover:bg-surface';
                
              const colorClasses = tab.colorClass && !isActive ? tab.colorClass : defaultClasses;
                
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => requestTabChange(tab.id)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${colorClasses}`}
                  >
                    <span className="flex items-center gap-3">
                      {tab.icon}
                      {tab.label}
                    </span>
                    {isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-background rounded-3xl border border-border shadow-sm p-6 md:p-8">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-text">
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
              {/* Save status indicator */}
              {saveStatus !== 'idle' && (
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                  saveStatus === 'saving' ? 'bg-surface text-muted-foreground' :
                  saveStatus === 'saved' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  'bg-destructive/10 text-destructive'
                }`}>
                  {saveStatus === 'saving' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {saveStatus === 'saved' && <CheckCircle className="w-3 h-3" />}
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Error saving'}
                </div>
              )}
            </div>

            {renderContent()}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      <Modal isOpen={showUnsavedModal} onClose={() => setShowUnsavedModal(false)} title="Unsaved Changes" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You have unsaved changes in your profile. Are you sure you want to leave this tab? Your changes will be lost.
          </p>
          <div className="flex gap-2 justify-end mt-6">
            <Button variant="ghost" size="sm" onClick={() => setShowUnsavedModal(false)}>
              Keep Editing
            </Button>
            <Button variant="danger" size="sm" onClick={confirmTabChange}>
              Discard Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
