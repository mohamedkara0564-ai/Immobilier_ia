import { useNavigate, Link } from 'react-router-dom'
import Inscription from '../components/Inscription'

export default function PageInscription() {
  const navigate = useNavigate()

  return (
    <div>
      <Inscription onInscription={() => {
        navigate('/connexion', { state: { info: 'Compte créé, vous pouvez vous connecter.' } })
      }} />

      <Link to="/connexion" className="lien">Déjà un compte ? Se connecter</Link>
    </div>
  )
}
