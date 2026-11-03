import { useState } from 'react'
import { API } from '../config'

export default function Connexion({ onConnexion }) {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    setEnvoi(true)
    try {
      const reponse = await fetch(`${API}/utilisateurs/connexion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, mot_de_passe: motDePasse })
      })
      const data = await reponse.json()
      if (!reponse.ok) {
        setErreur(typeof data.detail === 'string' ? data.detail : 'Identifiants invalides')
        return
      }
      onConnexion(data.access_token)
    } catch {
      setErreur('Impossible de joindre le serveur')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form className="formulaire" onSubmit={soumettre}>
      <h2>Connexion</h2>
      <p className="auth-sous-titre">Accédez à votre compte ImmoIA.</p>

      <div className="champ">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="champ">
        <label htmlFor="mdp">Mot de passe</label>
        <input id="mdp" type="password" autoComplete="current-password" value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)} required />
      </div>

      {erreur && <p className="erreur">{erreur}</p>}

      <button type="submit" disabled={envoi}>
        {envoi ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}