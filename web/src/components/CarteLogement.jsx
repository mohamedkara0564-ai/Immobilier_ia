import { Link } from 'react-router-dom'
import { urlPhoto } from '../config'

export default function CarteLogement({ logement }) {
    const premierePhoto = logement.photos?.[0]

    return (
        <Link to={`/logements/${logement.id}`} className="carte">
            {premierePhoto ? (
                <img
                    className="carte-photo"
                    src={urlPhoto(premierePhoto.url)}
                    alt={logement.titre}
                    loading="lazy"
                />
            ) : (
                <div className="carte-photo carte-photo-vide">Pas de photo</div>
            )}
            <h3>{logement.titre}</h3>
            <p>{logement.type} à {logement.quartier}, {logement.ville}</p>
            <p>{logement.surface} m²</p>
            <p>{logement.prix.toLocaleString('fr-FR')} FCFA/mois</p>
        </Link>
    )
}