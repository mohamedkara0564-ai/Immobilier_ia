import { Link } from 'react-router-dom'

export default function CarteLogement({logement}){
    return(
        <Link to={`/logements/${logement.id}`} className="carte">
            <h3>{logement.titre}</h3>
            <p>{logement.type} à {logement.quartier}, {logement.ville}</p>
            <p>{logement.surface} m²</p>
            <p>{logement.prix.toLocaleString('fr-FR')} FCFA/mois</p>
        </Link>
    )
}