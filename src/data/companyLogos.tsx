import React from 'react';

export type CompanyName = 'Google' | 'Amazon' | 'Meta' | 'Microsoft' | 'Apple' | 'Uber' | 'Netflix' | 'Bloomberg' | 'Adobe';

interface CompanyLogoProps {
  company: string;
  size?: number;
  className?: string;
}

export function CompanyLogo({ company, size = 14, className = '' }: CompanyLogoProps) {
  switch (company.toLowerCase()) {
    case 'google':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
      );
    case 'amazon':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M14.28 13.77c-.38.45-1.15.54-1.74.22-.97-.53-1.57-1.4-1.57-2.73 0-1.87 1.25-3.04 3.12-3.04 1.34 0 2.22.61 2.65 1.55l-1.3.69c-.27-.55-.72-.85-1.35-.85-.92 0-1.54.67-1.54 1.65 0 .76.38 1.33 1.03 1.57.51.18.99.02 1.35-.35l.77 1.29zm8.56 5.86c-.22.18-.55.19-.77.03-3.23-2.38-7.79-3.66-12.87-3.66-3.41 0-6.72.63-9.59 1.83-.28.12-.59.01-.73-.25-.13-.26-.03-.58.23-.71 3.04-1.28 6.54-1.95 10.15-1.95 5.36 0 10.15 1.35 13.56 3.86.27.2.29.58.02.85zm.57-1.63c-.15.2-.42.27-.66.17-.4-.17-1.51-.55-3.08-.24-.26.05-.51-.12-.56-.38-.05-.26.12-.51.38-.56 1.93-.38 3.3.08 3.75.28.24.11.32.41.17.66z"
            fill="#FF9900"
          />
          <path
            d="M8.88 5.5c-2.31 0-4.18 1.87-4.18 4.18 0 1.22.52 2.32 1.36 3.07l1.09-1.09c-.53-.49-.86-1.19-.86-1.98 0-1.42 1.16-2.59 2.59-2.59s2.59 1.16 2.59 2.59c0 .79-.33 1.49-.86 1.98l1.09 1.09c.84-.75 1.36-1.85 1.36-3.07 0-2.31-1.87-4.18-4.18-4.18z"
            fill="#ffffff"
            opacity="0.9"
          />
        </svg>
      );
    case 'meta':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M16.59 4c-2.22 0-3.92 1.28-4.59 2.65C11.33 5.28 9.63 4 7.41 4 3.75 4 1 6.88 1 10.84c0 4.22 3.12 7.78 6.54 7.78 2.06 0 3.7-1.07 4.46-2.43.76 1.36 2.4 2.43 4.46 2.43 3.42 0 6.54-3.56 6.54-7.78C23 6.88 20.25 4 16.59 4zm-9.18 12.24c-2.31 0-4.32-2.73-4.32-5.4 0-2.48 1.76-4.24 4.32-4.24 2.14 0 3.88 1.69 4.38 3.99-.45 2.14-2.09 5.65-4.38 5.65zm9.18 0c-2.29 0-3.93-3.51-4.38-5.65.5-2.3 2.24-3.99 4.38-3.99 2.56 0 4.32 1.76 4.32 4.24 0 2.67-2.01 5.4-4.32 5.4z"
            fill="#0668E1"
          />
        </svg>
      );
    case 'microsoft':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
          <rect x="1" y="1" width="10" height="10" fill="#F25022" rx="1" />
          <rect x="13" y="1" width="10" height="10" fill="#7FBA00" rx="1" />
          <rect x="1" y="13" width="10" height="10" fill="#00A4EF" rx="1" />
          <rect x="13" y="13" width="10" height="10" fill="#FFB900" rx="1" />
        </svg>
      );
    case 'apple':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.98.6-2.61 1.34-.55.63-.99 1.66-.86 2.67.99.08 2.02-.49 2.54-1.16z" />
        </svg>
      );
    case 'uber':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10.5" stroke="#ffffff" strokeWidth="2" />
          <rect x="7" y="7" width="10" height="10" rx="2" fill="#ffffff" />
          <circle cx="12" cy="12" r="2.5" fill="#000000" />
        </svg>
      );
    case 'netflix':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
          <path d="M5.5 2h3.5v20H5.5z" fill="#E50914" />
          <path d="M15 2h3.5v20H15z" fill="#E50914" />
          <path d="M5.5 2l9.5 20h3.5L9 2H5.5z" fill="#B81D24" />
        </svg>
      );
    case 'bloomberg':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-5h2v5zm0-7h-2V7h2v2.5z" />
        </svg>
      );
    case 'adobe':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
          <path d="M14.5 3H21v18z" fill="#FA0F00" />
          <path d="M9.5 3H3v18z" fill="#FA0F00" />
          <path d="M12 9.5l4 9.5h-2.8l-1.2-3H9.8l2.2-6.5z" fill="#FA0F00" />
        </svg>
      );
    default:
      return null;
  }
}

export const TOP_COMPANIES = ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Uber', 'Netflix', 'Bloomberg'];
