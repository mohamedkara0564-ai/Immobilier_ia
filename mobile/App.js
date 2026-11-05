import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/screens/SplashScreen';
import ConnexionScreen from './src/screens/ConnexionScreen';
import MainNavigator from './src/navigation/MainNavigator';
import NouvelleDemande from './src/screens/NouvelleDemande';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Stack = createStackNavigator();

const EcranTemp = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1565C0' }}>{route.name}</Text>
    <Text style={{ color: '#6B7280', marginTop: 8 }}>Écran en construction...</Text>
  </View>
);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Connexion" component={ConnexionScreen} />
        <Stack.Screen name="Inscription" component={EcranTemp} />
        <Stack.Screen name="Dashboard" component={MainNavigator} />
        <Stack.Screen name="NouvelleDemande" component={NouvelleDemande} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
