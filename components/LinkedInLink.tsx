import { LINKEDIN_URL } from "@/lib/site";

// LinkedIn "in" mark (official glyph shape), drawn inline so it needs no icon library.
export function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export function LinkedInLink({ className = "", size = 18, label = false }: { className?: string; size?: number; label?: boolean }) {
  if (!LINKEDIN_URL) return null;
  return (
    <a
      href={LINKEDIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Bright Brush and Bristle Works India on LinkedIn"
      className={`inline-flex items-center gap-2 transition-colors ${className}`}
    >
      <LinkedInIcon size={size} />
      {label && <span>LinkedIn</span>}
    </a>
  );
}
