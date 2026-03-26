import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Link2,
  Clock,
  CheckCircle,
  Loader2,
  ChevronRight,
  Wallet,
  Calendar,
} from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import AccountSettings from "../components/settings/AccountSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import AppearanceSettings from "../components/settings/AppearanceSettings";

type SettingsTab =
  | "account"
  | "notifications"
  | "privacy"
  | "appearance"
  | "localization"
  | "connected"
  | "session";

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "account", label: "Account", icon: <User className="w-4 h-4" /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="w-4 h-4" />,
  },
  { id: "privacy", label: "Privacy", icon: <Shield className="w-4 h-4" /> },
  {
    id: "appearance",
    label: "Appearance",
    icon: <Palette className="w-4 h-4" />,
  },
  {
    id: "localization",
    label: "Language & Timezone",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    id: "connected",
    label: "Connected Accounts",
    icon: <Link2 className="w-4 h-4" />,
  },
  {
    id: "session",
    label: "Session Preferences",
    icon: <Clock className="w-4 h-4" />,
  },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "pt", label: "Português" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "ar", label: "العربية" },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];
const BUFFERS = [0, 5, 10, 15, 30];

const selectClass =
  "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stellar/30 focus:border-stellar bg-white";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const { settings, updateSettings, saveStatus } = useSettings();
  const [walletInput, setWalletInput] = useState(
    settings.connected.stellarWallet ?? "",
  );

  const mockUser = { email: "user@example.com", name: "Alex Johnson" };

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <AccountSettings
            userEmail={mockUser.email}
            userName={mockUser.name}
          />
        );

      case "notifications":
        return (
          <NotificationSettings
            prefs={settings.notifications}
            onChange={(updates) => updateSettings("notifications", updates)}
          />
        );

      case "privacy":
        return (
          <PrivacySettings
            settings={settings.privacy}
            onChange={(updates) => updateSettings("privacy", updates)}
          />
        );

      case "appearance":
        return (
          <AppearanceSettings
            settings={settings.appearance}
            onChange={(updates) => updateSettings("appearance", updates)}
          />
        );

      case "localization":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Language
              </label>
              <select
                value={settings.session.language}
                onChange={(e) =>
                  updateSettings("session", { language: e.target.value })
                }
                className={selectClass}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Timezone
              </label>
              <select
                value={settings.session.timezone}
                onChange={(e) =>
                  updateSettings("session", { timezone: e.target.value })
                }
                className={selectClass}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace("_", " ")}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Current time:{" "}
                {new Date().toLocaleTimeString("en-US", {
                  timeZone: settings.session.timezone,
                })}{" "}
                ({settings.session.timezone})
              </p>
            </div>
          </div>
        );

      case "connected":
        return (
          <div className="space-y-6">
            {/* Stellar Wallet */}
            <div className="p-5 border border-gray-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-stellar/10 rounded-xl flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-stellar" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Stellar Wallet
                  </p>
                  <p className="text-xs text-gray-400">
                    Connect your Stellar public key for payments
                  </p>
                </div>
                {settings.connected.stellarWallet && (
                  <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    Connected
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="G... (Stellar public key)"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                className={selectClass}
              />
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateSettings("connected", {
                      stellarWallet: walletInput || null,
                    })
                  }
                  className="px-4 py-2 bg-stellar text-white text-sm font-semibold rounded-xl hover:bg-stellar-dark transition-colors"
                >
                  {settings.connected.stellarWallet ? "Update" : "Connect"}
                </button>
                {settings.connected.stellarWallet && (
                  <button
                    onClick={() => {
                      setWalletInput("");
                      updateSettings("connected", { stellarWallet: null });
                    }}
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>

            {/* Calendar Sync */}
            <div className="p-5 border border-gray-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Calendar Sync
                  </p>
                  <p className="text-xs text-gray-400">
                    Sync sessions with your calendar
                  </p>
                </div>
                {settings.connected.calendarSync && (
                  <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    Synced
                  </span>
                )}
              </div>
              {!settings.connected.calendarSync ? (
                <div className="flex gap-2">
                  {(["google", "outlook"] as const).map((provider) => (
                    <button
                      key={provider}
                      onClick={() =>
                        updateSettings("connected", {
                          calendarSync: true,
                          calendarProvider: provider,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 capitalize transition-colors"
                    >
                      {provider === "google" ? "Google Calendar" : "Outlook"}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 capitalize">
                    Connected to {settings.connected.calendarProvider} Calendar
                  </p>
                  <button
                    onClick={() =>
                      updateSettings("connected", {
                        calendarSync: false,
                        calendarProvider: null,
                      })
                    }
                    className="text-sm text-red-500 hover:text-red-600 font-semibold"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case "session":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Default Session Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() =>
                      updateSettings("session", { defaultDuration: d })
                    }
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      settings.session.defaultDuration === d
                        ? "border-stellar bg-stellar/5 text-stellar"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Buffer Time Between Sessions
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Time blocked after each session ends
              </p>
              <div className="grid grid-cols-5 gap-2">
                {BUFFERS.map((b) => (
                  <button
                    key={b}
                    onClick={() => updateSettings("session", { bufferTime: b })}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      settings.session.bufferTime === b
                        ? "border-stellar bg-stellar/5 text-stellar"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {b === 0 ? "None" : `${b}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your account, preferences, and privacy.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <nav className="md:w-56 shrink-0" aria-label="Settings navigation">
          <ul className="space-y-1">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-stellar text-white shadow-sm shadow-stellar/20"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {tab.icon}
                    {tab.label}
                  </span>
                  {activeTab !== tab.id && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h2>
              {/* Save status indicator */}
              {saveStatus !== "idle" && (
                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                    saveStatus === "saving"
                      ? "bg-gray-100 text-gray-500"
                      : saveStatus === "saved"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-500"
                  }`}
                >
                  {saveStatus === "saving" && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  {saveStatus === "saved" && (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  {saveStatus === "saving"
                    ? "Saving..."
                    : saveStatus === "saved"
                      ? "Saved"
                      : "Error saving"}
                </div>
              )}
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
