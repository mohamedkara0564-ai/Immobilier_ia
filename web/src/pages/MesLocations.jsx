import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Chargement from '../components/Chargement'
import { IconeMaison, IconePin } from '../components/Icones'
import { API, urlPhoto } from '../config'

function formaterDate(texte) {
  const [annee, mois, jour] = String(texte).split('T')[0].split('-')
  return `${jour}/${mois}/${annee}`
}

function MesLocations() {
  const { token, deconnecter } = useAuth()
  const [locations, setLocations] = useState([])
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    async function charger() {
      try {
        const reponse = await fetch(`${API}/locations/mes_locations`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (reponse.status === 401) {
          deconnecter()
          return
        }

        if (!reponse.ok) {
          setErreur('Impossible de charger vos locations')
          return
        }

        setLocations(await reponse.json())
      } catch {
        setErreur('Impossible de joindre le serveur')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [token])

  if (chargement) return <Chargement />

  if (erreur) return <p className="erreur">{erreur}</p>

  return (
    <div>
      <div className="entete-page">
        <h1>Mes locations</h1>
      </div>

      {locations.length === 0 ? (
        <div className="etat-vide">
          Vous n'avez aucune location. <Link to="/" className="lien">Parcourir les logements</Link>
        </div>
      ) : (
        <div className="liste-rangees">
          {locations.map(location => {
            const logement = location.logement
            const photo = logement?.photos?.[0]
            const lieu = logement ? [logement.quartier, logement.ville].filter(Boolean).join(', ') : ''
            return (
              <div key={location.id} className="rangee">
                <div className="rangee-photo">
                  {photo ? <img src={urlPhoto(photo.url)} alt={logement.titre} loading="lazy" /> : <IconeMaison />}
                </div>

                <div className="rangee-infos">
                  <h2>
                    <Link to={`/logements/${location.id_logement}`}>
                      {logement ? logement.titre : `Logement n°${location.id_logement}`}
                    </Link>
                  </h2>
                  {lieu && <p><IconePin /> {lieu}</p>}
                  <p>Du {formaterDate(location.date_debut)} au {formaterDate(location.date_fin)}</p>
                  <p className="rangee-prix">{location.montant_loyer.toLocaleString('fr-FR')} FCFA / mois</p>
                </div>

                <span className="badge rangee-badge">{location.statut}</span>

                <div className="rangee-actions">
                  <Link to={`/logements/${location.id_logement}`} className="bouton-secondaire">
                    Voir le logement
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MesLocations