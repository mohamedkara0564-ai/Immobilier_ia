import { useNavigate, useLocation, Link } from 'react-router-dom'
import Connexion from '../components/Connexion'
import PageAuth from '../components/PageAuth'
import { useAuth } from '../context/AuthContext'

function PageConnexion() {
  const navigate = useNavigate()
  const location = useLocation()
  const { connecter } = useAuth()

  return (
    <PageAuth>
      {location.state?.info && <p className="succes">{location.state.info}</p>}

      <Connexion onConnexion={(token) => {
        connecter(token)
        navigate('/')
      }} />

      <p className="auth-bascule">
        Pas de compte ? <Link to="/inscription" className="lien">S'inscrire</Link>
      </p>
    </PageAuth>
  )
}

export default PageConnexion