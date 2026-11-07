// URL de ton backend — remplace par ton IP locale si tu testes sur téléphone physique
// Exemple téléphone physique : 'http://192.168.1.XX:8000'
// Expo Go sur émulateur iOS : 'http://localhost:8000'
// Expo Go sur émulateur Android : 'http://10.0.2.2:8000'
const BASE_URL = 'http://192.168.1.67:8000';

// ─── Authentification ───────────────────────────────────────────────────────

export const connexionAPI = async (email, motDePasse) => {
  const response = await fetch(`${BASE_URL}/utilisateurs/connexion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mot_de_passe: motDePasse }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur de connexion');
  return data; // { access_token, token_type }
};

export const inscriptionAPI = async (nom, prenom, email, motDePasse, telephone, role = 'Locataire') => {
  const response = await fetch(`${BASE_URL}/utilisateurs/inscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom, prenom, email, mot_de_passe: motDePasse, telephone, role }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur lors de l\'inscription');
  return data;
};

export const monProfilAPI = async (token) => {
  const response = await fetch(`${BASE_URL}/utilisateurs/moi`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur profil');
  return data;
};

// ─── Locations ──────────────────────────────────────────────────────────────

export const mesLocationsAPI = async (token) => {
  const response = await fetch(`${BASE_URL}/locations/mes_locations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur locations');
  return data;
};

// ─── Logements ──────────────────────────────────────────────────────────────

export const detailLogementAPI = async (token, logementId) => {
  const response = await fetch(`${BASE_URL}/logements/${logementId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur logement');
  return data;
};

// ─── Agent IA ────────────────────────────────────────────────────────────────

export const mesConversationsAPI = async (token) => {
  const response = await fetch(`${BASE_URL}/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur conversations');
  return data;
};

export const creerConversationAPI = async (token) => {
  const response = await fetch(`${BASE_URL}/conversations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur création conversation');
  return data;
};

export const envoyerMessageAPI = async (token, convId, contenu) => {
  const response = await fetch(`${BASE_URL}/conversations/${convId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contenu }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur envoi message');
  return data;
};

export const historiqueMessagesAPI = async (token, convId) => {
  const response = await fetch(`${BASE_URL}/conversations/${convId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur historique');
  return data;
};

// ─── Paiements ───────────────────────────────────────────────────────────────

export const mesPaiementsAPI = async (token) => {
  const response = await fetch(`${BASE_URL}/paiements/mes_paiements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur paiements');
  return data;
};

export const effectuerPaiementAPI = async (token, idLocation, montant, moyenPaiement, moisConcerne) => {
  const response = await fetch(`${BASE_URL}/paiements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id_location: idLocation,
      montant,
      moyen_paiement: moyenPaiement,
      mois_concerne: moisConcerne,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur paiement');
  return data;
};

// ─── Demandes ────────────────────────────────────────────────────────────────

export const mesDemandesAPI = async (token) => {
  const response = await fetch(`${BASE_URL}/demandes/mes_demandes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur demandes');
  return data;
};

export const creerDemandeAPI = async (token, titre, description, typeDemande, idLogement = null) => {
  const response = await fetch(`${BASE_URL}/demandes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      titre,
      description,
      type_demande: typeDemande,
      id_logement: idLogement,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erreur création demande');
  return data;
};
