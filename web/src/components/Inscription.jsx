import { useState } from 'react'
import { API } from '../config'

export default function Inscription({ onInscription }) {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [role, setRole] = useState('Locataire')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    setEnvoi(true)

    try {
      const reponse = await fetch(`${API}/utilisateurs/inscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          prenom,
          email,
          telephone,
          mot_de_passe: motDePasse,
          role
        })
      })
      const data = await reponse.json()
      if (!reponse.ok) {
        setErreur(typeof data.detail === 'string' ? data.detail : 'Données invalides')
        return
      }
      onInscription()
    } catch {
      setErreur('Impossible de joindre le serveur')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form className="formulaire" onSubmit={soumettre}>
      <h2>Créer un compte</h2>
      <p className="auth-sous-titre">Rejoignez ImmoIA en quelques secondes.</p>

      <fieldset className="choix-role">
        <legend>Je suis</legend>
        <label className={role === 'Locataire' ? 'choix choix-actif' : 'choix'}>
          <input type="radio" name="role" value="Locataire"
            checked={role === 'Locataire'} onChange={(e) => setRole(e.target.value)} />
          <strong>Locataire</strong>
          <span>Je cherche un logement</span>
        </label>
        <label className={role === 'Proprietaire' ? 'choix choix-actif' : 'choix'}>
          <input type="radio" name="role" value="Proprietaire"
            checked={role === 'Proprietaire'} onChange={(e) => setRole(e.target.value)} />
          <strong>Propriétaire</strong>
          <span>Je publie des logements</span>
        </label>
      </fieldset>

      <div className="grille-formulaire">
        <div className="champ">
          <label htmlFor="nom">Nom</label>
          <input id="nom" autoComplete="family-name" value={nom}
            onChange={(e) => setNom(e.target.value)} required />
        </div>
        <div className="champ">
          <label htmlFor="prenom">Prénom</label>
          <input id="prenom" autoComplete="given-name" value={prenom}
            onChange={(e) => setPrenom(e.target.value)} required />
        </div>
      </div>

      <div className="champ">
        <label htmlFor="email-ins">Email</label>
        <input id="email-ins" type="email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="champ">
        <label htmlFor="tel">Téléphone</label>
        <input id="tel" type="tel" autoComplete="tel" value={telephone}
          onChange={(e) => setTelephone(e.target.value)} required />
      </div>

      <div className="champ">
        <label htmlFor="mdp-ins">Mot de passe</label>
        <input id="mdp-ins" type="password" autoComplete="new-password" value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)} required />
      </div>

      {erreur && <p className="erreur">{erreur}</p>}

      <button type="submit" disabled={envoi}>
        {envoi ? 'Création...' : 'Créer mon compte'}
      </button>
    </form>
  )
}