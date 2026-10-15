import { useNavigate } from 'react-router-dom'
import FormulaireLogement from '../components/FormulaireLogement'

function NouveauLogement() {
  const navigate = useNavigate()
  return <FormulaireLogement onSucces={() => navigate('/mes-logements')} />
}

export default NouveauLogement