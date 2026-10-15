import { useAuth } from '../context/AuthContext'

function PageProfil() {
  const { utilisateur } = useAuth()

  return (
    <div className="detail">
      <h1>Mon compte</h1>
      <ul>
        <li>Identifiant : {utilisateur.sub}</li>
        <li>Numéro d'utilisateur : {utilisateur.id}</li>
        <li>Rôle : {utilisateur.role}</li>
      </ul>
    </div>
  )
}

export default PageProfil