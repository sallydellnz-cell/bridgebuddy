"use client";

import { useEffect, useRef, useState } from "react";

type InstallPrompt = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function useHomeScreenInstall() {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [offer, setOffer] = useState<InstallPrompt | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const help = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (showHelp) help.current?.scrollIntoView({ block: "nearest" });
  }, [showHelp]);

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

  if (platform === "desktop" || standalone) return null;
  async function install() {
    if (!offer) { setShowHelp(open => !open); return; }
    setOffer(null);
    try {
      await offer.prompt();
      if ((await offer.userChoice).outcome === "accepted") setShowHelp(false);
    } catch { setShowHelp(true); }
  }

  return <div className={platform ? "home-screen-install" : "home-screen-install install-detecting"}>
    <button type="button" onClick={install} aria-expanded={offer ? undefined : showHelp}>Install BridgeBuddy</button>
    {showHelp && <p ref={help} role="status">{platform === "ios"
      ? "In Safari, tap Share, then Add to Home Screen. If offered, turn on Open as Web App, then tap Add."
      : "In Chrome, open the ⋮ menu, tap Add to Home screen, then choose Install or Create shortcut."}</p>}
  </div>;
}
