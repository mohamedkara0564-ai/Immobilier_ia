import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connexionAPI, monProfilAPI, mesLocationsAPI, mesNotificationsAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [utilisateur, setUtilisateur] = useState(null);
  const [location, setLocation] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [notifNonLues, setNotifNonLues] = useState(0);

  const rafraichirNotifs = async (tok) => {
    try {
      const notifs = await mesNotificationsAPI(tok);
      setNotifNonLues(notifs.filter(n => n.lu === 'false').length);
    } catch {}
  };

  useEffect(() => {
    const restaurerSession = async () => {
      try {
        const tokenStocke = await AsyncStorage.getItem('token');
        if (tokenStocke) {
          const profil = await monProfilAPI(tokenStocke);
          if (!profil.nom || !profil.prenom) {
            await AsyncStorage.removeItem('token');
            setChargement(false);
            return;
          }
          setToken(tokenStocke);
          setUtilisateur(profil);
          const locations = await mesLocationsAPI(tokenStocke);
          if (locations.length > 0) setLocation(locations[0]);
          await rafraichirNotifs(tokenStocke);
        }
      } catch {
        await AsyncStorage.removeItem('token');
      } finally {
        setChargement(false);
      }
    };
    restaurerSession();
  }, []);

  const seConnecter = async (email, motDePasse) => {
    const data = await connexionAPI(email, motDePasse);
    const nouveauToken = data.access_token;
    await AsyncStorage.setItem('token', nouveauToken);
    setToken(nouveauToken);
    const profil = await monProfilAPI(nouveauToken);
    setUtilisateur(profil);
    const locations = await mesLocationsAPI(nouveauToken);
    if (locations.length > 0) setLocation(locations[0]);
    await rafraichirNotifs(nouveauToken);
    return profil;
  };

  const seDeconnecter = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUtilisateur(null);
    setLocation(null);
    setNotifNonLues(0);
  };

  return (
    <AuthContext.Provider value={{
      token, utilisateur, location, chargement,
      notifNonLues, setNotifNonLues, rafraichirNotifs,
      seConnecter, seDeconnecter,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
