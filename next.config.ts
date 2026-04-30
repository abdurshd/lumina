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
            value: "unsafe-none",
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
          // Content-Security-Policy is set per-request in `src/middleware.ts`
          // with a nonce — see that file for the policy.
        ],
      },
    ];
  },
};

export default nextConfig;
