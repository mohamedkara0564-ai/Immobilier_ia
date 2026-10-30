import { useNavigate } from 'react-router-dom'
import FormulaireLogement from '../components/FormulaireLogement'

function NouveauLogement() {
  const navigate = useNavigate()

  function apresCreation(idLogement, nbEchecs) {
    if (nbEchecs > 0) {
      navigate(`/mes-logements/${idLogement}/modifier`, {
        state: { avertissement: `Logement publié, mais ${nbEchecs} photo(s) n'ont pas pu être envoyées. Vous pouvez réessayer ci-dessous.` }
      })
    } else {
      navigate('/mes-logements')
    }
  }

  return <FormulaireLogement onSucces={apresCreation} />
}

export default NouveauLogement