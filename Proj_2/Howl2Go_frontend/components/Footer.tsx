"use client";

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-card)] border-t border-[var(--border)] py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--orange)]">Howl2Go</span>
            <span className="text-[var(--text-muted)] text-xs">
              Open Source
            </span>
          </div>

          {/* Team */}
          <div className="flex items-center gap-1 text-[var(--text-subtle)]">
            <span className="text-[var(--text-muted)] text-xs mr-2">Team:</span>
            <a
              href="https://github.com/harsha711"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--orange)] transition-colors"
            >
              Harsha
            </a>
            <span>•</span>
            <a
              href="https://github.com/Samarth061"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--orange)] transition-colors"
            >
              Samarth
            </a>
            <span>•</span>
            <a
              href="https://github.com/pratham2879"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--orange)] transition-colors"
            >
              Pratham
            </a>
            <span>•</span>
            <a
              href="https://github.com/JaiRumz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--orange)] transition-colors"
            >
              Jai
            </a>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/harsha711/SE_Project_Grp_27/tree/main"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[var(--text-subtle)] hover:text-[var(--orange)] transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="text-xs">GitHub</span>
            </a>
            <a
              href="mailto:supp0rt.howl2go@gmail.com"
              className="text-[var(--text-subtle)] hover:text-[var(--orange)] transition-colors text-xs"
            >
              supp0rt.howl2go@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
