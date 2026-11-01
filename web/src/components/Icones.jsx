function Icone({ children }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export const IconeTous = () => (
  <Icone>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </Icone>
)

export const IconeAppartement = () => (
  <Icone>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </Icone>
)

export const IconeMaison = () => (
  <Icone>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M10 21v-6h4v6" />
  </Icone>
)

export const IconeVilla = () => (
  <Icone>
    <path d="M2 11 12 3l10 8" />
    <path d="M4 10v11h16V10" />
    <path d="M8 21v-5h3v5" />
    <rect x="14" y="13" width="3" height="3" />
  </Icone>
)

export const IconeStudio = () => (
  <Icone>
    <path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3" />
    <path d="M3 14a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v4H3Z" />
    <path d="M5 18v2" />
    <path d="M19 18v2" />
  </Icone>
)

export const IconeLit = () => (
  <Icone>
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </Icone>
)

export const IconeBain = () => (
  <Icone>
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    <line x1="10" x2="8" y1="5" y2="7" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <line x1="7" x2="7" y1="19" y2="21" />
    <line x1="17" x2="17" y1="19" y2="21" />
  </Icone>
)

export const IconeSurface = () => (
  <Icone>
    <path d="M3 9V3h6" />
    <path d="M21 9V3h-6" />
    <path d="M3 15v6h6" />
    <path d="M21 15v6h-6" />
  </Icone>
)

export const IconePin = () => (
  <Icone>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Icone>
)
export const IconeSalon = IconeStudio