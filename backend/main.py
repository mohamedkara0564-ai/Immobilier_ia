from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import Base, engine, get_db
import models
import schemas
from typing import Optional
from security import hacher_mdp, verifier_mdp, creer_token_access, get_utilisateur_courant

Base.metadata.create_all(bind= engine) 

app = FastAPI()
@app.get("/")
def accueil():
    return{"massage": "API Immobilier IA en ligne"}

@app.post("/utilisateur/inscription", response_model= schemas.UtilisateurOut)
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

@app.post("/utilisateur/connexion",response_model= schemas.Token)
def connexion(identifiant: schemas.UtilisateurLogin, db:Session = Depends(get_db)):
    utilisateur = db.query(models.Utilisateur).filter(models.Utilisateur.email == identifiant.email).first()
    if not utilisateur or not verifier_mdp(identifiant.mot_de_passe, utilisateur.mot_de_passe):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrecte")

    token = creer_token_access(data={"sub": utilisateur.email, "id": utilisateur.id, "role": utilisateur.role})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/utilisateur/moi")
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
        adresse=logement.adresse,
    )
    db.add(nouveau_logement)
    db.commit()
    db.refresh(nouveau_logement)
    return nouveau_logement

@app.get("/logements", response_model= list[schemas.LogementOut])
def lister_logements(
    ville: Optional[str] = None,
    prix_max: Optional[float] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    requete = db.query(models.Logement).filter(models.Logement.statut == "disponible")
    if ville:
        requete = requete.filter(models.Logement.ville.ilike(f"%{ville}%"))
    if prix_max:
        requete = requete.filter(models.Logement.prix <= prix_max)
    if type:
        requete = requete.filter(models.Logement.type == type)
    return requete.all()

@app.get("/logement/{logement_id}", response_model=schemas.LogementOut)
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
    for champ, valeur in donnees_maj.items():
        setattr(logement, champ, valeur)
    db.commit()
    db.refresh(logement)
    return logement

@app.delete("/logement/{logement_id}")
def supprimer_logement(
    logement_id: int,
    db: Session = Depends(get_db),
    utilisateur_courant: dict = Depends(get_utilisateur_courant)
):
    logement = db.query(models.Logement).filter(models.Logement.id == logement_id).first()
    if not logement :
        raise HTTPException(status_code=404, detail="Logement introvable")
    if logement.id_proprietaire != utilisateur_courant["id"]:
        raise HTTPException(status_code=403, detail="Vous n'être pas propiétaire de ce logement")
    db.delete(logement)
    db.commit()
    return {"message": "Logement supprime avec succès"}

@app.post("/location", response_model= schemas.LocationOut)
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
        raise HTTPException(status_code=400, detail="La date de fin doit être après al date de début")
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