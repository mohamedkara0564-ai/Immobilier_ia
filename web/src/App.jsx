import { Routes, Route, Link, NavLink } from 'react-router-dom'
import Accueil from './pages/Accueil'
import DetailLogement from './pages/DetailLogement'
import PageConnexion from './pages/PageConnexion'
import PageInscription from './pages/PageInscription'
import PageProfil from './pages/PageProfil'
import RouteProtegee from './components/RouteProtegee'
import MesLocations from './pages/MesLocations'
import { useAuth } from './context/AuthContext'
import MesLogements from './pages/MesLogements'
import NouveauLogement from './pages/NouveauLogement'
import ModifierLogement from './pages/ModifierLogement'

export default function App() {
  const { utilisateur, deconnecter } = useAuth()

  // Initiales de l'avatar : les 2 premières lettres de l'email (le token ne contient pas le nom)
  const initiales = utilisateur ? utilisateur.sub.slice(0, 2).toUpperCase() : ''

  return (
    <>
      <header className="navbar">
        <div className="navbar-interieur">
          <Link to="/" className="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
              <path d="M10 21v-6h4v6" />
            </svg>
            ImmoIA
          </Link>

          <nav className="nav-liens">
            <NavLink to="/" end>Accueil</NavLink>
            {utilisateur?.role === 'Locataire' && (
              <NavLink to="/mes-locations">Mes locations</NavLink>
            )}
            {utilisateur?.role === 'Proprietaire' && (
              <NavLink to="/mes-logements">Mes logements</NavLink>
            )}
          </nav>

          <div className="nav-actions">
            {utilisateur ? (
              <>
                <span className="badge">{utilisateur.role}</span>
                <Link to="/profil" className="avatar" aria-label="Mon compte" title={utilisateur.sub}>
                  {initiales}
                </Link>
                <button className="lien" onClick={deconnecter}>Se déconnecter</button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="bouton-secondaire">Se connecter</Link>
                <Link to="/inscription" className="bouton-lien">S'inscrire</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="conteneur">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/logements/:id" element={<DetailLogement />} />
          <Route path="/connexion" element={<PageConnexion />} />
          <Route path="/inscription" element={<PageInscription />} />
          <Route path="/profil" element={
            <RouteProtegee>
              <PageProfil />
            </RouteProtegee>
          } />
          <Route path="/mes-locations" element={
            <RouteProtegee role="Locataire">
              <MesLocations />
            </RouteProtegee>
          } />
          <Route path="/mes-logements" element={
            <RouteProtegee role="Proprietaire">
              <MesLogements />
            </RouteProtegee>
          } />
          <Route path="/mes-logements/nouveau" element={
            <RouteProtegee role="Proprietaire">
              <NouveauLogement />
            </RouteProtegee>
          } />
          <Route path="/mes-logements/:id/modifier" element={
            <RouteProtegee role="Proprietaire">
              <ModifierLogement />
            </RouteProtegee>
          } />
          <Route path="*" element={<p>Page introuvable</p>} />
        </Routes>
      </main>
    </>
  )
}