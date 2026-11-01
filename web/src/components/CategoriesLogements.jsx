import { IconeTous, IconeAppartement, IconeMaison, IconeVilla, IconeStudio } from './Icones'

const CATEGORIES = [
  { valeur: '', libelle: 'Tous', Icone: IconeTous },
  { valeur: 'appartement', libelle: 'Appartement', Icone: IconeAppartement },
  { valeur: 'maison', libelle: 'Maison', Icone: IconeMaison },
  { valeur: 'villa', libelle: 'Villa', Icone: IconeVilla },
  { valeur: 'studio', libelle: 'Studio', Icone: IconeStudio },
]

export default function CategoriesLogements({ type, onChoisir }) {
  return (
    <div className="categories" role="group" aria-label="Type de logement">
      {CATEGORIES.map(({ valeur, libelle, Icone }) => (
        <button
          key={libelle}
          type="button"
          className="categorie"
          aria-pressed={type === valeur}
          onClick={() => onChoisir(valeur)}
        >
          <Icone />
          {libelle}
        </button>
      ))}
    </div>
  )
}