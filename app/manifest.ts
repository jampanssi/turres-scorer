import type { MetadataRoute } from "next";

/**
 * The web app manifest: what makes the app installable ("Add to Home screen"). It is generated at build
 * time, with no request data. Opens in its own window (`standalone`, no browser bar), portrait, on the
 * matches list: a signed-out visitor is sent to Sign in by the session gate.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TurRes Scorer",
    short_name: "TurRes",
    description: "Scoring app for applied reservist shooting matches",
    lang: "en",
    start_url: "/matches",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#005185",
    theme_color: "#005185",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
