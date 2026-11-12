export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function urlPhoto(chemin) {
  if (!chemin) return ''
  // Si l'URL est déjà absolue (Supabase Storage), on la retourne telle quelle
  if (chemin.startsWith('http://') || chemin.startsWith('https://')) {
    return chemin
  }
  // Sinon on préfixe avec l'URL du backend (ancien système local)
  return `${API}${chemin}`
}
