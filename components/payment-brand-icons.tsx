export function VisaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect width="48" height="32" rx="6" fill="#1A1F71" />
      <text x="24" y="21" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">
        VISA
      </text>
    </svg>
  )
}

export function MastercardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect width="48" height="32" rx="6" fill="#1A1A1A" />
      <circle cx="19" cy="16" r="8" fill="#EB001B" />
      <circle cx="29" cy="16" r="8" fill="#F79E1B" />
      <path d="M24 10.2a8 8 0 0 1 0 11.6 8 8 0 0 1 0-11.6Z" fill="#FF5F00" />
    </svg>
  )
}

export function ApplePayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect width="48" height="32" rx="6" fill="#111111" />
      <g fill="white" transform="translate(7.5,6.2) scale(0.72)">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </g>
      <text x="34" y="20.5" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="600" fontFamily="Arial, sans-serif">
        Pay
      </text>
    </svg>
  )
}

export function GooglePayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect width="48" height="32" rx="6" fill="#FFFFFF" stroke="#E5E5E5" />
      <g transform="translate(7.5,8) scale(0.7)">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </g>
      <text x="36" y="20.2" textAnchor="middle" fill="#3C4043" fontSize="8.5" fontWeight="600" fontFamily="Arial, sans-serif">
        Pay
      </text>
    </svg>
  )
}

export function InstantEftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect width="48" height="32" rx="6" fill="#0F766E" />
      <path
        fill="white"
        d="M10 20.5V12l14-4.5L38 12v8.5h-3.5V14L24 10.2 13.5 14v6.5H10Zm6.5 1.5h3.2v-4.2h8.6V22h3.2v-5.8l-7.5-2.5-7.5 2.5V22Z"
      />
    </svg>
  )
}

export function CreditPayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect width="48" height="32" rx="6" fill="#7D562D" />
      <rect x="8" y="10" width="32" height="14" rx="2.5" fill="#F4E6D4" />
      <rect x="8" y="13" width="32" height="4" fill="#C4A574" />
      <rect x="12" y="19.5" width="10" height="2" rx="1" fill="#7D562D" />
      <rect x="30" y="19" width="6" height="3" rx="1" fill="#D4AF37" />
    </svg>
  )
}

export function YocoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#00A4E0" />
      <path
        fill="white"
        d="M7.2 16.8 12 7.2l4.8 9.6h-2.2L12 11.4 9.4 16.8H7.2Zm2.4 1.5h4.8c.5 1.2 1.2 1.8 2.4 1.8v1.7c-2 0-3.3-1-4.1-3.5H9.6v-1.5Z"
      />
    </svg>
  )
}
