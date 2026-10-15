import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API } from '../config'

export default function FormulaireReservation({ logement, onReservation }) {
  const { token, utilisateur, deconnecter } = useAuth()
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const aujourdhui = new Date().toISOString().split('T')[0]

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')

    if (dateFin <= dateDebut) {
      setErreur('La date de fin doit être après la date de début')
      return
    }

    setEnvoi(true)
    try {
      const reponse = await fetch(`${API}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_logement: logement.id,
          date_debut: dateDebut,
          date_fin: dateFin
        })
      })

      if (reponse.status === 401) {
        deconnecter()
        return
      }

      const data = await reponse.json()

      if (!reponse.ok) {
        setErreur(typeof data.detail === 'string' ? data.detail : 'Données invalides')
        return
      }

      setSucces(`Réservation confirmée ! Loyer : ${logement.prix.toLocaleString('fr-FR')} FCFA / mois`)
      onReservation()
    } catch {
      setErreur('Impossible de joindre le serveur')
    } finally {
      setEnvoi(false)
    }
  }

  if (succes) return <p className="succes">{succes}</p>

  if (logement.statut !== 'disponible') {
    return <p className="erreur">Ce logement n'est plus disponible.</p>
  }

  if (!utilisateur) {
    return (
      <p>
        <Link to="/connexion" className="lien">Connectez-vous</Link> pour réserver ce logement.
      </p>
    )
  }

  if (utilisateur.role !== 'Locataire') {
    return <p>Seuls les locataires peuvent réserver un logement.</p>
  }

  return (
    <form className="formulaire reservation" onSubmit={soumettre}>
      <h2>Réserver</h2>

      <label htmlFor="date-debut">Date de début</label>
      <input
        id="date-debut"
        type="date"
        min={aujourdhui}
        value={dateDebut}
        onChange={(e) => setDateDebut(e.target.value)}
        required
      />

      <label htmlFor="date-fin">Date de fin</label>
      <input
        id="date-fin"
        type="date"
        min={dateDebut || aujourdhui}
        value={dateFin}
        onChange={(e) => setDateFin(e.target.value)}
        required
      />

      {erreur && <p className="erreur">{erreur}</p>}

      <button type="submit" disabled={envoi}>
        {envoi ? 'Envoi...' : 'Confirmer la réservation'}
      </button>
    </form>
  )
}