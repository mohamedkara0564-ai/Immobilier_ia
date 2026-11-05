import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import MonLogementScreen from '../screens/MonLogementScreen';
import AgentIAScreen from '../screens/AgentIAScreen';
import PaiementScreen from '../screens/PaiementScreen';
import DemandesScreen from '../screens/DemandesScreen';
import ProfilScreen from '../screens/ProfilScreen';

const Tab = createBottomTabNavigator();

const EcranTemp = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
    <Ionicons name="construct-outline" size={48} color="#1565C0" />
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1565C0', marginTop: 12 }}>{route.name}</Text>
    <Text style={{ color: '#6B7280', marginTop: 8 }}>Écran en construction...</Text>
  </View>
);

const tabs = [
  { name: 'Accueil',       component: DashboardScreen,   icon: 'home' },
  { name: 'Mon logement',  component: MonLogementScreen, icon: 'business' },
  { name: 'Agent IA',      component: AgentIAScreen,     icon: 'chatbubble-ellipses' },
  { name: 'Paiement',      component: PaiementScreen,    icon: 'card' },
  { name: 'Mes demandes',  component: DemandesScreen,    icon: 'construct' },
  { name: 'Profil',        component: ProfilScreen,      icon: 'person' },
];

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          const tab = tabs.find(t => t.name === route.name);
          const iconName = focused ? tab.icon : `${tab.icon}-outline`;
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      {tabs.map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    height: 65,
    paddingBottom: 8,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
