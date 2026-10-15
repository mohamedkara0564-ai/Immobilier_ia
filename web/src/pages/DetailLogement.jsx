import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import FormulaireReservation from '../components/FormulaireReservation'
import { API } from '../config'
import Chargement from '../components/Chargement'

export default function DetailLogement() {
  const { id } = useParams()
  const [logement, setLogement] = useState(null)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    async function charger() {
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
        <Link to="/" className="lien">Retour aux logements</Link>
      </div>
    )
  }

  return (
    <div className="detail">
      <Link to="/" className="lien">← Retour aux logements</Link>
      <h1>{logement.titre}</h1>
      <p className="lieu">
        {logement.type} à {logement.quartier ? `${logement.quartier}, ` : ''}{logement.ville}
      </p>
      <p>{logement.description}</p>
      <ul>
        <li>{logement.surface} m²</li>
        <li>{logement.nb_chambres} chambre(s)</li>
        <li>{logement.nb_salons} salon(s)</li>
        <li>{logement.nb_salles_de_bains} salle(s) de bains</li>
        <li>Adresse : {logement.adresse}</li>
      </ul>
      <p className="prix">{logement.prix.toLocaleString('fr-FR')} FCFA / mois</p>
      <FormulaireReservation
      logement={logement}
      onReservation={()=> setLogement({...logement, statut: 'loué'})}
      />
    </div>
  )
}
