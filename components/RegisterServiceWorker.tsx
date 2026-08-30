"use client";

import { useEffect } from "react";

/** Registrira service worker, potreben, da Chrome aplikacijo ponudi za namestitev (PWA). */
export default function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Namestitev vseeno deluje brez tega - le brez offline predpomnjenja lupine.
      });
    }
  }, []);

  return null;
}
