import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Chargement from '../components/Chargement'
import { IconeMaison, IconePin } from '../components/Icones'
import { API, urlPhoto } from '../config'

const ONGLETS = [
  { valeur: 'tous', libelle: 'Tous' },
  { valeur: 'disponible', libelle: 'Disponibles' },
  { valeur: 'loué', libelle: 'Loués' },
]

function MesLogements() {
  const { token, deconnecter } = useAuth()
  const [logements, setLogements] = useState([])
  const [onglet, setOnglet] = useState('tous')
  const [erreur, setErreur] = useState('')
  const [erreurAction, setErreurAction] = useState('')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    async function charger() {
      try {
        const reponse = await fetch(`${API}/logements/mes_logements`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (reponse.status === 401) {
          deconnecter()
          return
        }

        if (!reponse.ok) {
          setErreur(`Impossible de charger vos logements (erreur ${reponse.status})`)
          return
        }

        setLogements(await reponse.json())
      } catch {
        setErreur('Impossible de joindre le serveur')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [token])

  async function supprimer(logement) {
    if (!window.confirm(`Supprimer « ${logement.titre} » ? Cette action est définitive.`)) return

    setErreurAction('')
    try {
      const reponse = await fetch(`${API}/logements/${logement.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (reponse.status === 401) {
        deconnecter()
        return
      }

      if (!reponse.ok) {
        const data = await reponse.json()
        setErreurAction(typeof data.detail === 'string' ? data.detail : 'Suppression impossible')
        return
      }

      setLogements(logements.filter(l => l.id !== logement.id))
    } catch {
      setErreurAction('Impossible de joindre le serveur')
    }
  }

  function compter(valeur) {
    return valeur === 'tous' ? logements.length : logements.filter(l => l.statut === valeur).length
  }

  if (chargement) return <Chargement />

  if (erreur) return <p className="erreur">{erreur}</p>

  const affiches = onglet === 'tous' ? logements : logements.filter(l => l.statut === onglet)

  return (
    <div>
      <div className="entete-page">
        <h1>Mes logements</h1>
        <Link to="/mes-logements/nouveau" className="bouton-lien">+ Publier un logement</Link>
      </div>

      <div className="onglets" role="group" aria-label="Filtrer par statut">
        {ONGLETS.map(({ valeur, libelle }) => (
          <button key={valeur} type="button" className="onglet"
            aria-pressed={onglet === valeur} onClick={() => setOnglet(valeur)}>
            {libelle} <span>{compter(valeur)}</span>
          </button>
        ))}
      </div>

      {erreurAction && <p className="erreur">{erreurAction}</p>}

      {logements.length === 0 ? (
        <div className="etat-vide">Vous n'avez publié aucun logement.</div>
      ) : affiches.length === 0 ? (
        <div className="etat-vide">Aucun logement dans cette catégorie.</div>
      ) : (
        <div className="liste-rangees">
          {affiches.map(logement => {
            const photo = logement.photos?.[0]
            const lieu = [logement.quartier, logement.ville].filter(Boolean).join(', ')
            return (
              <div key={logement.id} className="rangee">
                <div className="rangee-photo">
                  {photo ? <img src={urlPhoto(photo.url)} alt={logement.titre} loading="lazy" /> : <IconeMaison />}
                </div>

                <div className="rangee-infos">
                  <h2><Link to={`/logements/${logement.id}`}>{logement.titre}</Link></h2>
                  <p><IconePin /> {lieu}</p>
                  <p className="rangee-prix">{logement.prix.toLocaleString('fr-FR')} FCFA / mois</p>
                </div>

                <span className={logement.statut === 'disponible' ? 'badge rangee-badge' : 'badge badge-loue rangee-badge'}>
                  {logement.statut}
                </span>

                <div className="rangee-actions">
                  <Link to={`/mes-logements/${logement.id}/modifier`} className="bouton-secondaire">
                    Modifier
                  </Link>
                  <button type="button" className="bouton-danger" onClick={() => supprimer(logement)}>
                    Supprimer
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MesLogements