export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function urlPhoto(chemin) {
  return `${API}${chemin}`
}