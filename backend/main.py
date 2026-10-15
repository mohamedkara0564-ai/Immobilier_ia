from fastapi import FastAPI, Depends, HTTPException
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
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def accueil():
    return{"massage": "API Immobilier IA en ligne"}

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

@app.get("/utilisateurs/moi")
def mon_profil(utilisateur_courant : dict= Depends(get_utilisateur_courant)):
    return utilisateur_courant

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

# @app.delete("/logements/{logement_id}")
# def supprimer_logement(
#     logement_id: int,
#     db: Session = Depends(get_db),
#     utilisateur_courant: dict = Depends(get_utilisateur_courant)
# ):
#     logement = db.query(models.Logement).filter(models.Logement.id == logement_id).first()
#     if not logement :
#         raise HTTPException(status_code=404, detail="Logement introvable")
#     if logement.id_proprietaire != utilisateur_courant["id"]:
#         raise HTTPException(status_code=403, detail="Vous n'être pas propiétaire de ce logement")
#     db.delete(logement)
#     db.commit()
#     return {"message": "Logement supprime avec succès"}
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
        raise HTTPException(status_code=403, detail="Vous n'êtes pas propriétaire de ce logement")

    a_des_locations = db.query(models.Location).filter(
        models.Location.id_logement == logement_id
    ).first()
    if a_des_locations:
        raise HTTPException(
            status_code=409,
            detail="Ce logement a un historique de locations : il ne peut pas être supprimé"
        )

    db.delete(logement)
    db.commit()
    return {"message": "Logement supprimé avec succès"}

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