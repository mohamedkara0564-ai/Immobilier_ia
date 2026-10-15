import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API } from '../config'
import Chargement from '../components/Chargement'

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
      <h1>Mes locations</h1>

      {locations.length === 0 ? (
        <p>
          Vous n'avez aucune location. <Link to="/" className="lien">Parcourir les logements</Link>
        </p>
      ) : (
        <div className="liste-locations">
          {locations.map(location => (
            <div key={location.id} className="carte">
              <h2>Logement n°{location.id_logement}</h2>
              <p>Du {formaterDate(location.date_debut)} au {formaterDate(location.date_fin)}</p>
              <p className="prix">{location.montant_loyer.toLocaleString('fr-FR')} FCFA / mois</p>
              <span className="badge">{location.statut}</span>
              <p>
                <Link to={`/logements/${location.id_logement}`} className="lien">Voir le logement</Link>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MesLocations