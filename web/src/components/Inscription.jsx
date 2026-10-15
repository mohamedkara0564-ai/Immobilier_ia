import { useState } from "react";

export default function Inscription({onInscription}){
    const [nom, setNom] = useState('')
    const [prenom, setPrenom] = useState('')
    const [email, setEmail] = useState('')
    const [telephone, setTelephone] = useState('')
    const [motDePasse, setMotDePasse] = useState('')
    const [role, setRole] = useState('Locataire')
    const [erreur, setErreur] = useState('')

    async function soumettre(e) {
        e.preventDefault()
        setErreur('')

        try{
            const reponse = await fetch(`${API}/utilisateurs/inscription`,{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    nom,
                    prenom,
                    email,
                    telephone,
                    mot_de_passe: motDePasse,
                    role
                })
            })
            const data = reponse.json()
            if (!reponse.ok){
                setErreur(typeof data.detail === 'string' ? data.detail: 'Données invalides')
                return
            }
            onInscription()
        }catch{
            setErreur('Impossible de joindre le serveur')
        }
    }
    return(
        <form className="formulaire" onSubmit={soumettre}>
            <h2>Inscription</h2>
            <label htmlFor="nom">Nom</label>
            <input id="nom" value={nom} onChange={(e)=>setNom(e.target.value)} required />
            
            <label htmlFor="prenom">Prénom</label>
            <input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />

            <label htmlFor="email-ins">Email</label>
            <input id="email-ins" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label htmlFor="tel">Téléphone</label>
            <input id="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} required />

            <label htmlFor="mdp-ins">Mot de passe</label>
            <input id="mdp-ins" type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />

            <label htmlFor="role">Je suis</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Locataire">Locataire</option>
                <option value="Proprietaire">Propriétaire</option>
            </select>

            {erreur && <p className="erreur">{erreur}</p>}

            <button type="submit">Créer mon compte</button>
        </form>
  )
}