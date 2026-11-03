import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import FormulaireReservation from '../components/FormulaireReservation'
import Chargement from '../components/Chargement'
import { IconePin, IconeSurface, IconeLit, IconeSalon, IconeBain } from '../components/Icones'
import { API, urlPhoto } from '../config'

function pluriel(nombre, mot) {
  return `${nombre} ${mot}${nombre > 1 ? 's' : ''}`
}

function numeroInternational(telephone) {
  const chiffres = telephone.replace(/\D/g, '')
  return chiffres.startsWith('225') ? chiffres : `225${chiffres}`
}

export default function DetailLogement() {
  const { id } = useParams()
  const [logement, setLogement] = useState(null)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)
  const [photoActive, setPhotoActive] = useState(0)

  useEffect(() => {
    async function charger() {
      setPhotoActive(0)
      try {
        const reponse = await fetch(`${API}/logements/${id}`)
        if (!reponse.ok) {
          setErreur(reponse.status === 404 ? 'Logement introuvable' : 'Erreur du serveur')
          return
        }
        setLogement(await reponse.json())
      } catch {
        setErreur('Impossible de joindre le serveur')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [id])

  if (chargement) return <Chargement />

  if (erreur) {
    return (
      <div>
        <p className="erreur">{erreur}</p>
        <Link to="/" className="lien">Retour aux logements</Link>
      </div>
    )
  }

  const lieu = [logement.quartier, logement.ville].filter(Boolean).join(', ')
  const proprietaire = logement.proprietaire
  const telephone = proprietaire?.telephone
  const initiales = proprietaire
    ? `${proprietaire.prenom[0]}${proprietaire.nom[0]}`.toUpperCase()
    : ''

  const caracteristiques = [
    { Icone: IconeSurface, valeur: logement.surface, texte: `${logement.surface} m²` },
    { Icone: IconeLit, valeur: logement.nb_chambres, texte: pluriel(logement.nb_chambres, 'chambre') },
    { Icone: IconeSalon, valeur: logement.nb_salons, texte: pluriel(logement.nb_salons, 'salon') },
    { Icone: IconeBain, valeur: logement.nb_salles_de_bains, texte: `${pluriel(logement.nb_salles_de_bains, 'salle')} de bains` },
  ].filter(c => c.valeur != null)

  return (
    <div className="detail">
      <Link to="/" className="lien">← Retour aux logements</Link>

      <div className="detail-entete">
        <h1>{logement.titre}</h1>
        <span className={logement.statut === 'disponible' ? 'badge' : 'badge badge-loue'}>
          {logement.statut}
        </span>
      </div>
      <p className="detail-lieu">
        <IconePin /> {lieu} · <span>{logement.type}</span>
      </p>

      <div className="detail-grille">
        <div className="detail-principal">
          {logement.photos.length > 0 ? (
            <div className="galerie">
              <img
                className="galerie-principale"
                src={urlPhoto(logement.photos[photoActive].url)}
                alt={`${logement.titre}, photo ${photoActive + 1}`}
              />
              {logement.photos.length > 1 && (
                <div className="galerie-miniatures">
                  {logement.photos.map((photo, index) => (
                    <button
                      type="button"
                      key={photo.id}
                      className={index === photoActive ? 'miniature miniature-active' : 'miniature'}
                      onClick={() => setPhotoActive(index)}
                      aria-label={`Voir la photo ${index + 1}`}
                    >
                      <img src={urlPhoto(photo.url)} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="galerie-vide">Aucune photo pour ce logement</div>
          )}

          {caracteristiques.length > 0 && (
            <ul className="caracteristiques">
              {caracteristiques.map(({ Icone, texte }) => (
                <li key={texte}><Icone /> {texte}</li>
              ))}
            </ul>
          )}

          {logement.description && (
            <section className="detail-section">
              <h2>Description</h2>
              <p>{logement.description}</p>
            </section>
          )}

          {logement.adresse && (
            <section className="detail-section">
              <h2>Adresse</h2>
              <p>{logement.adresse}</p>
            </section>
          )}
        </div>

                <aside className="detail-lateral">
          <div className="carte-reservation">
            <div className="carte-reservation-prix">
              <p className="prix">
                {logement.prix.toLocaleString('fr-FR')} FCFA <span>/ mois</span>
              </p>
            </div>
            <FormulaireReservation
              logement={logement}
              onReservation={() => setLogement({ ...logement, statut: 'loué' })}
            />
          </div>

          {proprietaire && (
            <div className="carte-proprietaire">
              <div className="proprietaire-identite">
                <span className="avatar avatar-grand">{initiales}</span>
                <div>
                  <p className="proprietaire-nom">{proprietaire.prenom} {proprietaire.nom}</p>
                  <p className="proprietaire-role">Propriétaire</p>
                </div>
              </div>

              {telephone && (
                <>
                  <a className="bouton-lien" href={`tel:${telephone}`}>Appeler {telephone}</a>
                  <a className="bouton-secondaire"
                    href={`https://wa.me/${numeroInternational(telephone)}`}
                    target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}