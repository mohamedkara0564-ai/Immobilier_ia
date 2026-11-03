import { useNavigate, Link } from 'react-router-dom'
import Inscription from '../components/Inscription'
import PageAuth from '../components/PageAuth'

export default function PageInscription() {
  const navigate = useNavigate()

  return (
    <PageAuth>
      <Inscription onInscription={() => {
        navigate('/connexion', { state: { info: 'Compte créé, vous pouvez vous connecter.' } })
      }} />

      <p className="auth-bascule">
        Déjà un compte ? <Link to="/connexion" className="lien">Se connecter</Link>
      </p>
    </PageAuth>
  )
}