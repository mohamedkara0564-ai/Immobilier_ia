import { useState, useEffect } from 'react'
import CarteLogement from '../components/CarteLogement'
import Chargement from '../components/Chargement'
import { useDebounce } from '../hooks/useDebounce'
import { API } from '../config'

function Accueil() {
  const [logements, setLogements] = useState([])
  const [ville, setVille] = useState('')
  const [quartier, setQuartier] = useState('')
  const [prixMax, setPrixMax] = useState('')
  const [type, setType] = useState('')
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  const villeDiffere = useDebounce(ville)
  const quartierDiffere = useDebounce(quartier)
  const prixMaxDiffere = useDebounce(prixMax)

  useEffect(() => {
    const controleur = new AbortController()

    const params = new URLSearchParams()
    if (villeDiffere) params.append('ville', villeDiffere)
    if (quartierDiffere) params.append('quartier', quartierDiffere)
    if (prixMaxDiffere) params.append('prix_max', prixMaxDiffere)
    if (type) params.append('type', type)

    setChargement(true)
    setErreur('')

    fetch(`${API}/logements?${params.toString()}`, { signal: controleur.signal })
      .then(reponse => {
        if (!reponse.ok) throw new Error('erreur http')
        return reponse.json()
      })
      .then(data => {
        setLogements(data)
        setChargement(false)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        setErreur('Impossible de charger les logements')
        setChargement(false)
      })

    return () => controleur.abort()
  }, [villeDiffere, quartierDiffere, prixMaxDiffere, type])

  return (
    <div>
      <div className="filtres">
        <input aria-label="Ville" value={ville} placeholder="Ville"
          onChange={(e) => setVille(e.target.value)} />
        <input aria-label="Quartier" value={quartier} placeholder="Quartier"
          onChange={(e) => setQuartier(e.target.value)} />
        <input aria-label="Prix maximum" type="number" value={prixMax} placeholder="Prix max (FCFA)"
          onChange={(e) => setPrixMax(e.target.value)} />
        <select aria-label="Type de logement" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tous les types</option>
          <option value="appartement">Appartement</option>
          <option value="maison">Maison</option>
          <option value="villa">Villa</option>
          <option value="studio">Studio</option>
        </select>
      </div>

      {erreur && <p className="erreur">{erreur}</p>}

      {chargement && logements.length === 0 ? (
        <Chargement texte="Recherche en cours..." />
      ) : (
        <>
          <p>{chargement ? 'Recherche en cours...' : `${logements.length} logement(s) trouvé(s)`}</p>

          {!chargement && !erreur && logements.length === 0 && (
            <p>Aucun logement ne correspond à votre recherche.</p>
          )}

          <div className={chargement ? 'liste-logements en-chargement' : 'liste-logements'}>
            {logements.map(logement => (
              <CarteLogement key={logement.id} logement={logement} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Accueil