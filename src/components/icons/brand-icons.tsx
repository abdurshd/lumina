interface BrandIconProps {
  className?: string;
}

const OFFICIAL_BRAND_ICON_URLS = {
  gmail: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
  googleDrive: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
  gemini: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Google_Gemini_icon_2025.svg',
  chatgpt: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/ChatGPT-Logo.svg',
  fileUpload: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Google_Files_icon.svg',
} as const;

export function GmailIcon({ className }: BrandIconProps) {
  return (
    <img
      src={OFFICIAL_BRAND_ICON_URLS.gmail}
      alt="Gmail"
      className={className}
      onError={(event) => {
        event.currentTarget.src = '/icons/gmail.svg';
      }}
    />
  );
}

export function ChatGPTIcon({ className }: BrandIconProps) {
  return (
    <img
      src={OFFICIAL_BRAND_ICON_URLS.chatgpt}
      alt="ChatGPT"
      className={className}
      onError={(event) => {
        event.currentTarget.src = '/icons/chatgpt.svg';
      }}
    />
  );
}

export function GoogleDriveIcon({ className }: BrandIconProps) {
  return (
    <img
      src={OFFICIAL_BRAND_ICON_URLS.googleDrive}
      alt="Google Drive"
      className={className}
      onError={(event) => {
        event.currentTarget.src = '/icons/google-drive.svg';
      }}
    />
  );
}

export function NotionIcon({ className }: BrandIconProps) {
  return <img src="/icons/notion.svg" alt="Notion" className={className} />;
}

export function GeminiIcon({ className }: BrandIconProps) {
  return (
    <img
      src={OFFICIAL_BRAND_ICON_URLS.gemini}
      alt="Gemini"
      className={className}
      onError={(event) => {
        event.currentTarget.src = '/icons/gemini.svg';
      }}
    />
  );
}

export function ClaudeIcon({ className }: BrandIconProps) {
  return <img src="/icons/claude.svg" alt="Claude" className={className} />;
}

export function FileUploadIcon({ className }: BrandIconProps) {
  return (
    <img
      src={OFFICIAL_BRAND_ICON_URLS.fileUpload}
      alt="File Upload"
      className={className}
    />
  );
}
