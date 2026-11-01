import { Link } from 'react-router-dom'
import { urlPhoto } from '../config'
import { IconeMaison, IconePin, IconeLit, IconeBain, IconeSurface } from './Icones'

export default function CarteLogement({ logement }) {
  const premierePhoto = logement.photos?.[0]
  const lieu = [logement.quartier, logement.ville].filter(Boolean).join(', ')

  return (
    <Link to={`/logements/${logement.id}`} className="carte-logement">
      <div className={premierePhoto ? 'carte-image' : 'carte-image carte-image-vide'}>
        {premierePhoto ? (
          <img src={urlPhoto(premierePhoto.url)} alt={logement.titre} loading="lazy" />
        ) : (
          <IconeMaison />
        )}
        <span className="carte-type">{logement.type}</span>
      </div>

      <div className="carte-corps">
        <p className="carte-prix">
          {logement.prix.toLocaleString('fr-FR')} FCFA <span>/ mois</span>
        </p>
        <h3 className="carte-titre">{logement.titre}</h3>
        <p className="carte-lieu"><IconePin /> {lieu}</p>

        <ul className="carte-caracs">
          {logement.nb_chambres != null && (
            <li><IconeLit /> {logement.nb_chambres} ch.</li>
          )}
          {logement.nb_salles_de_bains != null && (
            <li><IconeBain /> {logement.nb_salles_de_bains} sdb</li>
          )}
          {logement.surface != null && (
            <li><IconeSurface /> {logement.surface} m²</li>
          )}
        </ul>
      </div>
    </Link>
  )
}