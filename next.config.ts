import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    NEXT_PUBLIC_NOTION_CLIENT_ID:
      process.env.NEXT_PUBLIC_NOTION_CLIENT_ID ?? process.env.NOTION_CLIENT_ID ?? '',
    NEXT_PUBLIC_NOTION_REDIRECT_URI:
      process.env.NEXT_PUBLIC_NOTION_REDIRECT_URI ?? process.env.NOTION_REDIRECT_URI ?? '',
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://apis.google.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self'",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://firestore.googleapis.com https://generativelanguage.googleapis.com wss://generativelanguage.googleapis.com https://api.notion.com wss://*.firebaseio.com",
              // Firebase popup auth relies on an embedded auth iframe from the authDomain.
              "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://*.web.app",
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
