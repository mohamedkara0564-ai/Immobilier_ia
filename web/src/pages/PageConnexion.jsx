import { useNavigate, useLocation, Link } from 'react-router-dom'
import Connexion from '../components/Connexion'
import { useAuth } from '../context/AuthContext'

function PageConnexion() {
  const navigate = useNavigate()
  const location = useLocation()
  const { connecter } = useAuth()

  return (
    <div>
      {location.state?.info && <p className="succes">{location.state.info}</p>}

      <Connexion onConnexion={(token) => {
        connecter(token)
        navigate('/')
      }} />

      <Link to="/inscription" className="lien">Pas de compte ? S'inscrire</Link>
    </div>
  )
}

export default PageConnexion