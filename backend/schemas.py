from pydantic import BaseModel, EmailStr
from datetime import date

class UtilisateurCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    mot_de_passe: str
    telephone: str
    role: str

class UtilisateurOut(BaseModel):
    id: int
    nom: str
    prenom: str
    email: EmailStr
    telephone: str | None
    role: str

    class Config:
        from_attributes = True


class UtilisateurLogin(BaseModel):
    email: EmailStr
    mot_de_passe : str

class Token(BaseModel):
    access_token : str
    token_type: str

class PhotoOut(BaseModel):
    id: int
    id_logement: int
    url: str

    class Config:
        from_attributes = True

class LogementCreate(BaseModel):
    titre: str
    description: str | None = None
    type: str
    prix: float
    surface: float | None = None
    nb_chambres: int | None = None
    nb_salons: int | None = None
    nb_salles_de_bains: int | None = None
    ville: str
    quartier: str | None = None
    adresse: str | None = None

class LogementOut(BaseModel):
    id: int
    id_proprietaire: int
    titre: str
    description: str | None
    type: str
    prix: float
    surface: float | None
    nb_chambres: int | None
    nb_salons: int | None
    nb_salles_de_bains: int | None
    ville: str
    quartier: str | None
    adresse: str | None
    statut: str
    photos: list[PhotoOut] = []

    class Config:
        from_attributes = True

class LogementUpdate(BaseModel):
    titre: str | None = None
    description: str | None = None
    type: str | None = None
    prix: float | None = None
    surface: float | None = None
    nb_chambres: int | None = None
    nb_salons: int | None = None
    nb_salles_de_bains: int | None = None
    ville: str | None = None
    quartier : str | None = None
    adresse: str | None = None
    statut: str | None = None

class LocationCreate(BaseModel):
    id_logement:int
    date_debut: date
    date_fin: date

class LocationOut(BaseModel):
    id: int
    id_logement: int
    id_locataire: int
    date_debut: date
    date_fin: date
    montant_loyer: float
    statut: str

    class Config:
        from_attributes = True

class PredictionInput(BaseModel):
    quartier: str
    type: str
    surface: float
    nb_chambres: int
    nb_salons: int
    nb_salles_de_bains: int

class PredictionOut(BaseModel):
    prix_estime: float