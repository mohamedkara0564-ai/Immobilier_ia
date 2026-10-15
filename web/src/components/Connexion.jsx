import { useState } from "react";
import { API } from '../config'

export default function Connexion({onConnexion}){
    const [email, setEmail] = useState('')
    const [motDePasse, setMotDePasse] = useState('')
    const [erreur, setErreur] = useState('')

    async function soumettre(e){
        e.preventDefault()
        setErreur('')
        try{
            const reponse = await fetch(`${API}/utilisateurs/connexion`,{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: email, mot_de_passe: motDePasse})
            })
            const data = await reponse.json()
            if (!reponse.ok){
                setErreur(typeof data.detail === 'string' ? data.detail: 'Identifiants invalide')
                return
            }
            onConnexion(data.access_token)
        }catch{
            setErreur("Inpossible de joindre le serveur")
        }
    }
    return(
        <form className="formulaire" onSubmit={soumettre}>
            <h2>Connexion</h2>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <label htmlFor="mdp">Mot de passe</label>
            <input id="mdp" type="password" value={motDePasse} onChange={(e)=>setMotDePasse(e.target.value)} required />
            {erreur && <p className="erreur">{erreur}</p>}
            <button type="submit">Se connecter</button>
        </form>
    )
}