import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen';
import ConnexionScreen from './src/screens/ConnexionScreen';
import InscriptionScreen from './src/screens/InscriptionScreen';
import MainNavigator from './src/navigation/MainNavigator';
import NouvelleDemande from './src/screens/NouvelleDemande';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Stack = createStackNavigator();

function Navigation() {
  const { token, chargement } = useAuth();

  if (chargement) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1565C0' }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 12, fontSize: 15 }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        // Utilisateur connecté
        <>
          <Stack.Screen name="Dashboard" component={MainNavigator} />
          <Stack.Screen name="NouvelleDemande" component={NouvelleDemande} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      ) : (
        // Utilisateur non connecté
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Connexion" component={ConnexionScreen} />
          <Stack.Screen name="Inscription" component={InscriptionScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
}
