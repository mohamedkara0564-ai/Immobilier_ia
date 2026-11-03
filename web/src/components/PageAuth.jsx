import { IconeMaison } from './Icones'

export default function PageAuth({ children }) {
  return (
    <div className="auth">
      <div className="auth-panneau">
        <div className="auth-logo"><IconeMaison /> ImmoIA</div>
        <h1>Bienvenue sur ImmoIA</h1>
        <p>Trouvez, estimez et réservez votre logement à Abidjan.</p>
        <ul className="auth-avantages">
          <li>Estimation de loyer par intelligence artificielle</li>
          <li>Recherche par quartier, type et budget</li>
          <li>Réservation en ligne en quelques clics</li>
        </ul>
      </div>
      <div className="auth-contenu">{children}</div>
    </div>
  )
}