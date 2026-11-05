import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const { width } = Dimensions.get('window');

const equipements = [
  { nom: 'Climatisation', icon: 'snow-outline' },
  { nom: 'Parking',       icon: 'car-outline' },
  { nom: 'Wi-Fi',         icon: 'wifi-outline' },
  { nom: 'Jardin',        icon: 'leaf-outline' },
  { nom: 'Sécurité 24/24',icon: 'shield-checkmark-outline' },
  { nom: 'Piscine',       icon: 'water-outline' },
  { nom: 'Buanderie',     icon: 'shirt-outline' },
];

const photos = [1, 2, 3, 4, 5]; // 5 photos simulées

export default function MonLogementScreen({ navigation }) {
  const [ongletActif, setOngletActif] = useState('Informations');
  const [photoIndex, setPhotoIndex] = useState(0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Galerie photos */}
      <View style={styles.photoContainer}>
        <LinearGradient
          colors={['#1E88E5', '#0D47A1']}
          style={styles.photoBg}
        >
          <Ionicons name="business" size={64} color="rgba(255,255,255,0.4)" />
        </LinearGradient>

        {/* Bouton retour */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>

        {/* Pagination photos */}
        <View style={styles.photoPagination}>
          {photos.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setPhotoIndex(i)}
              style={[styles.photoDot, i === photoIndex && styles.photoDotActive]}
            />
          ))}
        </View>

        {/* Compteur */}
        <View style={styles.photoCounter}>
          <Text style={styles.photoCounterText}>{photoIndex + 1}/{photos.length}</Text>
        </View>

        {/* Badge statut */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>En cours</Text>
        </View>
      </View>

      {/* Contenu */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Infos principales */}
        <Text style={styles.nomLogement}>Villa Les Palmiers</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.locationText}>Cocody, Abidjan</Text>
        </View>
        <Text style={styles.loyer}>650 000 FCFA / mois</Text>

        {/* Caractéristiques */}
        <View style={styles.caractRow}>
          <View style={styles.caract}>
            <Ionicons name="grid-outline" size={15} color={theme.colors.primary} />
            <Text style={styles.caractText}>3 pièces</Text>
          </View>
          <View style={styles.separatorV} />
          <View style={styles.caract}>
            <Ionicons name="bed-outline" size={15} color={theme.colors.primary} />
            <Text style={styles.caractText}>2 chambres</Text>
          </View>
          <View style={styles.separatorV} />
          <View style={styles.caract}>
            <Ionicons name="water-outline" size={15} color={theme.colors.primary} />
            <Text style={styles.caractText}>2 salles de bain</Text>
          </View>
        </View>

        {/* Onglets */}
        <View style={styles.onglets}>
          {['Informations', 'Contrat', 'Historique'].map((onglet) => (
            <TouchableOpacity
              key={onglet}
              style={[styles.onglet, ongletActif === onglet && styles.ongletActif]}
              onPress={() => setOngletActif(onglet)}
            >
              <Text style={[styles.ongletText, ongletActif === onglet && styles.ongletTextActif]}>
                {onglet}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contenu onglet Informations */}
        {ongletActif === 'Informations' && (
          <View>
            {/* Équipements */}
            <Text style={styles.sectionTitle}>Équipements</Text>
            <View style={styles.equipementsGrid}>
              {equipements.map((eq) => (
                <View key={eq.nom} style={styles.equipementItem}>
                  <View style={styles.equipementIcon}>
                    <Ionicons name={eq.icon} size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.equipementText}>{eq.nom}</Text>
                </View>
              ))}
            </View>

            {/* Description */}
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              Belle villa moderne située dans un quartier calme de Cocody, idéale pour une famille, avec un grand jardin et une piscine.
            </Text>

            {/* Tableau infos */}
            <Text style={styles.sectionTitle}>Informations du logement</Text>
            <View style={styles.infoTable}>
              {[
                { label: 'Type',              valeur: 'Villa' },
                { label: 'Nombre de pièces',  valeur: '3 pièces' },
                { label: 'Nombre de chambres',valeur: '2 chambres' },
                { label: 'Adresse',           valeur: 'Cocody, Abidjan' },
              ].map((ligne, i) => (
                <View key={i} style={[styles.infoRow, i % 2 === 0 && styles.infoRowAlt]}>
                  <Text style={styles.infoLabel}>{ligne.label}</Text>
                  <Text style={styles.infoValeur}>{ligne.valeur}</Text>
                </View>
              ))}
            </View>

            {/* Propriétaire */}
            <Text style={styles.sectionTitle}>Informations du propriétaire</Text>
            <View style={styles.proprietaireCard}>
              <View style={styles.proprietaireAvatar}>
                <Text style={styles.proprietaireAvatarText}>MP</Text>
              </View>
              <View style={styles.proprietaireInfo}>
                <Text style={styles.proprietaireNom}>M. Pierre Kouassi</Text>
                <View style={styles.proprietaireContact}>
                  <Ionicons name="call-outline" size={13} color={theme.colors.textSecondary} />
                  <Text style={styles.proprietaireContactText}>+225 07 00 00 00</Text>
                </View>
                <View style={styles.proprietaireContact}>
                  <Ionicons name="mail-outline" size={13} color={theme.colors.textSecondary} />
                  <Text style={styles.proprietaireContactText}>pierre.k@email.com</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.contactBtn}>
                <Ionicons name="call" size={18} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Contenu onglet Contrat */}
        {ongletActif === 'Contrat' && (
          <View style={styles.contratContainer}>
            <View style={styles.contratCard}>
              <Ionicons name="document-text" size={32} color={theme.colors.primary} />
              <View style={styles.contratInfo}>
                <Text style={styles.contratTitre}>Contrat de location</Text>
                <Text style={styles.contratDate}>Signé le 5 mars 2025</Text>
              </View>
            </View>
            {[
              { label: 'Date de début',    valeur: '05 mars 2025' },
              { label: 'Date de fin',      valeur: '05 mars 2026' },
              { label: 'Loyer mensuel',    valeur: '650 000 FCFA' },
              { label: 'Dépôt de garantie',valeur: '650 000 FCFA' },
            ].map((ligne, i) => (
              <View key={i} style={[styles.infoRow, i % 2 === 0 && styles.infoRowAlt]}>
                <Text style={styles.infoLabel}>{ligne.label}</Text>
                <Text style={styles.infoValeur}>{ligne.valeur}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.btnTelecharger}>
              <Ionicons name="download-outline" size={18} color={theme.colors.white} />
              <Text style={styles.btnTelechargerText}>Télécharger le contrat</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Contenu onglet Historique */}
        {ongletActif === 'Historique' && (
          <View>
            {[
              { mois: 'Mai 2025',    montant: '650 000 FCFA', statut: 'Payé',    couleur: theme.colors.success },
              { mois: 'Avril 2025',  montant: '650 000 FCFA', statut: 'Payé',    couleur: theme.colors.success },
              { mois: 'Mars 2025',   montant: '650 000 FCFA', statut: 'Payé',    couleur: theme.colors.success },
              { mois: 'Février 2025',montant: '650 000 FCFA', statut: 'En retard',couleur: theme.colors.error },
            ].map((item, i) => (
              <View key={i} style={styles.historiqueItem}>
                <View style={styles.historiqueLeft}>
                  <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
                  <View style={styles.historiqueTexts}>
                    <Text style={styles.historiqueMois}>{item.mois}</Text>
                    <Text style={styles.historiqueMontant}>{item.montant}</Text>
                  </View>
                </View>
                <View style={[styles.historiqueStatut, { backgroundColor: item.couleur + '20' }]}>
                  <Text style={[styles.historiqueStatutText, { color: item.couleur }]}>{item.statut}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Bouton Voir mon contrat */}
        <TouchableOpacity
          style={styles.btnContrat}
          onPress={() => setOngletActif('Contrat')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#1565C0', '#1E88E5']}
            style={styles.btnContratGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="document-text-outline" size={18} color={theme.colors.white} />
            <Text style={styles.btnContratText}>Voir mon contrat</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  photoContainer: {
    height: 260,
    position: 'relative',
  },
  photoBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPagination: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  photoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  photoDotActive: {
    width: 18,
    backgroundColor: theme.colors.white,
  },
  photoCounter: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  photoCounterText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.success,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  nomLogement: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  loyer: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  caractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  caract: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  caractText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  separatorV: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.border,
  },
  onglets: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  onglet: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  ongletActif: {
    backgroundColor: theme.colors.primary,
  },
  ongletText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  ongletTextActif: {
    color: theme.colors.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },
  equipementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: theme.spacing.lg,
  },
  equipementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  equipementIcon: {},
  equipementText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  infoTable: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  infoValeur: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  proprietaireCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  proprietaireAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proprietaireAvatarText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  proprietaireInfo: {
    flex: 1,
  },
  proprietaireNom: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  proprietaireContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  proprietaireContactText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  contactBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contratContainer: {
    marginBottom: theme.spacing.md,
  },
  contratCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: 12,
    marginBottom: theme.spacing.md,
  },
  contratInfo: {},
  contratTitre: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  contratDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  btnTelecharger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    gap: 8,
    marginTop: theme.spacing.md,
  },
  btnTelechargerText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  historiqueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  historiqueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historiqueTexts: {},
  historiqueMois: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  historiqueMontant: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  historiqueStatut: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  historiqueStatutText: {
    fontSize: 11,
    fontWeight: '600',
  },
  btnContrat: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginTop: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnContratGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  btnContratText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
