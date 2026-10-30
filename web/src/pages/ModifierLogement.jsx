import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormulaireLogement from '../components/FormulaireLogement'
import { API } from '../config'
import Chargement from '../components/Chargement'

function ModifierLogement() {
  const { id } = useParams()
  const { utilisateur } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [logement, setLogement] = useState(null)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    async function charger() {
      setChargement(true)
      setErreur('')
      try {
        const reponse = await fetch(`${API}/logements/${id}`)
        if (!reponse.ok) {
          setErreur(reponse.status === 404 ? 'Logement introuvable' : 'Erreur du serveur')
          return
        }
        setLogement(await reponse.json())
      } catch {
        setErreur('Impossible de joindre le serveur')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [id])

  if (chargement) return <Chargement />

  if (erreur) {
    return (
      <div>
        <p className="erreur">{erreur}</p>
        <Link to="/mes-logements" className="lien">Retour à mes logements</Link>
      </div>
    )
  }

  if (logement.id_proprietaire !== utilisateur.id) {
    return <p className="erreur">Vous n'êtes pas propriétaire de ce logement.</p>
  }

    return (
    <>
      {location.state?.avertissement && (
        <p className="erreur">{location.state.avertissement}</p>
      )}
      <FormulaireLogement
        key={logement.id}
        logement={logement}
        onSucces={() => navigate('/mes-logements')}
      />
    </>
  )
}

export default ModifierLogement