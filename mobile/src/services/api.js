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
