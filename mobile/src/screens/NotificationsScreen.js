import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const notificationsData = [
  {
    id: '1',
    type: 'paiement',
    titre: 'Paiement confirmé',
    message: 'Votre loyer de 650 000 FCFA à été payé.',
    date: '4 mai 2025',
    heure: '10:32',
    lu: false,
    icon: 'checkmark-circle',
    couleur: '#10B981',
    bg: '#ECFDF5',
  },
  {
    id: '2',
    type: 'ia',
    titre: 'Nouvelle réponse de l\'IA',
    message: 'L\'agent IA a répondu à votre question.',
    date: '3 mai 2025',
    heure: '15:41',
    lu: false,
    icon: 'hardware-chip',
    couleur: '#7B1FA2',
    bg: '#F3E5F5',
  },
  {
    id: '3',
    type: 'demande',
    titre: 'Demande en cours',
    message: 'Votre problème de plomberie est en cours de traitement.',
    date: '2 mai 2025',
    heure: '09:15',
    lu: false,
    icon: 'construct',
    couleur: '#F59E0B',
    bg: '#FFFDE7',
  },
  {
    id: '4',
    type: 'loyer',
    titre: 'Prochaine échéance',
    message: 'Votre loyer est dû dans 3 jours, le 11 avr. 2025.',
    date: '8 avr. 2025',
    heure: '08:00',
    lu: true,
    icon: 'calendar',
    couleur: '#1565C0',
    bg: '#E3F2FD',
  },
  {
    id: '5',
    type: 'info',
    titre: 'Bienvenue sur HomeLink !',
    message: 'Merci de faire confiance à notre plateforme !',
    date: '5 mars 2025',
    heure: '12:00',
    lu: true,
    icon: 'home',
    couleur: '#FF6F00',
    bg: '#FFF3E0',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(notificationsData);

  const nonLues = notifications.filter(n => !n.lu).length;

  const marquerToutesLues = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
  };

  const marquerLue = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, lu: true } : n)
    );
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notifCard, !item.lu && styles.notifCardNonLue]}
      onPress={() => marquerLue(item.id)}
      activeOpacity={0.8}
    >
      {/* Icône */}
      <View style={[styles.notifIcone, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={22} color={item.couleur} />
      </View>

      {/* Contenu */}
      <View style={styles.notifContenu}>
        <View style={styles.notifTitreRow}>
          <Text style={styles.notifTitre} numberOfLines={1}>{item.titre}</Text>
          {!item.lu && <View style={styles.pointNonLu} />}
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
        <View style={styles.notifDateRow}>
          <Ionicons name="time-outline" size={11} color={theme.colors.textLight} />
          <Text style={styles.notifDate}>{item.date} · {item.heure}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* En-tête */}
      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitre}>Notifications</Text>
            {nonLues > 0 && (
              <Text style={styles.headerSous}>{nonLues} non lue{nonLues > 1 ? 's' : ''}</Text>
            )}
          </View>
          {nonLues > 0 && (
            <TouchableOpacity style={styles.btnToutLire} onPress={marquerToutesLues}>
              <Text style={styles.btnToutLireText}>Tout marquer comme lu</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Badge résumé */}
        <View style={styles.resumeRow}>
          <View style={styles.resumeItem}>
            <Text style={styles.resumeNombre}>{notifications.length}</Text>
            <Text style={styles.resumeLabel}>Total</Text>
          </View>
          <View style={styles.resumeSep} />
          <View style={styles.resumeItem}>
            <Text style={styles.resumeNombre}>{nonLues}</Text>
            <Text style={styles.resumeLabel}>Non lues</Text>
          </View>
          <View style={styles.resumeSep} />
          <View style={styles.resumeItem}>
            <Text style={styles.resumeNombre}>{notifications.length - nonLues}</Text>
            <Text style={styles.resumeLabel}>Lues</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Liste */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separateur} />}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Ionicons name="notifications-off-outline" size={52} color={theme.colors.textLight} />
            <Text style={styles.videText}>Aucune notification</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitre: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.white,
  },
  headerSous: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  btnToutLire: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  btnToutLireText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  resumeRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: theme.borderRadius.md,
    padding: 12,
  },
  resumeItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumeNombre: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.white,
  },
  resumeLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  resumeSep: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  liste: {
    padding: theme.spacing.md,
    paddingBottom: 30,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  notifCardNonLue: {
    backgroundColor: '#F0F7FF',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  notifIcone: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  notifContenu: {
    flex: 1,
  },
  notifTitreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitre: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  pointNonLu: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
    flexShrink: 0,
  },
  notifMessage: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  notifDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notifDate: {
    fontSize: 11,
    color: theme.colors.textLight,
  },
  separateur: {
    height: 8,
  },
  vide: {
    alignItems: 'center',
    marginTop: 80,
    gap: 12,
  },
  videText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
});
