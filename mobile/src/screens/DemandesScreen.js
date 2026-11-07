import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import theme from '../theme';
import { useAuth } from '../context/AuthContext';
import { mesDemandesAPI } from '../services/api';

const filtres = ['Toutes', 'Nouvelle', 'En cours', 'Résolue', 'Clôturée'];

const statutConfig = {
  'Nouvelle':  { bg: '#E3F2FD', text: '#1565C0', icon: 'time-outline' },
  'En cours':  { bg: '#FFF3E0', text: '#F59E0B', icon: 'sync-outline' },
  'En alerte': { bg: '#FEF2F2', text: '#EF4444', icon: 'warning-outline' },
  'Résolue':   { bg: '#ECFDF5', text: '#10B981', icon: 'checkmark-circle-outline' },
  'Clôturée':  { bg: '#F3F4F6', text: '#6B7280', icon: 'archive-outline' },
};

const typeConfig = {
  'plomberie':   { icon: 'water-outline',       couleur: '#1565C0', bg: '#E3F2FD' },
  'electricite': { icon: 'flash-outline',        couleur: '#F59E0B', bg: '#FFFDE7' },
  'reparation':  { icon: 'construct-outline',    couleur: '#10B981', bg: '#ECFDF5' },
  'securite':    { icon: 'shield-outline',       couleur: '#EF4444', bg: '#FEF2F2' },
  'autre':       { icon: 'help-circle-outline',  couleur: '#6B7280', bg: '#F3F4F6' },
};

export default function DemandesScreen({ navigation }) {
  const { token } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [filtreActif, setFiltreActif] = useState('Toutes');
  const [chargement, setChargement] = useState(true);
  const [rafraichissement, setRafraichissement] = useState(false);

  const chargerDemandes = async (silencieux = false) => {
    try {
      if (!silencieux) setChargement(true);
      const data = await mesDemandesAPI(token);
      setDemandes(data);
    } catch (e) {
      console.error('Erreur chargement demandes:', e);
    } finally {
      setChargement(false);
      setRafraichissement(false);
    }
  };

  // Recharger quand on revient sur l'écran
  useFocusEffect(useCallback(() => {
    chargerDemandes();
  }, []));

  const demandesFiltrees = filtreActif === 'Toutes'
    ? demandes
    : demandes.filter(d => d.statut === filtreActif);

  const formaterDate = (date) =>
    date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '---';

  const renderDemande = ({ item }) => {
    const statut = statutConfig[item.statut] || statutConfig['Nouvelle'];
    const type = typeConfig[item.type_demande] || typeConfig['autre'];

    return (
      <TouchableOpacity style={styles.demandeCard} activeOpacity={0.8}>
        <View style={[styles.demandeIcone, { backgroundColor: type.bg }]}>
          <Ionicons name={type.icon} size={22} color={type.couleur} />
        </View>
        <View style={styles.demandeInfo}>
          <Text style={styles.demandeTitre}>{item.titre}</Text>
          <Text style={styles.demandeDescription} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.demandeDate}>{formaterDate(item.date_creation)}</Text>
        </View>
        <View style={styles.demandeRight}>
          <View style={[styles.statutBadge, { backgroundColor: statut.bg }]}>
            <Text style={[styles.statutText, { color: statut.text }]}>{item.statut}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} style={{ marginTop: 8 }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitre}>Mes demandes</Text>
          <TouchableOpacity
            style={styles.btnNouvelle}
            onPress={() => navigation.navigate('NouvelleDemande')}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.btnNouvelleText}>Nouvelle</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total',    nb: demandes.length },
            { label: 'Nouvelles', nb: demandes.filter(d => d.statut === 'Nouvelle').length },
            { label: 'En cours', nb: demandes.filter(d => d.statut === 'En cours').length },
            { label: 'Résolues', nb: demandes.filter(d => d.statut === 'Résolue').length },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={styles.statSep} />}
              <View style={styles.statItem}>
                <Text style={styles.statNb}>{s.nb}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      {/* Filtres */}
      <View style={styles.filtresContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filtres}
          keyExtractor={f => f}
          contentContainerStyle={styles.filtres}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filtre, filtreActif === f && styles.filtreActif]}
              onPress={() => setFiltreActif(f)}
            >
              <Text style={[styles.filtreText, filtreActif === f && styles.filtreTextActif]}>{f}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Liste */}
      {chargement ? (
        <View style={styles.centrer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={demandesFiltrees}
          renderItem={renderDemande}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.liste}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={rafraichissement}
              onRefresh={() => { setRafraichissement(true); chargerDemandes(true); }}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.vide}>
              <Ionicons name="clipboard-outline" size={52} color={theme.colors.textLight} />
              <Text style={styles.videTexte}>Aucune demande</Text>
              <Text style={styles.videSous}>Appuyez sur "+ Nouvelle" pour créer une demande</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitre: { fontSize: 20, fontWeight: '700', color: '#fff' },
  btnNouvelle: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  btnNouvelleText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: theme.borderRadius.md, padding: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statNb: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  statSep: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },
  filtresContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  filtres: { paddingHorizontal: theme.spacing.md, paddingVertical: 10, gap: 8 },
  filtre: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border },
  filtreActif: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filtreText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  filtreTextActif: { color: '#fff' },
  centrer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  liste: { padding: theme.spacing.md, paddingBottom: 30 },
  demandeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, gap: 12 },
  demandeIcone: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  demandeInfo: { flex: 1 },
  demandeTitre: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 3 },
  demandeDescription: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
  demandeDate: { fontSize: 11, color: theme.colors.textLight },
  demandeRight: { alignItems: 'flex-end', flexShrink: 0 },
  statutBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statutText: { fontSize: 11, fontWeight: '600' },
  vide: { alignItems: 'center', marginTop: 60, gap: 10 },
  videTexte: { fontSize: 16, fontWeight: '700', color: theme.colors.textSecondary },
  videSous: { fontSize: 13, color: theme.colors.textLight, textAlign: 'center' },
});
