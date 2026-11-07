import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Modal, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { useAuth } from '../context/AuthContext';
import { mesPaiementsAPI, effectuerPaiementAPI } from '../services/api';

const moyensPaiement = [
  { id: 'orange_money', nom: 'Orange Money',      icon: 'phone-portrait-outline', couleur: '#FF6B00', bg: '#FFF3E0' },
  { id: 'mtn',          nom: 'MTN Mobile Money',  icon: 'phone-portrait-outline', couleur: '#FFC107', bg: '#FFFDE7' },
  { id: 'carte',        nom: 'Carte bancaire',    icon: 'card-outline',           couleur: '#1565C0', bg: '#E3F2FD' },
];

const formaterPrix = (prix) =>
  prix ? `${Number(prix).toLocaleString('fr-FR')} FCFA` : '---';

const moisActuel = () => {
  const mois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                 'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const d = new Date();
  return `${mois[d.getMonth()]} ${d.getFullYear()}`;
};

export default function PaiementScreen() {
  const { token, location } = useAuth();
  const [moyenSelectionne, setMoyenSelectionne] = useState('orange_money');
  const [onglet, setOnglet] = useState('payer');
  const [modalVisible, setModalVisible] = useState(false);
  const [paiements, setPaiements] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [paiementEnCours, setPaiementEnCours] = useState(false);
  const [dernierPaiement, setDernierPaiement] = useState(null);

  useEffect(() => {
    chargerPaiements();
  }, []);

  const chargerPaiements = async () => {
    try {
      setChargement(true);
      const data = await mesPaiementsAPI(token);
      setPaiements(data);
    } catch (e) {
      console.error('Erreur chargement paiements:', e);
    } finally {
      setChargement(false);
    }
  };

  const handlePayer = async () => {
    if (!location) return;
    setPaiementEnCours(true);
    try {
      const moyen = moyensPaiement.find(m => m.id === moyenSelectionne);
      const resultat = await effectuerPaiementAPI(
        token,
        location.id,
        location.montant_loyer,
        moyenSelectionne,
        moisActuel()
      );
      setDernierPaiement(resultat);
      setModalVisible(true);
      chargerPaiements();
    } catch (e) {
      console.error('Erreur paiement:', e);
    } finally {
      setPaiementEnCours(false);
    }
  };

  const formaterDate = (date) =>
    date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '---';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* En-tête */}
      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <Text style={styles.headerTitre}>Paiement du loyer</Text>
        <View style={styles.loyerCard}>
          <Text style={styles.loyerLabel}>Loyer du mois de {moisActuel()}</Text>
          <Text style={styles.loyerMontant}>{formaterPrix(location?.montant_loyer)}</Text>
          <View style={styles.loyerEcheance}>
            <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.75)" />
            <Text style={styles.loyerEcheanceText}>
              Échéance : {formaterDate(location?.date_fin)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Onglets */}
      <View style={styles.ongletsContainer}>
        {['payer', 'historique'].map(o => (
          <TouchableOpacity
            key={o}
            style={[styles.onglet, onglet === o && styles.ongletActif]}
            onPress={() => setOnglet(o)}
          >
            <Text style={[styles.ongletText, onglet === o && styles.ongletTextActif]}>
              {o === 'payer' ? 'Payer' : 'Historique'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Onglet Payer ── */}
        {onglet === 'payer' && (
          <View>
            <Text style={styles.sectionTitre}>Choisir un moyen de paiement</Text>
            {moyensPaiement.map((moyen) => (
              <TouchableOpacity
                key={moyen.id}
                style={[styles.moyenCard, moyenSelectionne === moyen.id && styles.moyenCardSelectionne]}
                onPress={() => setMoyenSelectionne(moyen.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.moyenIcon, { backgroundColor: moyen.bg }]}>
                  <Ionicons name={moyen.icon} size={24} color={moyen.couleur} />
                </View>
                <View style={styles.moyenInfo}>
                  <Text style={styles.moyenNom}>{moyen.nom}</Text>
                </View>
                <View style={[styles.radio, moyenSelectionne === moyen.id && styles.radioSelectionne]}>
                  {moyenSelectionne === moyen.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}

            {/* Récap */}
            <View style={styles.recapCard}>
              <Text style={styles.recapTitre}>Récapitulatif</Text>
              <View style={styles.recapLigne}>
                <Text style={styles.recapLabel}>Loyer {moisActuel()}</Text>
                <Text style={styles.recapValeur}>{formaterPrix(location?.montant_loyer)}</Text>
              </View>
              <View style={styles.recapLigne}>
                <Text style={styles.recapLabel}>Frais de service</Text>
                <Text style={styles.recapValeur}>0 FCFA</Text>
              </View>
              <View style={styles.recapSep} />
              <View style={styles.recapLigne}>
                <Text style={styles.recapTotal}>Total</Text>
                <Text style={styles.recapTotalMontant}>{formaterPrix(location?.montant_loyer)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btnPayer, paiementEnCours && { opacity: 0.7 }]}
              onPress={handlePayer}
              disabled={paiementEnCours || !location}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#1565C0', '#1E88E5']} style={styles.btnPayerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {paiementEnCours
                  ? <ActivityIndicator color="#fff" />
                  : <><Ionicons name="lock-closed" size={16} color="#fff" /><Text style={styles.btnPayerText}>Payer maintenant</Text></>
                }
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.securiteText}>🔒 Paiement 100% sécurisé</Text>
          </View>
        )}

        {/* ── Onglet Historique ── */}
        {onglet === 'historique' && (
          <View>
            <Text style={styles.sectionTitre}>Historique des paiements</Text>
            {chargement ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
            ) : paiements.length === 0 ? (
              <View style={styles.vide}>
                <Ionicons name="receipt-outline" size={48} color={theme.colors.textLight} />
                <Text style={styles.videText}>Aucun paiement effectué</Text>
              </View>
            ) : (
              paiements.map((p) => (
                <View key={p.id} style={styles.historiqueItem}>
                  <View style={styles.historiqueLeft}>
                    <View style={[styles.historiqueIcone, { backgroundColor: '#ECFDF5' }]}>
                      <Ionicons name="receipt-outline" size={20} color={theme.colors.success} />
                    </View>
                    <View>
                      <Text style={styles.historiqueMois}>{p.mois_concerne}</Text>
                      <Text style={styles.historiqueDate}>{formaterDate(p.date_paiement)}</Text>
                      <Text style={styles.historiqueRef}>#{p.reference}</Text>
                    </View>
                  </View>
                  <View style={styles.historiqueRight}>
                    <Text style={styles.historiqueMontant}>{formaterPrix(p.montant)}</Text>
                    <View style={[styles.histStatut, { backgroundColor: '#ECFDF5' }]}>
                      <Text style={[styles.histStatutText, { color: theme.colors.success }]}>Payé</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal confirmation */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalSuccess}>
              <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
            </View>
            <Text style={styles.modalTitre}>Paiement confirmé !</Text>
            <Text style={styles.modalMessage}>
              Votre loyer de {formaterPrix(dernierPaiement?.montant)} pour {dernierPaiement?.mois_concerne} a bien été reçu.
            </Text>
            {dernierPaiement && (
              <View style={styles.modalDetails}>
                <View style={styles.modalLigne}>
                  <Text style={styles.modalLabel}>Référence</Text>
                  <Text style={styles.modalValeur}>#{dernierPaiement.reference}</Text>
                </View>
                <View style={styles.modalLigne}>
                  <Text style={styles.modalLabel}>Date</Text>
                  <Text style={styles.modalValeur}>{formaterDate(dernierPaiement.date_paiement)}</Text>
                </View>
                <View style={styles.modalLigne}>
                  <Text style={styles.modalLabel}>Moyen</Text>
                  <Text style={styles.modalValeur}>
                    {moyensPaiement.find(m => m.id === dernierPaiement.moyen_paiement)?.nom}
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.modalBtn} onPress={() => { setModalVisible(false); setOnglet('historique'); }}>
              <Text style={styles.modalBtnText}>Voir l'historique</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnSec} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalBtnSecText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: 55, paddingBottom: 24, paddingHorizontal: theme.spacing.lg },
  headerTitre: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 16 },
  loyerCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  loyerLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  loyerMontant: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 6 },
  loyerEcheance: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  loyerEcheanceText: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  ongletsContainer: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: theme.spacing.lg, marginTop: -1, borderRadius: theme.borderRadius.md, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, marginBottom: 8 },
  onglet: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: theme.borderRadius.sm },
  ongletActif: { backgroundColor: theme.colors.primary },
  ongletText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  ongletTextActif: { color: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 30 },
  sectionTitre: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 14 },
  moyenCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: 10, borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  moyenCardSelectionne: { borderColor: theme.colors.primary, backgroundColor: '#F0F7FF' },
  moyenIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  moyenInfo: { flex: 1 },
  moyenNom: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' },
  radioSelectionne: { borderColor: theme.colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  recapCard: { backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginTop: 8, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  recapTitre: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 },
  recapLigne: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  recapLabel: { fontSize: 13, color: theme.colors.textSecondary },
  recapValeur: { fontSize: 13, fontWeight: '500', color: theme.colors.textPrimary },
  recapSep: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },
  recapTotal: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary },
  recapTotalMontant: { fontSize: 15, fontWeight: '800', color: theme.colors.primary },
  btnPayer: { borderRadius: theme.borderRadius.lg, overflow: 'hidden', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnPayerGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  btnPayerText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  securiteText: { fontSize: 12, color: theme.colors.textLight, textAlign: 'center', marginTop: 12 },
  vide: { alignItems: 'center', marginTop: 40, gap: 12 },
  videText: { fontSize: 14, color: theme.colors.textSecondary },
  historiqueItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  historiqueLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historiqueIcone: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  historiqueMois: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
  historiqueDate: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  historiqueRef: { fontSize: 11, color: theme.colors.textLight, marginTop: 1 },
  historiqueRight: { alignItems: 'flex-end' },
  historiqueMontant: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  histStatut: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  histStatutText: { fontSize: 11, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.lg, paddingBottom: 40, alignItems: 'center' },
  modalSuccess: { marginBottom: 12, marginTop: 8 },
  modalTitre: { fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 8 },
  modalMessage: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  modalDetails: { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, width: '100%', marginBottom: 20 },
  modalLigne: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  modalLabel: { fontSize: 13, color: theme.colors.textSecondary },
  modalValeur: { fontSize: 13, fontWeight: '600', color: theme.colors.textPrimary },
  modalBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.lg, paddingVertical: 14, paddingHorizontal: 40, width: '100%', alignItems: 'center', marginBottom: 10 },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalBtnSec: { paddingVertical: 12 },
  modalBtnSecText: { color: theme.colors.textSecondary, fontSize: 14 },
});
