from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import uuid
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import Base, engine, get_db
import models
import schemas
from typing import Optional
from security import hacher_mdp, verifier_mdp, creer_token_access, get_utilisateur_courant
import joblib
import pandas as pd

Base.metadata.create_all(bind= engine)

modele_prix = joblib.load("ml_model/modele_prix.joblib")
colonne_modele = joblib.load("ml_model/colonnes_modele.joblib")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dev : accepte toutes les origines (mobile inclus)
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

DOSSIER_UPLOADS = Path(__file__).resolve().parent / "uploads"
DOSSIER_UPLOADS.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=DOSSIER_UPLOADS), name="uploads")

TAILLE_MAX_PHOTO = 5 * 1024 * 1024  # 5 Mo
NB_MAX_PHOTOS = 10

def detecter_extension(contenu: bytes):
    if contenu.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if contenu.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if contenu[:4] == b"RIFF" and contenu[8:12] == b"WEBP":
        return ".webp"
    return None

def supprimer_fichier_photo(url: str):
    (DOSSIER_UPLOADS / Path(url).name).unlink(missing_ok=True)

@app.get("/")
def accueil():
    return{"message": "API Immobilier IA en ligne"}

@app.post("/utilisateurs/inscription", response_model= schemas.UtilisateurOut)
def inscrption(utilisateur: schemas.UtilisateurCreate, db:Session = Depends(get_db)):
    existant = db.query(models.Utilisateur).filter(models.Utilisateur.email == utilisateur.email).first()
    if existant:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    nouvelUser =  models.Utilisateur(
        nom = utilisateur.nom,
        prenom = utilisateur.prenom,
        email = utilisateur.email,
        mot_de_passe = hacher_mdp(utilisateur.mot_de_passe),
        telephone= utilisateur.telephone,
        role = utilisateur.role,
    )
    db.add(nouvelUser)
    db.commit()
    db.refresh(nouvelUser)
    return nouvelUser

@app.post("/utilisateurs/connexion",response_model= schemas.Token)
def connexion(identifiant: schemas.UtilisateurLogin, db:Session = Depends(get_db)):
    utilisateur = db.query(models.Utilisateur).filter(models.Utilisateur.email == identifiant.email).first()
    if not utilisateur or not verifier_mdp(identifiant.mot_de_passe, utilisateur.mot_de_passe):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrecte")

    token = creer_token_access(data={"sub": utilisateur.email, "id": utilisateur.id, "role": utilisateur.role})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/utilisateurs/moi", response_model=schemas.UtilisateurOut)
def mon_profil(utilisateur_courant: dict = Depends(get_utilisateur_courant), db: Session = Depends(get_db)):
    utilisateur = db.query(models.Utilisateur).filter(models.Utilisateur.id == utilisateur_courant["id"]).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return utilisateur

@app.post("/logements", response_model= schemas.LogementOut)
def creer_logement(
    logement: schemas.LogementCreate, 
    db: Session = Depends(get_db), 
    utilisateur_courant : dict = Depends(get_utilisateur_courant)
):
    if utilisateur_courant["role"] != "Proprietaire":
        raise HTTPException(status_code=403, detail="Seul un propriétaire peut publier un logement")

    nouveau_logement = models.Logement(
        id_proprietaire=utilisateur_courant["id"],
        titre=logement.titre,
        description=logement.description,
        type=logement.type,
        prix=logement.prix,
        surface=logement.surface,
        nb_chambres=logement.nb_chambres,
        nb_salons=logement.nb_salons,
        nb_salles_de_bains=logement.nb_salles_de_bains,
        ville=logement.ville,
        quartier=logement.quartier,
        adresse=logement.adresse,
    )
    db.add(nouveau_logement)
    db.commit()
    db.refresh(nouveau_logement)
    return nouveau_logement

@app.get("/logements", response_model= list[schemas.LogementOut])
def lister_logements(
    ville: Optional[str] = None,
    quartier: Optional[str] = None,
    prix_max: Optional[float] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    requete = db.query(models.Logement).filter(models.Logement.statut == "disponible")
    if ville:
        requete = requete.filter(models.Logement.ville.ilike(f"%{ville}%"))
    if quartier:
        requete = requete.filter(models.Logement.quartier.ilike(f"%{quartier}%"))
    if prix_max:
        requete = requete.filter(models.Logement.prix <= prix_max)
    if type:
        requete = requete.filter(models.Logement.type.ilike(type))
    return requete.all()

@app.get("/logements/mes_logements", response_model= list[schemas.LogementOut])
def mes_logements(db: Session = Depends(get_db), utilisateur_courant: dict = Depends(get_utilisateur_courant)):
    return db.query(models.Logement).filter(models.Logement.id_proprietaire
     == utilisateur_courant["id"]).all()

@app.get("/logements/{logement_id}", response_model=schemas.LogementOut)
def detail_logement(logement_id: int, db: Session = Depends(get_db)):
    logement = db.query(models.Logement).filter(models.Logement.id == logement_id).first()
    if not logement:
        raise HTTPException(status_code=404, detail="Logement introuvable")
    return logement

@app.put("/logements/{logement_id}", response_model= schemas.LogementOut)
def modifier_logement(
    logement_id: int, 
    logement_maj: schemas.LogementUpdate,
    db: Session = Depends(get_db),
    utilisateur_courant: dict= Depends(get_utilisateur_courant)
):
    logement = db.query(models.Logement).filter(models.Logement.id == logement_id).first()
    if not logement :
        raise HTTPException(status_code=404, detail="Logement introuvable")

    if logement.id_proprietaire != utilisateur_courant["id"]:
        raise HTTPException(status_code=403, detail="Vous n'être pas propriétaire de ce logement")
    
    donnees_maj = logement_maj.model_dump(exclude_unset=True)
    donnees_maj.pop("statut", None)
    for champ, valeur in donnees_maj.items():
        setattr(logement, champ, valeur)
    db.commit()
    db.refresh(logement)
    return logement

@app.delete("/logements/{logement_id}")
def supprimer_logement(
    logement_id: int,
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    logement = db.query(models.Logement).filter(models.Logement.id == logement_id).first()
    if not logement:
        raise HTTPException(status_code=404, detail="Logement introuvable")
    if logement.id_proprietaire != utilisateur_courant["id"]:
        raise HTTPException(status_code=403, detail="Vous n'êtres pas propriétaire de ce logement")

    a_des_locations = db.query(models.Location).filter(
        models.Location.id_logement == logement_id
    ).first()
    if a_des_locations:
        raise HTTPException(
            status_code=409,
            detail="Ce logement a un historique de locations : il ne peut pas être supprimé"
        )

    urls_photos = [photo.url for photo in logement.photos]
    db.delete(logement)
    db.commit()
    for url in urls_photos:
        supprimer_fichier_photo(url)

    return {"message": "Logement supprimé avec succès"}

@app.post("/logements/{logement_id}/photos", response_model=schemas.PhotoOut)
def ajouter_photo(
    logement_id: int,
    fichier: UploadFile = File(...),
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    logement = db.query(models.Logement).filter(models.Logement.id == logement_id).first()
    if not logement:
        raise HTTPException(status_code=404, detail="Logement introuvable")
    if logement.id_proprietaire != utilisateur_courant["id"]:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas propriétaire de ce logement")

    nb_photos = db.query(models.Photo).filter(models.Photo.id_logement == logement_id).count()
    if nb_photos >= NB_MAX_PHOTOS:
        raise HTTPException(status_code=400, detail=f"Maximum {NB_MAX_PHOTOS} photos par logement")

    contenu = fichier.file.read(TAILLE_MAX_PHOTO + 1)
    if len(contenu) > TAILLE_MAX_PHOTO:
        raise HTTPException(status_code=413, detail="Photo trop lourde (5 Mo maximum)")

    extension = detecter_extension(contenu)
    if extension is None:
        raise HTTPException(status_code=415, detail="Format non accepté (JPEG, PNG ou WebP uniquement)")

    nom_fichier = f"{uuid.uuid4().hex}{extension}"
    (DOSSIER_UPLOADS / nom_fichier).write_bytes(contenu)

    photo = models.Photo(id_logement=logement_id, url=f"/uploads/{nom_fichier}")
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo

@app.delete("/photos/{photo_id}")
def supprimer_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo introuvable")
    if photo.logement.id_proprietaire != utilisateur_courant["id"]:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas propriétaire de ce logement")

    url = photo.url
    db.delete(photo)
    db.commit()
    supprimer_fichier_photo(url)
    return {"message": "Photo supprimée avec succès"}

@app.post("/locations", response_model= schemas.LocationOut)
def creer_location(
    location: schemas.LocationCreate,
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    if utilisateur_courant["role"] != "Locataire":
        raise HTTPException(status_code=403, detail="Seul un locataire peut reserver un logement")

    logement = db.query(models.Logement).filter(models.Logement.id == location.id_logement).first()
    if not logement :
        raise HTTPException(status_code=404, detail="Logement introuvable")
    if logement.statut != "disponible" :
        raise HTTPException(status_code=400, detail="Ce logement n'est pas disponible")
    if location.date_fin <= location.date_debut :
        raise HTTPException(status_code=400, detail="La date de fin doit être après la date de début")
    nouvelle_location = models.Location(
        id_logement = logement.id,
        id_locataire = utilisateur_courant["id"],
        date_debut = location.date_debut,
        date_fin = location.date_fin,
        montant_loyer = logement.prix
    )
    db.add(nouvelle_location)
    logement.statut = "loué"
    db.commit()
    db.refresh(nouvelle_location)
    return nouvelle_location

@app.get("/locations/mes_locations", response_model= list[schemas.LocationOut])
def mes_locations(db: Session = Depends(get_db), utilisateur_courant: dict = Depends(get_utilisateur_courant)):
    return db.query(models.Location).filter(models.Location.id_locataire == utilisateur_courant["id"]).all()

@app.post("/logements/predire_prix", response_model=schemas.PredictionOut)
def pridire_prix(donnee: schemas.PredictionInput):
    df_entree = pd.DataFrame([donnee.model_dump()])
    df_encode = pd.get_dummies(df_entree, columns=["quartier", "type"])
    df_final = df_encode.reindex(columns=colonne_modele, fill_value=0)
    predict_prix = modele_prix.predict(df_final)[0]

    return {"prix_estime": round(float(predict_prix),2)}

# ─── Agent IA ────────────────────────────────────────────────────────────────

from datetime import date as date_today
import os as _os
from google import genai as google_genai
from google.genai import types as genai_types

# Initialisation Gemini
GEMINI_API_KEY = _os.getenv("GEMINI_API_KEY")
client_gemini = google_genai.Client(api_key=GEMINI_API_KEY)

def generer_contexte_locataire(utilisateur, location) -> str:
    """Construit le contexte personnalisé du locataire pour Gemini."""
    if not utilisateur:
        return ""

    contexte = f"""Tu es l'assistant IA de l'application ImmoIA, une plateforme de gestion locative.
Tu aides les locataires à gérer leur vie locative.
Réponds toujours en français, de façon concise et bienveillante.
N'invente jamais d'informations — base-toi uniquement sur les données ci-dessous.

=== INFORMATIONS DU LOCATAIRE ===
Prénom : {utilisateur.prenom}
Nom : {utilisateur.nom}
Email : {utilisateur.email}
Téléphone : {utilisateur.telephone or 'Non renseigné'}
"""

    if location:
        logement = location.logement
        contexte += f"""
=== LOCATION ACTIVE ===
Logement : {logement.titre if logement else 'Non renseigné'}
Type : {logement.type if logement else '---'}
Adresse : {logement.adresse or 'Non renseignée'}, {logement.ville if logement else ''}
Loyer mensuel : {int(location.montant_loyer):,} FCFA
Date de début : {location.date_debut.strftime('%d/%m/%Y')}
Date de fin : {location.date_fin.strftime('%d/%m/%Y')}
Statut : {location.statut}
"""
        if logement:
            contexte += f"""
=== DÉTAILS DU LOGEMENT ===
Surface : {logement.surface or 'Non renseignée'} m²
Chambres : {logement.nb_chambres or 'Non renseigné'}
Salles de bain : {logement.nb_salles_de_bains or 'Non renseigné'}
Description : {logement.description or 'Aucune description'}
"""
    else:
        contexte += "\n=== PAS DE LOCATION ACTIVE ===\nLe locataire n'a pas de logement loué actuellement.\n"

    contexte += """
=== FONCTIONNALITÉS DE L'APPLICATION ===
- Onglet "Mon Logement" : voir les détails du logement et le contrat
- Onglet "Paiement" : payer le loyer et voir l'historique
- Onglet "Mes demandes" : signaler un problème ou faire une demande
- Onglet "Notifications" : voir les alertes et rappels
- Onglet "Profil" : modifier ses informations personnelles

Réponds de façon claire, courte et utile. Si tu ne sais pas, dis-le honnêtement.
"""
    return contexte

async def generer_reponse_ia(message: str, utilisateur, location) -> str:
    """Génère une réponse via Gemini avec fallback sur plusieurs modèles."""
    contexte = generer_contexte_locataire(utilisateur, location)
    prompt = f"{contexte}\n\n=== MESSAGE DU LOCATAIRE ===\n{message}"
    
    modeles = [
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
    ]
    
    for modele in modeles:
        try:
            response = await client_gemini.aio.models.generate_content(
                model=modele,
                contents=prompt
            )
            print(f"Gemini OK avec {modele}")
            return response.text
        except Exception as e:
            print(f"Gemini erreur {modele}: {e}")
            continue
    
    # Tous les modèles ont échoué → fallback local
    prenom = utilisateur.prenom if utilisateur else "locataire"
    if location:
        loyer = f"{int(location.montant_loyer):,} FCFA".replace(",", " ")
        date_fin = location.date_fin.strftime("%d/%m/%Y")
        msg = message.lower()
        if any(w in msg for w in ["loyer", "payer", "paiement", "montant"]):
            return f"Votre prochain loyer est de {loyer}, prévu le {date_fin}."
        if any(w in msg for w in ["contrat", "bail", "début", "fin"]):
            return f"Votre contrat va du {location.date_debut.strftime('%d/%m/%Y')} au {date_fin}, pour {loyer}/mois."
    return f"Je suis temporairement indisponible, {prenom}. Réessayez dans quelques instants. 🙏"

@app.get("/conversations", response_model=list[schemas.ConversationOut])
def mes_conversations(
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    return db.query(models.Conversation).filter(
        models.Conversation.id_locataire == utilisateur_courant["id"]
    ).all()

@app.post("/conversations", response_model=schemas.ConversationOut)
def creer_conversation(
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    conv = models.Conversation(
        id_locataire=utilisateur_courant["id"],
        titre="Nouvelle conversation",
        date_creation=date_today.today()
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv

@app.post("/conversations/{conv_id}/messages", response_model=schemas.MessageIAOut)
async def envoyer_message(
    conv_id: int,
    message: schemas.MessageIACreate,
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    from datetime import datetime

    conv = db.query(models.Conversation).filter(
        models.Conversation.id == conv_id,
        models.Conversation.id_locataire == utilisateur_courant["id"]
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation introuvable")

    maintenant = datetime.now().strftime("%H:%M")

    # Sauvegarder le message utilisateur
    msg_user = models.MessageIA(
        id_conversation=conv_id,
        role="utilisateur",
        contenu=message.contenu,
        horodatage=maintenant
    )
    db.add(msg_user)

    # Récupérer les infos du locataire
    utilisateur = db.query(models.Utilisateur).filter(
        models.Utilisateur.id == utilisateur_courant["id"]
    ).first()
    location = db.query(models.Location).filter(
        models.Location.id_locataire == utilisateur_courant["id"],
        models.Location.statut == "active"
    ).first()

    # Générer et sauvegarder la réponse IA
    reponse = await generer_reponse_ia(message.contenu, utilisateur, location)
    msg_ia = models.MessageIA(
        id_conversation=conv_id,
        role="ia",
        contenu=reponse,
        horodatage=maintenant
    )
    db.add(msg_ia)
    db.commit()
    db.refresh(msg_ia)
    return msg_ia

@app.get("/conversations/{conv_id}/messages", response_model=list[schemas.MessageIAOut])
def historique_messages(
    conv_id: int,
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    conv = db.query(models.Conversation).filter(
        models.Conversation.id == conv_id,
        models.Conversation.id_locataire == utilisateur_courant["id"]
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation introuvable")
    return db.query(models.MessageIA).filter(
        models.MessageIA.id_conversation == conv_id
    ).all()

# ─── Paiements ───────────────────────────────────────────────────────────────

import uuid as uuid_module

@app.get("/paiements/mes_paiements", response_model=list[schemas.PaiementOut])
def mes_paiements(
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    return db.query(models.Paiement).filter(
        models.Paiement.id_locataire == utilisateur_courant["id"]
    ).order_by(models.Paiement.date_paiement.desc()).all()

@app.post("/paiements", response_model=schemas.PaiementOut)
def effectuer_paiement(
    paiement: schemas.PaiementCreate,
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    from datetime import date as date_obj

    location = db.query(models.Location).filter(
        models.Location.id == paiement.id_location,
        models.Location.id_locataire == utilisateur_courant["id"]
    ).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location introuvable")

    reference = f"PAY-{uuid_module.uuid4().hex[:8].upper()}"

    nouveau_paiement = models.Paiement(
        id_location=paiement.id_location,
        id_locataire=utilisateur_courant["id"],
        montant=paiement.montant,
        moyen_paiement=paiement.moyen_paiement,
        statut="payé",
        date_paiement=date_obj.today(),
        reference=reference,
        mois_concerne=paiement.mois_concerne,
    )
    db.add(nouveau_paiement)
    db.commit()
    db.refresh(nouveau_paiement)
    return nouveau_paiement

# ─── Demandes d'assistance ───────────────────────────────────────────────────

@app.get("/demandes/mes_demandes", response_model=list[schemas.DemandeOut])
def mes_demandes(
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    return db.query(models.Demande).filter(
        models.Demande.id_locataire == utilisateur_courant["id"]
    ).order_by(models.Demande.date_creation.desc()).all()

@app.post("/demandes", response_model=schemas.DemandeOut)
def creer_demande(
    demande: schemas.DemandeCreate,
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    from datetime import date as date_obj

    nouvelle_demande = models.Demande(
        id_locataire=utilisateur_courant["id"],
        id_logement=demande.id_logement,
        titre=demande.titre,
        description=demande.description,
        type_demande=demande.type_demande,
        statut="Nouvelle",
        date_creation=date_obj.today(),
    )
    db.add(nouvelle_demande)
    db.commit()
    db.refresh(nouvelle_demande)
    return nouvelle_demande

@app.put("/demandes/{demande_id}/statut", response_model=schemas.DemandeOut)
def mettre_a_jour_statut(
    demande_id: int,
    statut: str,
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    from datetime import date as date_obj

    demande = db.query(models.Demande).filter(
        models.Demande.id == demande_id,
        models.Demande.id_locataire == utilisateur_courant["id"]
    ).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande introuvable")

    statuts_valides = ["Nouvelle", "En cours", "Résolue", "Clôturée"]
    if statut not in statuts_valides:
        raise HTTPException(status_code=400, detail=f"Statut invalide. Valeurs: {statuts_valides}")

    demande.statut = statut
    demande.date_mise_a_jour = date_obj.today()
    db.commit()
    db.refresh(demande)
    return demande
