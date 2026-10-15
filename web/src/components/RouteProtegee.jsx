import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RouteProtegee({ children, role }) {
  const { utilisateur } = useAuth()

  if (!utilisateur) return <Navigate to="/connexion" replace />

  if (role && utilisateur.role !== role) {
    return <p className="erreur">Accès refusé : cette page est réservée aux {role}s.</p>
  }

  return children
}

export default RouteProtegee