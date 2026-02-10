import type { SVGProps } from 'react';

interface BrandIconProps {
  className?: string;
}

export function GmailIcon({ className }: BrandIconProps) {
  return <img src="/icons/gmail.svg" alt="Gmail" className={className} />;
}

export function ChatGPTIcon({ className }: BrandIconProps) {
  return <img src="/icons/chatgpt.svg" alt="ChatGPT" className={className} />;
}

export function GoogleDriveIcon({ className }: BrandIconProps) {
  return <img src="/icons/google-drive.svg" alt="Google Drive" className={className} />;
}

export function NotionIcon({ className }: BrandIconProps) {
  return <img src="/icons/notion.svg" alt="Notion" className={className} />;
}

export function GeminiIcon({ className }: BrandIconProps) {
  return <img src="/icons/gemini.svg" alt="Gemini" className={className} />;
}

export function ClaudeIcon({ className }: BrandIconProps) {
  return <img src="/icons/claude.svg" alt="Claude" className={className} />;
}

type IconProps = SVGProps<SVGSVGElement>;

export function FileUploadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M12 12v6" />
      <path d="m15 15-3-3-3 3" />
    </svg>
  );
}
