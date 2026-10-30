import { Routes, Route, Link } from 'react-router-dom'
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

  return (
    <div className="conteneur">
      <nav className="navbar">
        <Link to="/" className="logo">ImmoIA</Link>
        <div className="nav-liens">
          {utilisateur ? (
            <>
              {utilisateur.role === 'Locataire' && (
                <Link to="/mes-locations">Mes locations</Link>
              )}
              {utilisateur.role === 'Proprietaire' && (
                <Link to="/mes-logements">Mes logements</Link>
              )}
              <Link to="/profil">Mon compte</Link>
              <span className="badge">{utilisateur.role}</span>
              <button className="lien" onClick={deconnecter}>Se déconnecter</button>
            </>
          ) : (
            <>
              <Link to="/connexion">Connexion</Link>
              <Link to="/inscription">Inscription</Link>
            </>
          )}
        </div>
      </nav>

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
    </div>
  )
}