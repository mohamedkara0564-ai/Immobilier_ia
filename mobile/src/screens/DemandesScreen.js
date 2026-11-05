import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const filtres = ['Toutes', 'En cours', 'Résolues', 'Clôturées'];

const demandesData = [
  {
    id: '1',
    titre: 'Problème de plomberie',
    description: 'Fuite d\'eau sous l\'évier de la cuisine',
    date: '12 avr. 2025',
    statut: 'En cours',
    icon: 'water-outline',
    couleur: '#F59E0B',
    bg: '#FFFDE7',
  },
  {
    id: '2',
    titre: 'Panne électrique',
    description: 'Pas d\'électricité dans la chambre principale',
    date: '8 avr. 2025',
    statut: 'En alerte',
    icon: 'flash-outline',
    couleur: '#EF4444',
    bg: '#FEF2F2',
  },
  {
    id: '3',
    titre: 'Demande de réparation',
    description: 'Porte du balcon qui ne ferme plus correctement',
    date: '29 mars 2025',
    statut: 'Résolue',
    icon: 'construct-outline',
    couleur: '#10B981',
    bg: '#ECFDF5',
  },
  {
    id: '4',
    titre: 'Question sur le contrat',
    description: 'Clarification sur la clause de résiliation',
    date: '20 mars 2025',
    statut: 'Clôturée',
    icon: 'document-text-outline',
    couleur: '#6B7280',
    bg: '#F3F4F6',
  },
];

const statutCouleurs = {
  'En cours':  { bg: '#FFF3E0', text: '#F59E0B' },
  'En alerte': { bg: '#FEF2F2', text: '#EF4444' },
  'Résolue':   { bg: '#ECFDF5', text: '#10B981' },
  'Clôturée':  { bg: '#F3F4F6', text: '#6B7280' },
  'Nouvelle':  { bg: '#E3F2FD', text: '#1565C0' },
};

export default function DemandesScreen({ navigation }) {
  const [filtreActif, setFiltreActif] = useState('Toutes');

  const demandesFiltrees = filtreActif === 'Toutes'
    ? demandesData
    : demandesData.filter(d =>
        filtreActif === 'En cours'
          ? (d.statut === 'En cours' || d.statut === 'En alerte')
          : d.statut === filtreActif || d.statut.startsWith(filtreActif.slice(0, -1))
      );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* En-tête */}
      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitre}>Mes demandes</Text>
          <TouchableOpacity
            style={styles.btnNouvelle}
            onPress={() => navigation.navigate('NouvelleDemande')}
          >
            <Ionicons name="add" size={18} color={theme.colors.white} />
            <Text style={styles.btnNouvelleText}>Nouvelle demande</Text>
          </TouchableOpacity>
        </View>

        {/* Stats rapides */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNombre}>{demandesData.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statSeparateur} />
          <View style={styles.statItem}>
            <Text style={styles.statNombre}>
              {demandesData.filter(d => d.statut === 'En cours' || d.statut === 'En alerte').length}
            </Text>
            <Text style={styles.statLabel}>En cours</Text>
          </View>
          <View style={styles.statSeparateur} />
          <View style={styles.statItem}>
            <Text style={styles.statNombre}>
              {demandesData.filter(d => d.statut === 'Résolue').length}
            </Text>
            <Text style={styles.statLabel}>Résolues</Text>
          </View>
          <View style={styles.statSeparateur} />
          <View style={styles.statItem}>
            <Text style={styles.statNombre}>
              {demandesData.filter(d => d.statut === 'Clôturée').length}
            </Text>
            <Text style={styles.statLabel}>Clôturées</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filtres */}
      <View style={styles.filtresContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtres}>
          {filtres.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filtre, filtreActif === f && styles.filtreActif]}
              onPress={() => setFiltreActif(f)}
            >
              <Text style={[styles.filtreText, filtreActif === f && styles.filtreTextActif]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste des demandes */}
      <FlatList
        data={demandesFiltrees}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const couleurStatut = statutCouleurs[item.statut] || statutCouleurs['Nouvelle'];
          return (
            <TouchableOpacity style={styles.demandeCard} activeOpacity={0.8}>
              <View style={[styles.demandeIcone, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={22} color={item.couleur} />
              </View>
              <View style={styles.demandeInfo}>
                <Text style={styles.demandeTitre}>{item.titre}</Text>
                <Text style={styles.demandeDescription} numberOfLines={1}>
                  {item.description}
                </Text>
                <Text style={styles.demandeDate}>{item.date}</Text>
              </View>
              <View style={styles.demandeRight}>
                <View style={[styles.statutBadge, { backgroundColor: couleurStatut.bg }]}>
                  <Text style={[styles.statutText, { color: couleurStatut.text }]}>{item.statut}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} style={{ marginTop: 8 }} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Ionicons name="clipboard-outline" size={48} color={theme.colors.textLight} />
            <Text style={styles.videText}>Aucune demande dans cette catégorie</Text>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitre: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.white,
  },
  btnNouvelle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  btnNouvelleText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: theme.borderRadius.md,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNombre: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  statSeparateur: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  filtresContainer: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filtres: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  filtre: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filtreActif: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filtreText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  filtreTextActif: {
    color: theme.colors.white,
  },
  liste: {
    padding: theme.spacing.md,
    paddingBottom: 30,
  },
  demandeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  demandeIcone: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  demandeInfo: {
    flex: 1,
  },
  demandeTitre: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  demandeDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  demandeDate: {
    fontSize: 11,
    color: theme.colors.textLight,
  },
  demandeRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  statutBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statutText: {
    fontSize: 11,
    fontWeight: '600',
  },
  vide: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  videText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
