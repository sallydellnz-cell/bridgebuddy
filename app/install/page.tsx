"use client";

import { useHomeScreenInstall } from "../home-screen-install";
import Link from "next/link";

export default function InstallPage() {
  const install = useHomeScreenInstall();
  return (
    <main style={{ maxWidth: "32rem", margin: "3rem auto", padding: "0 1.25rem", lineHeight: 1.55 }}>
      <h1>Install BridgeBuddy</h1>
      <p>Add BridgeBuddy to your Home Screen to open it with one tap.</p>
      {install}
      <h2>iPhone or iPad</h2>
      <p>Open this page in Safari. Tap Share, choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>. If Safari offers <strong>Open as Web App</strong>, turn it on.</p>
      <h2>Android</h2>
      <p>Open this page in Chrome. Tap the three-dot menu, choose <strong>Add to Home screen</strong> or <strong>Install app</strong>, then confirm.</p>
      <Link href="/">Open BridgeBuddy</Link>
    </main>
  );
}
