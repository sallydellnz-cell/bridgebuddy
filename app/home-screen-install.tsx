"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function useHomeScreenInstall() {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [offer, setOffer] = useState<InstallPrompt | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setPlatform(ios ? "ios" : /Android/i.test(navigator.userAgent) ? "android" : "desktop");
    const mode = window.matchMedia("(display-mode: standalone)");
    const syncMode = () => setStandalone(mode.matches || (navigator as Navigator & {standalone?: boolean}).standalone === true);
    const installed = () => { setStandalone(true); setOffer(null); };
    const available = (event: Event) => {
      // Retain the mobile prompt for the explicit button; keep the browser's desktop behaviour.
      if (ios || /Android/i.test(navigator.userAgent)) {
        event.preventDefault();
        setOffer(event as InstallPrompt);
      }
    };
    syncMode();
    window.addEventListener("beforeinstallprompt", available);
    window.addEventListener("appinstalled", installed);
    mode.addEventListener("change", syncMode);
    if (window.isSecureContext && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/mobile-sw.js").catch(() => {
        // Safari and Android browser menu installation instructions remain available.
      });
    }
    return () => {
      mode.removeEventListener("change", syncMode);
      window.removeEventListener("beforeinstallprompt", available);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (!platform || standalone) return null;
  async function install() {
    if (!offer) { setShowHelp(open => !open); return; }
    setOffer(null);
    try {
      await offer.prompt();
      if ((await offer.userChoice).outcome === "accepted") setShowHelp(false);
    } catch { setShowHelp(true); }
  }

  return <div className="home-screen-install">
    <button type="button" onClick={install} aria-expanded={offer ? undefined : showHelp}>{platform === "desktop" ? "Install on your phone" : "Add to Home Screen"}</button>
    {showHelp && platform === "desktop" && <p>Open bridgebuddy.co.nz on your phone. On iPhone, use Safari’s Share menu and choose Add to Home Screen. On Android, use Chrome’s menu and choose Add to Home screen.</p>}
    {showHelp && platform !== "desktop" && <p>{platform === "ios"
      ? "In Safari, tap Share, then Add to Home Screen. If offered, turn on Open as Web App, then tap Add."
      : "In Chrome, open the ⋮ menu, tap Add to Home screen, then choose Install or Create shortcut."}</p>}
  </div>;
}
