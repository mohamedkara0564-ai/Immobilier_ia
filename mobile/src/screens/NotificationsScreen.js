import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import theme from '../theme';
import { useAuth } from '../context/AuthContext';
import { mesNotificationsAPI, marquerLueAPI, toutMarquerLuAPI } from '../services/api';

const typeConfig = {
  paiement: { icon: 'checkmark-circle',      couleur: '#10B981', bg: '#ECFDF5' },
  demande:  { icon: 'construct',             couleur: '#F59E0B', bg: '#FFFDE7' },
  loyer:    { icon: 'calendar',             couleur: '#1565C0', bg: '#E3F2FD' },
  ia:       { icon: 'hardware-chip',        couleur: '#7B1FA2', bg: '#F3E5F5' },
  info:     { icon: 'information-circle',   couleur: '#FF6F00', bg: '#FFF3E0' },
};

export default function NotificationsScreen({ navigation }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [rafraichissement, setRafraichissement] = useState(false);
  const { setNotifNonLues } = useAuth();

  const charger = async (silencieux = false) => {
    try {
      if (!silencieux) setChargement(true);
      const data = await mesNotificationsAPI(token);
      setNotifications(data);
    } catch (e) {
      console.error('Erreur notifications:', e);
    } finally {
      setChargement(false);
      setRafraichissement(false);
    }
  };

  useFocusEffect(useCallback(() => { charger(); }, []));

  const nonLues = notifications.filter(n => n.lu === 'false').length;

  const handleMarquerLue = async (id) => {
    try {
      await marquerLueAPI(token, id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: 'true' } : n));
      setNotifNonLues(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleToutLire = async () => {
    try {
      await toutMarquerLuAPI(token);
      setNotifications(prev => prev.map(n => ({ ...n, lu: 'true' })));
      setNotifNonLues(0);
    } catch {}
  };

  const formaterDate = (date) =>
    date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  const renderNotification = ({ item }) => {
    const config = typeConfig[item.type] || typeConfig.info;
    const estNonLue = item.lu === 'false';

    return (
      <TouchableOpacity
        style={[styles.notifCard, estNonLue && styles.notifCardNonLue]}
        onPress={() => handleMarquerLue(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.notifIcone, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={22} color={config.couleur} />
        </View>
        <View style={styles.notifContenu}>
          <View style={styles.notifTitreRow}>
            <Text style={styles.notifTitre} numberOfLines={1}>{item.titre}</Text>
            {estNonLue && <View style={styles.pointNonLu} />}
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
          <View style={styles.notifDateRow}>
            <Ionicons name="time-outline" size={11} color={theme.colors.textLight} />
            <Text style={styles.notifDate}>{formaterDate(item.date_creation)} · {item.heure}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitre}>Notifications</Text>
            {nonLues > 0 && (
              <Text style={styles.headerSous}>{nonLues} non lue{nonLues > 1 ? 's' : ''}</Text>
            )}
          </View>
          {nonLues > 0 && (
            <TouchableOpacity style={styles.btnToutLire} onPress={handleToutLire}>
              <Text style={styles.btnToutLireText}>Tout lire</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.resumeRow}>
          {[
            { label: 'Total',    nb: notifications.length },
            { label: 'Non lues', nb: nonLues },
            { label: 'Lues',     nb: notifications.length - nonLues },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={styles.resumeSep} />}
              <View style={styles.resumeItem}>
                <Text style={styles.resumeNb}>{s.nb}</Text>
                <Text style={styles.resumeLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      {chargement ? (
        <View style={styles.centrer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.liste}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={rafraichissement}
              onRefresh={() => { setRafraichissement(true); charger(true); }}
              colors={[theme.colors.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <View style={styles.vide}>
              <Ionicons name="notifications-off-outline" size={52} color={theme.colors.textLight} />
              <Text style={styles.videTexte}>Aucune notification</Text>
              <Text style={styles.videSous}>Les notifications apparaîtront ici après vos actions</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: 55, paddingBottom: 20, paddingHorizontal: theme.spacing.lg },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitre: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSous: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  btnToutLire: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  btnToutLireText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  resumeRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: theme.borderRadius.md, padding: 12 },
  resumeItem: { flex: 1, alignItems: 'center' },
  resumeNb: { fontSize: 22, fontWeight: '800', color: '#fff' },
  resumeLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  resumeSep: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },
  centrer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  liste: { padding: theme.spacing.md, paddingBottom: 30 },
  notifCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  notifCardNonLue: { backgroundColor: '#F0F7FF', borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
  notifIcone: { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  notifContenu: { flex: 1 },
  notifTitreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notifTitre: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, flex: 1 },
  pointNonLu: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, marginLeft: 8, flexShrink: 0 },
  notifMessage: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  notifDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  notifDate: { fontSize: 11, color: theme.colors.textLight },
  vide: { alignItems: 'center', marginTop: 80, gap: 12 },
  videTexte: { fontSize: 16, fontWeight: '700', color: theme.colors.textSecondary },
  videSous: { fontSize: 13, color: theme.colors.textLight, textAlign: 'center' },
});
