import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const BASE_URL = 'http://192.168.1.67:8000';

export default function MonLogementScreen({ navigation }) {
  const { location } = useAuth();
  const [ongletActif, setOngletActif] = useState('Informations');
  const [photoIndex, setPhotoIndex] = useState(0);

  const logement = location?.logement;

  const formaterPrix = (prix) =>
    prix ? `${Number(prix).toLocaleString('fr-FR')} FCFA` : '---';

  const formaterDate = (date) =>
    date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '---';

  if (!logement) {
    return (
      <View style={styles.vide}>
        <Ionicons name="home-outline" size={64} color={theme.colors.textLight} />
        <Text style={styles.videTexte}>Aucun logement actif</Text>
        <Text style={styles.videSous}>Contactez votre propriétaire pour activer votre location.</Text>
      </View>
    );
  }

  const photos = logement.photos || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Galerie photos */}
      <View style={styles.photoContainer}>
        {photos.length > 0 ? (
          <Image
            source={{ uri: `${BASE_URL}${photos[photoIndex]?.url}` }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient colors={['#1E88E5', '#0D47A1']} style={styles.photoBg}>
            <Ionicons name="business" size={64} color="rgba(255,255,255,0.4)" />
          </LinearGradient>
        )}

        {/* Bouton retour */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>

        {/* Pagination photos */}
        {photos.length > 1 && (
          <View style={styles.photoPagination}>
            {photos.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setPhotoIndex(i)}
                style={[styles.photoDot, i === photoIndex && styles.photoDotActive]} />
            ))}
          </View>
        )}

        {/* Compteur */}
        {photos.length > 0 && (
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>{photoIndex + 1}/{photos.length}</Text>
          </View>
        )}

        {/* Badge statut */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>
            {location?.statut === 'active' ? 'En cours' : location?.statut}
          </Text>
        </View>
      </View>

      {/* Contenu */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>

        {/* Infos principales */}
        <Text style={styles.nomLogement}>{logement.titre}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.locationText}>
            {logement.quartier ? `${logement.quartier}, ` : ''}{logement.ville}
          </Text>
        </View>
        <Text style={styles.loyer}>{formaterPrix(logement.prix)} / mois</Text>

        {/* Caractéristiques */}
        <View style={styles.caractRow}>
          {logement.nb_salons > 0 && (
            <View style={styles.caract}>
              <Ionicons name="grid-outline" size={15} color={theme.colors.primary} />
              <Text style={styles.caractText}>{logement.nb_salons} pièce{logement.nb_salons > 1 ? 's' : ''}</Text>
            </View>
          )}
          {logement.nb_salons > 0 && logement.nb_chambres > 0 && <View style={styles.separatorV} />}
          {logement.nb_chambres > 0 && (
            <View style={styles.caract}>
              <Ionicons name="bed-outline" size={15} color={theme.colors.primary} />
              <Text style={styles.caractText}>{logement.nb_chambres} chambre{logement.nb_chambres > 1 ? 's' : ''}</Text>
            </View>
          )}
          {logement.nb_chambres > 0 && logement.nb_salles_de_bains > 0 && <View style={styles.separatorV} />}
          {logement.nb_salles_de_bains > 0 && (
            <View style={styles.caract}>
              <Ionicons name="water-outline" size={15} color={theme.colors.primary} />
              <Text style={styles.caractText}>{logement.nb_salles_de_bains} sdb</Text>
            </View>
          )}
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

        {/* ── Informations ── */}
        {ongletActif === 'Informations' && (
          <View>
            {logement.description ? (
              <>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{logement.description}</Text>
              </>
            ) : null}

            <Text style={styles.sectionTitle}>Informations du logement</Text>
            <View style={styles.infoTable}>
              {[
                { label: 'Type',       valeur: logement.type },
                { label: 'Surface',    valeur: logement.surface ? `${logement.surface} m²` : 'Non renseignée' },
                { label: 'Ville',      valeur: logement.ville },
                { label: 'Adresse',    valeur: logement.adresse || 'Non renseignée' },
              ].map((ligne, i) => (
                <View key={i} style={[styles.infoRow, i % 2 === 0 && styles.infoRowAlt]}>
                  <Text style={styles.infoLabel}>{ligne.label}</Text>
                  <Text style={styles.infoValeur}>{ligne.valeur}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Contrat ── */}
        {ongletActif === 'Contrat' && (
          <View>
            <View style={styles.contratCard}>
              <Ionicons name="document-text" size={32} color={theme.colors.primary} />
              <View>
                <Text style={styles.contratTitre}>Contrat de location</Text>
                <Text style={styles.contratDate}>Signé le {formaterDate(location?.date_debut)}</Text>
              </View>
            </View>
            {[
              { label: 'Date de début',     valeur: formaterDate(location?.date_debut) },
              { label: 'Date de fin',       valeur: formaterDate(location?.date_fin) },
              { label: 'Loyer mensuel',     valeur: formaterPrix(location?.montant_loyer) },
              { label: 'Statut',            valeur: location?.statut === 'active' ? 'Active' : location?.statut },
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

        {/* ── Historique ── */}
        {ongletActif === 'Historique' && (
          <View>
            <View style={styles.historiqueVide}>
              <Ionicons name="time-outline" size={40} color={theme.colors.textLight} />
              <Text style={styles.historiqueVideText}>Historique des paiements</Text>
              <Text style={styles.historiqueVideSub}>
                Loyer mensuel : {formaterPrix(location?.montant_loyer)}
              </Text>
            </View>
          </View>
        )}

        {/* Bouton Voir contrat */}
        <TouchableOpacity
          style={styles.btnContrat}
          onPress={() => setOngletActif('Contrat')}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#1565C0', '#1E88E5']} style={styles.btnContratGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="document-text-outline" size={18} color={theme.colors.white} />
            <Text style={styles.btnContratText}>Voir mon contrat</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  vide: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12, backgroundColor: theme.colors.background },
  videTexte: { fontSize: 18, fontWeight: '700', color: theme.colors.textSecondary },
  videSous: { fontSize: 14, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20 },
  photoContainer: { height: 260, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  photoBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  photoPagination: { position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  photoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  photoDotActive: { width: 18, backgroundColor: theme.colors.white },
  photoCounter: { position: 'absolute', bottom: 14, right: 16, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  photoCounterText: { color: theme.colors.white, fontSize: 12, fontWeight: '600' },
  badge: { position: 'absolute', top: 50, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.success },
  badgeText: { fontSize: 11, fontWeight: '600', color: theme.colors.success },
  content: { flex: 1 },
  contentInner: { padding: theme.spacing.lg, paddingBottom: 40 },
  nomLogement: { fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  locationText: { fontSize: 13, color: theme.colors.textSecondary },
  loyer: { fontSize: 22, fontWeight: '800', color: theme.colors.primary, marginBottom: 12 },
  caractRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: 12, marginBottom: theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  caract: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  caractText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' },
  separatorV: { width: 1, height: 20, backgroundColor: theme.colors.border },
  onglets: { flexDirection: 'row', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: 4, marginBottom: theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  onglet: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: theme.borderRadius.sm },
  ongletActif: { backgroundColor: theme.colors.primary },
  ongletText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  ongletTextActif: { color: theme.colors.white },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12, marginTop: 4 },
  description: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22, marginBottom: theme.spacing.lg },
  infoTable: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, overflow: 'hidden', marginBottom: theme.spacing.lg },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  infoRowAlt: { backgroundColor: '#F8FAFC' },
  infoLabel: { fontSize: 13, color: theme.colors.textSecondary, flex: 1 },
  infoValeur: { fontSize: 13, fontWeight: '600', color: theme.colors.textPrimary, flex: 1, textAlign: 'right' },
  contratCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, gap: 12, marginBottom: theme.spacing.md },
  contratTitre: { fontSize: 15, fontWeight: '700', color: theme.colors.primary },
  contratDate: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  btnTelecharger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, padding: 14, gap: 8, marginTop: theme.spacing.md },
  btnTelechargerText: { color: theme.colors.white, fontWeight: '600', fontSize: 14 },
  historiqueVide: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  historiqueVideText: { fontSize: 15, fontWeight: '700', color: theme.colors.textSecondary },
  historiqueVideSub: { fontSize: 13, color: theme.colors.textLight },
  btnContrat: { borderRadius: theme.borderRadius.lg, overflow: 'hidden', marginTop: theme.spacing.lg, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnContratGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  btnContratText: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
});
