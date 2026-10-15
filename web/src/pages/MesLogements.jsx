import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CarteLogement from '../components/CarteLogement'
import { API } from '../config'
import Chargement from '../components/Chargement'

function MesLogements() {
  const { token, deconnecter } = useAuth()
  const [logements, setLogements] = useState([])
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
      const reponse = await fetch(`http://localhost:8000/logements/${logement.id}`, {
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

  if (chargement) return <Chargement />

  if (erreur) return <p className="erreur">{erreur}</p>

  return (
    <div>
      <div className="entete-page">
        <h1>Mes logements</h1>
        <Link to="/mes-logements/nouveau" className="bouton-lien">+ Publier un logement</Link>
      </div>

      {erreurAction && <p className="erreur">{erreurAction}</p>}

      {logements.length === 0 ? (
        <p>Vous n'avez publié aucun logement.</p>
      ) : (
        <div className="liste-logements">
          {logements.map(logement => (
            <div key={logement.id} className="item-logement">
              <CarteLogement logement={logement} />
              <span className={logement.statut === 'disponible' ? 'badge' : 'badge badge-loue'}>
                {logement.statut}
              </span>
              <div className="actions-logement">
                <Link to={`/mes-logements/${logement.id}/modifier`} className="bouton-secondaire">
                  Modifier
                </Link>
                <button type="button" className="bouton-danger" onClick={() => supprimer(logement)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MesLogements