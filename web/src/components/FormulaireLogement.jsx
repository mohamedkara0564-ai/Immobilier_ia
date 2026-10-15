import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { QUARTIERS, TYPES } from '../constantes'
import { API } from '../config'

const CHAMPS_ESTIMATION = ['type', 'quartier', 'surface', 'nb_chambres', 'nb_salons', 'nb_salles_de_bains']

function Champ({ label, name, valeur, onChange, ...autres }) {
  return (
    <div className="champ">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} value={valeur} onChange={onChange} {...autres} />
    </div>
  )
}

function valeursDepart(logement) {
  if (!logement) {
    return {
      titre: '', description: '', type: TYPES[0], quartier: 'Cocody', ville: 'Abidjan',
      adresse: '', surface: '', nb_chambres: '', nb_salons: '', nb_salles_de_bains: '', prix: ''
    }
  }
  return {
    titre: logement.titre,
    description: logement.description ?? '',
    type: TYPES.includes(logement.type) ? logement.type : TYPES[0],
    quartier: QUARTIERS.includes(logement.quartier) ? logement.quartier : QUARTIERS[0],
    ville: logement.ville,
    adresse: logement.adresse ?? '',
    surface: logement.surface,
    nb_chambres: logement.nb_chambres ?? '',
    nb_salons: logement.nb_salons ?? '',
    nb_salles_de_bains: logement.nb_salles_de_bains ?? '',
    prix: logement.prix
  }
}

function FormulaireLogement({ logement, onSucces }) {
  const { token, deconnecter } = useAuth()
  const modification = Boolean(logement)

  const [form, setForm] = useState(() => valeursDepart(logement))
  const [estimation, setEstimation] = useState(null)
  const [estimationEnCours, setEstimationEnCours] = useState(false)
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  function modifier(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (CHAMPS_ESTIMATION.includes(name)) setEstimation(null)
  }

  const pretPourEstimer = ['surface', 'nb_chambres', 'nb_salons', 'nb_salles_de_bains']
    .every(champ => form[champ] !== '')

  function messageErreur(data, defaut) {
    return typeof data.detail === 'string' ? data.detail : defaut
  }

  async function estimer() {
    setErreur('')
    setEstimation(null)
    setEstimationEnCours(true)
    try {
      const reponse = await fetch(`${API}/logements/predire_prix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quartier: form.quartier,
          type: form.type,
          surface: Number(form.surface),
          nb_chambres: Number(form.nb_chambres),
          nb_salons: Number(form.nb_salons),
          nb_salles_de_bains: Number(form.nb_salles_de_bains)
        })
      })
      const data = await reponse.json()
      if (!reponse.ok) {
        setErreur(messageErreur(data, "L'estimation a échoué"))
        return
      }
      setEstimation(data.prix_estime)
    } catch {
      setErreur('Impossible de joindre le serveur')
    } finally {
      setEstimationEnCours(false)
    }
  }

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    setEnvoi(true)
    try {
      const url = modification ? `${API}/logements/${logement.id}` : `${API}/logements`
      const reponse = await fetch(url, {
        method: modification ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titre: form.titre,
          description: form.description,
          type: form.type,
          prix: Number(form.prix),
          surface: Number(form.surface),
          nb_chambres: Number(form.nb_chambres),
          nb_salons: Number(form.nb_salons),
          nb_salles_de_bains: Number(form.nb_salles_de_bains),
          ville: form.ville,
          quartier: form.quartier,
          adresse: form.adresse
        })
      })

      if (reponse.status === 401) {
        deconnecter()
        return
      }

      const data = await reponse.json()
      if (!reponse.ok) {
        setErreur(messageErreur(data, 'Données invalides'))
        return
      }

      onSucces()
    } catch {
      setErreur('Impossible de joindre le serveur')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form className="formulaire formulaire-large" onSubmit={soumettre}>
      <h2>{modification ? 'Modifier le logement' : 'Publier un logement'}</h2>

      <Champ label="Titre" name="titre" valeur={form.titre} onChange={modifier} required />

      <div className="champ">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows="3"
          value={form.description} onChange={modifier} required />
      </div>

      <div className="grille-formulaire">
        <div className="champ">
          <label htmlFor="type">Type</label>
          <select id="type" name="type" value={form.type} onChange={modifier}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="champ">
          <label htmlFor="quartier">Quartier</label>
          <select id="quartier" name="quartier" value={form.quartier} onChange={modifier}>
            {QUARTIERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>

        <Champ label="Ville" name="ville" valeur={form.ville} onChange={modifier} required />
        <Champ label="Adresse" name="adresse" valeur={form.adresse} onChange={modifier} required />
        <Champ label="Surface (m²)" name="surface" type="number" min="1"
          valeur={form.surface} onChange={modifier} required />
        <Champ label="Chambres" name="nb_chambres" type="number" min="0"
          valeur={form.nb_chambres} onChange={modifier} required />
        <Champ label="Salons" name="nb_salons" type="number" min="0"
          valeur={form.nb_salons} onChange={modifier} required />
        <Champ label="Salles de bains" name="nb_salles_de_bains" type="number" min="0"
          valeur={form.nb_salles_de_bains} onChange={modifier} required />
      </div>

      <div className="estimation">
        <button type="button" className="bouton-secondaire"
          onClick={estimer} disabled={!pretPourEstimer || estimationEnCours}>
          {estimationEnCours ? 'Calcul...' : "Estimer le loyer avec l'IA"}
        </button>

        {estimation !== null && (
          <p>
            Loyer suggéré : <strong>{estimation.toLocaleString('fr-FR')} FCFA / mois</strong>{' '}
            <button type="button" className="lien"
              onClick={() => setForm({ ...form, prix: Math.round(estimation) })}>
              Utiliser ce prix
            </button>
          </p>
        )}
        <small>Estimation indicative, calculée par un modèle entraîné sur des données simulées.</small>
      </div>

      <Champ label="Loyer mensuel (FCFA)" name="prix" type="number" min="1"
        valeur={form.prix} onChange={modifier} required />

      {erreur && <p className="erreur">{erreur}</p>}

      <button type="submit" disabled={envoi}>
        {envoi
          ? 'Envoi...'
          : modification ? 'Enregistrer les modifications' : 'Publier le logement'}
      </button>
    </form>
  )
}

export default FormulaireLogement