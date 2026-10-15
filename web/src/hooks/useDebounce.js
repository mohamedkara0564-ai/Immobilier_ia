import { useState, useEffect } from 'react'

export function useDebounce(valeur, delai = 400) {
  const [valeurDiffere, setValeurDiffere] = useState(valeur)

  useEffect(() => {
    const minuteur = setTimeout(() => setValeurDiffere(valeur), delai)
    return () => clearTimeout(minuteur)
  }, [valeur, delai])

  return valeurDiffere
}