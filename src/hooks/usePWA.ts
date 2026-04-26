import { useEffect, useState } from "react";

type DeferredPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    "default"
  );
  const [isSupported, setIsSupported] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);

  useEffect(() => {
    setIsSupported("serviceWorker" in navigator);
    setIsPushSupported("Notification" in window && "serviceWorker" in navigator);

    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    const handleBeforeInstall = (event: Event) => {
      const e = event as DeferredPromptEvent;
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setIsInstallable(false);

    return choice.outcome === "accepted";
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return "denied";

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission;
  };

  const showLocalNotification = async (
    title: string,
    options?: NotificationOptions
  ) => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return false;
    if (Notification.permission !== "granted") return false;

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body: "You have a new update.",
      icon: "/vite.svg",
      badge: "/vite.svg",
      ...options,
    });

    return true;
  };

  return {
    isSupported,
    isPushSupported,
    isInstallable,
    isOffline,
    notificationPermission,
    installApp,
    requestNotificationPermission,
    showLocalNotification,
  };
}