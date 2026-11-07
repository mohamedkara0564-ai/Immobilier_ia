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
    quartier = Column(String)
    adresse = Column(String)
    statut = Column(String, default="disponible")

    proprietaire = relationship("Utilisateur")
    photos = relationship("Photo", back_populates="logement", cascade="all, delete-orphan")

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

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    id_logement = Column(Integer, ForeignKey("logements.id"), nullable=False)
    url = Column(String, nullable=False)

    logement = relationship("Logement", back_populates="photos")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    id_locataire = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False)
    titre = Column(String, default="Nouvelle conversation")
    date_creation = Column(Date, nullable=False)

    locataire = relationship("Utilisateur")
    messages = relationship("MessageIA", back_populates="conversation", cascade="all, delete-orphan")

class MessageIA(Base):
    __tablename__ = "messages_ia"

    id = Column(Integer, primary_key=True, index=True)
    id_conversation = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False)  # "utilisateur" ou "ia"
    contenu = Column(String, nullable=False)
    horodatage = Column(String, nullable=False)

    conversation = relationship("Conversation", back_populates="messages")

class Paiement(Base):
    __tablename__ = "paiements"

    id = Column(Integer, primary_key=True, index=True)
    id_location = Column(Integer, ForeignKey("locations.id"), nullable=False)
    id_locataire = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False)
    montant = Column(Float, nullable=False)
    moyen_paiement = Column(String, nullable=False)  # orange_money, mtn, carte
    statut = Column(String, default="payé")
    date_paiement = Column(Date, nullable=False)
    reference = Column(String, nullable=False)
    mois_concerne = Column(String, nullable=False)  # ex: "Mai 2025"

    location = relationship("Location")
    locataire = relationship("Utilisateur")


class Demande(Base):
    __tablename__ = "demandes"

    id = Column(Integer, primary_key=True, index=True)
    id_locataire = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False)
    id_logement = Column(Integer, ForeignKey("logements.id"), nullable=True)
    titre = Column(String, nullable=False)
    description = Column(String, nullable=False)
    type_demande = Column(String, nullable=False)
    statut = Column(String, default="Nouvelle")
    date_creation = Column(Date, nullable=False)
    date_mise_a_jour = Column(Date, nullable=True)
    photo_url = Column(String, nullable=True)

    locataire = relationship("Utilisateur")
    logement = relationship("Logement")

class Notification(Base):
    __tablename__ = "notifications_app"

    id = Column(Integer, primary_key=True, index=True)
    id_utilisateur = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False)
    titre = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False)  # paiement, demande, loyer, info, ia
    lu = Column(String, default="false")
    date_creation = Column(Date, nullable=False)
    heure = Column(String, nullable=False)

    utilisateur = relationship("Utilisateur")
