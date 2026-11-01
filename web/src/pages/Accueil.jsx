import { useState, useEffect } from 'react'
import CarteLogement from '../components/CarteLogement'
import CategoriesLogements from '../components/CategoriesLogements'
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

  const nombre = logements.length
  const filtresActifs = Boolean(ville || quartier || prixMax || type)

  function reinitialiser() {
    setVille('')
    setQuartier('')
    setPrixMax('')
    setType('')
  }

  return (
    <div>
      <section className="banniere">
        <h1>Trouvez votre prochain logement à Abidjan</h1>
        <p>Appartements, maisons, villas et studios. Comparez les loyers et réservez en ligne.</p>

        <div className="filtres">
          <input aria-label="Ville" value={ville} placeholder="Ville"
            onChange={(e) => setVille(e.target.value)} />
          <input aria-label="Quartier" value={quartier} placeholder="Quartier"
            onChange={(e) => setQuartier(e.target.value)} />
          <input aria-label="Prix maximum" type="number" value={prixMax} placeholder="Prix max (FCFA)"
            onChange={(e) => setPrixMax(e.target.value)} />
        </div>
      </section>

      <CategoriesLogements type={type} onChoisir={setType} />

      {erreur && <p className="erreur">{erreur}</p>}

      {chargement && nombre === 0 ? (
        <Chargement texte="Recherche en cours..." />
      ) : (
        <>
          <div className="entete-liste">
            <h2>Logements disponibles</h2>
            <span className="compteur">
              {chargement
                ? 'Recherche en cours...'
                : `${nombre} logement${nombre > 1 ? 's' : ''} trouvé${nombre > 1 ? 's' : ''}`}
            </span>
            {filtresActifs && (
              <button className="lien" onClick={reinitialiser}>Réinitialiser les filtres</button>
            )}
          </div>

          {!chargement && !erreur && nombre === 0 && (
            <div className="etat-vide">Aucun logement ne correspond à votre recherche.</div>
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