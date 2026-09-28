from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key= True, index= True)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    email = Column(String, unique= True, nullable= False)
    telephone = Column(String)
    mot_de_passe = Column(String, nullable=False)
    role = Column(String, nullable=False)

class Logement(Base):
    __tablename__ = "logements"

    id = Column(Integer, primary_key= True, index= True)
    id_proprietaire = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False)
    titre = Column(String, nullable=False)
    description = Column(String)
    type = Column(String, nullable=False)
    prix = Column(Float, nullable=False)
    surface = Column(Float)
    nb_chambres = Column(Integer)
    nb_salons = Column(Integer)
    nb_salles_de_bains = Column(Integer)
    ville = Column(String, nullable=False)
    adresse = Column(String)
    statut = Column(String, default="disponible")

    proprietaire = relationship("Utilisateur")

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key= True, index= True)
    id_logement = Column(Integer, ForeignKey("logements.id"), nullable= False)
    id_locataire = Column(Integer, ForeignKey("utilisateurs.id"), nullable= False)
    date_debut = Column(Date, nullable=False)
    date_fin = Column(Date, nullable=False)
    montant_loyer = Column(Float, nullable= False)
    statut = Column(String, default="active")

    logement = relationship("Logement")
    locataire = relationship("Utilisateur")