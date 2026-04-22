import { useState } from "react";
import { usePWA } from "../../hooks/usePWA";

export default function InstallPrompt() {
  const {
    isInstallable,
    isOffline,
    isPushSupported,
    notificationPermission,
    installApp,
    requestNotificationPermission,
    showLocalNotification,
  } = usePWA();

  const [installing, setInstalling] = useState(false);
  const [enablingNotifications, setEnablingNotifications] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    await installApp();
    setInstalling(false);
  };

  const handleEnableNotifications = async () => {
    setEnablingNotifications(true);
    const permission = await requestNotificationPermission();

    if (permission === "granted") {
      await showLocalNotification("MentorMinds notifications enabled", {
        body: "You will now receive learning updates.",
      });
    }

    setEnablingNotifications(false);
  };

  if (!isInstallable && !isOffline && notificationPermission === "granted") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 space-y-3 md:left-auto md:right-4 md:w-[380px]">
      {isOffline && (
        <div className="rounded-lg bg-red-600 p-4 text-white shadow-lg">
          <p className="font-semibold">You are offline</p>
          <p className="text-sm opacity-90">Some features may be limited until connection returns.</p>
        </div>
      )}

      {isInstallable && (
        <div className="flex items-center justify-between rounded-lg bg-black p-4 text-white shadow-lg">
          <div>
            <p className="font-semibold">Install this app</p>
            <p className="text-sm text-gray-300">Get a better mobile learning experience.</p>
          </div>
          <button
            onClick={handleInstall}
            disabled={installing}
            className="rounded bg-white px-3 py-1 text-black"
          >
            {installing ? "Installing..." : "Install"}
          </button>
        </div>
      )}

      {isPushSupported && notificationPermission !== "granted" && (
        <div className="flex items-center justify-between rounded-lg bg-blue-600 p-4 text-white shadow-lg">
          <div>
            <p className="font-semibold">Enable notifications</p>
            <p className="text-sm text-blue-100">Get reminders and session updates.</p>
          </div>
          <button
            onClick={handleEnableNotifications}
            disabled={enablingNotifications}
            className="rounded bg-white px-3 py-1 text-blue-700"
          >
            {enablingNotifications ? "Enabling..." : "Enable"}
          </button>
        </div>
      )}
    </div>
  );
}