import { useAuth } from '../context/AuthContext'

function PageProfil() {
  const { utilisateur } = useAuth()
  const initiales = utilisateur.sub.slice(0, 2).toUpperCase()

  return (
    <div className="profil">
      <div className="profil-entete">
        <span className="avatar avatar-grand">{initiales}</span>
        <h1>Mon compte</h1>
      </div>

      <dl className="profil-infos">
        <div>
          <dt>Identifiant</dt>
          <dd>{utilisateur.sub}</dd>
        </div>
        <div>
          <dt>Numéro d'utilisateur</dt>
          <dd>{utilisateur.id}</dd>
        </div>
        <div>
          <dt>Rôle</dt>
          <dd>{utilisateur.role}</dd>
        </div>
      </dl>
    </div>
  )
}

export default PageProfil