import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const accesRapide = [
  { nom: 'Mon logement',  icon: 'home',                couleur: '#1565C0', bg: '#E3F2FD', screen: 'Mon logement' },
  { nom: 'Agent IA',      icon: 'chatbubble-ellipses', couleur: '#7B1FA2', bg: '#F3E5F5', screen: 'Agent IA' },
  { nom: 'Paiement',      icon: 'card',                couleur: '#2E7D32', bg: '#E8F5E9', screen: 'Paiement' },
  { nom: 'Mes demandes',  icon: 'construct',           couleur: '#E65100', bg: '#FFF3E0', screen: 'Mes demandes' },
  { nom: 'Notifications', icon: 'notifications',       couleur: '#F57F17', bg: '#FFFDE7', screen: 'Notifications' },
  { nom: 'Profil',        icon: 'person',              couleur: '#00695C', bg: '#E0F2F1', screen: 'Profil' },
];

export default function DashboardScreen({ navigation }) {
  const { utilisateur, location, notifNonLues } = useAuth();

  const prenom = utilisateur?.prenom || utilisateur?.nom || 'Utilisateur';
  const initiales = utilisateur
    ? `${utilisateur.prenom?.[0] || ''}${utilisateur.nom?.[0] || ''}`.toUpperCase()
    : 'JD';

  const logement = location?.logement;

  const formaterPrix = (prix) =>
    prix ? `${Number(prix).toLocaleString('fr-FR')} FCFA` : '---';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* En-tête */}
      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bonjour {prenom} 👋</Text>
            <Text style={styles.subGreeting}>Voici l'aperçu de votre logement.</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.clochBtn}
              onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={22} color={theme.colors.white} />
              {notifNonLues > 0 && (
                <View style={styles.clochBadge}>
                  <Text style={styles.clochBadgeText}>
                    {notifNonLues > 9 ? '9+' : notifNonLues}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initiales}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Carte logement */}
        {logement ? (
          <View style={styles.card}>
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>En cours</Text>
              </View>
            </View>

            <View style={styles.logementImage}>
              <LinearGradient colors={['#1E88E5', '#0D47A1']} style={styles.imagePlaceholder}>
                {logement.photos?.length > 0 ? null : (
                  <Ionicons name="business" size={48} color="rgba(255,255,255,0.6)" />
                )}
              </LinearGradient>
            </View>

            <View style={styles.logementInfo}>
              <Text style={styles.logementNom}>{logement.titre}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.locationText}>
                  {logement.quartier ? `${logement.quartier}, ` : ''}{logement.ville}
                </Text>
              </View>
              <Text style={styles.loyer}>{formaterPrix(logement.prix)} / mois</Text>

              <View style={styles.caracteristiques}>
                {logement.nb_salons && (
                  <View style={styles.caract}>
                    <Ionicons name="grid-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.caractText}>{logement.nb_salons} pièce{logement.nb_salons > 1 ? 's' : ''}</Text>
                  </View>
                )}
                {logement.nb_chambres && (
                  <View style={styles.caract}>
                    <Ionicons name="bed-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.caractText}>{logement.nb_chambres} chambre{logement.nb_chambres > 1 ? 's' : ''}</Text>
                  </View>
                )}
                {logement.nb_salles_de_bains && (
                  <View style={styles.caract}>
                    <Ionicons name="water-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.caractText}>{logement.nb_salles_de_bains} sdb</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          /* Pas de logement */
          <View style={styles.pasDeLogement}>
            <Ionicons name="home-outline" size={48} color={theme.colors.textLight} />
            <Text style={styles.pasDeLogementText}>Aucun logement actif</Text>
            <Text style={styles.pasDeLogementSub}>Contactez votre propriétaire pour activer votre location.</Text>
          </View>
        )}

        {/* Accès rapide */}
        <Text style={styles.sectionTitle}>Accès rapide</Text>
        <View style={styles.accesGrid}>
          {accesRapide.map((item) => (
            <TouchableOpacity
              key={item.nom}
              style={styles.accesItem}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.accesIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={26} color={item.couleur} />
              </View>
              <Text style={styles.accesLabel}>{item.nom}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prochain loyer */}
        {location && (
          <View style={styles.prochainLoyer}>
            <View style={styles.prochainLoyerLeft}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              <View>
                <Text style={styles.prochainLoyerLabel}>Prochain loyer</Text>
                <Text style={styles.prochainLoyerDate}>
                  {new Date(location.date_fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Text>
              </View>
            </View>
            <Text style={styles.prochainLoyerMontant}>{formaterPrix(location.montant_loyer)}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: 55, paddingBottom: 20, paddingHorizontal: theme.spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 22, fontWeight: '700', color: theme.colors.white },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clochBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
clochBadge: {position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.primary, paddingHorizontal: 3,},
clochBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700',},
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { color: theme.colors.white, fontWeight: '700', fontSize: 15 },
  scrollView: { flex: 1 },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 30 },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, overflow: 'hidden', marginBottom: theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  badgeContainer: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.success },
  badgeText: { fontSize: 11, fontWeight: '600', color: theme.colors.success },
  logementImage: { height: 160 },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logementInfo: { padding: theme.spacing.md },
  logementNom: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  locationText: { fontSize: 13, color: theme.colors.textSecondary },
  loyer: { fontSize: 20, fontWeight: '800', color: theme.colors.primary, marginBottom: 12 },
  caracteristiques: { flexDirection: 'row', gap: 16 },
  caract: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  caractText: { fontSize: 12, color: theme.colors.textSecondary },
  pasDeLogement: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, padding: 32, alignItems: 'center', marginBottom: theme.spacing.lg, gap: 8 },
  pasDeLogementText: { fontSize: 16, fontWeight: '700', color: theme.colors.textSecondary },
  pasDeLogementSub: { fontSize: 13, color: theme.colors.textLight, textAlign: 'center', lineHeight: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
  accesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: theme.spacing.lg },
  accesItem: { width: (width - 56) / 3, backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  accesIcon: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  accesLabel: { fontSize: 11, fontWeight: '600', color: theme.colors.textPrimary, textAlign: 'center' },
  prochainLoyer: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: theme.colors.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  prochainLoyerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prochainLoyerLabel: { fontSize: 12, color: theme.colors.textSecondary },
  prochainLoyerDate: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
  prochainLoyerMontant: { fontSize: 16, fontWeight: '700', color: theme.colors.primary },
});
