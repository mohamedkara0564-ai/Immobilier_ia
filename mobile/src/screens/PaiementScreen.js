import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Modal, ActivityIndicator, TextInput,
  Linking, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import theme from '../theme';
import { useAuth } from '../context/AuthContext';
import {
  mesPaiementsAPI,
  effectuerPaiementAPI,
  initierPaiementSasPayAPI,
  verifierPaiementSasPayAPI,
} from '../services/api';

// Réseaux Mobile Money disponibles (network SasPay + country ISO)
const reseauxMobile = [
  { id: 'orange_ci', label: 'Orange Money CI',  country: 'CI', couleur: '#FF6B00', bg: '#FFF3E0' },
  { id: 'mtn_ci',    label: 'MTN MoMo CI',      country: 'CI', couleur: '#FFC107', bg: '#FFFDE7' },
  { id: 'wave_ci',   label: 'Wave CI',           country: 'CI', couleur: '#00BCD4', bg: '#E0F7FA' },
];

const moyensPaiement = [
  { id: 'mobile_money', nom: 'Mobile Money',   icon: 'phone-portrait-outline', couleur: '#10B981', bg: '#ECFDF5', type: 'saspay' },
  { id: 'carte',        nom: 'Carte bancaire', icon: 'card-outline',           couleur: '#1565C0', bg: '#E3F2FD', type: 'simule' },
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

  // États principaux
  const [moyenSelectionne, setMoyenSelectionne]   = useState('mobile_money');
  const [reseauSelectionne, setReseauSelectionne] = useState('orange_ci');
  const [onglet, setOnglet]                       = useState('payer');
  const [paiements, setPaiements]                 = useState([]);
  const [chargement, setChargement]               = useState(false);
  const [paiementEnCours, setPaiementEnCours]     = useState(false);

  // États SasPay
  const [telephone, setTelephone]                 = useState('');
  const [modalTelephone, setModalTelephone]       = useState(false);
  const [modalAttente, setModalAttente]           = useState(false);
  const [paymentIdSasPay, setPaymentIdSasPay]     = useState(null);
  const [idPaiementLocal, setIdPaiementLocal]     = useState(null);
  const [checkoutUrl, setCheckoutUrl]             = useState(null);

  // Modal confirmation finale
  const [modalVisible, setModalVisible]           = useState(false);
  const [dernierPaiement, setDernierPaiement]     = useState(null);

  useFocusEffect(useCallback(() => { chargerPaiements(); }, []));

  const chargerPaiements = async () => {
    try {
      setChargement(true);
      const data = await mesPaiementsAPI(token);
      setPaiements(data);
    } catch (e) {
      console.error('Erreur paiements:', e);
    } finally {
      setChargement(false);
    }
  };

  // ── Lancer le paiement ──────────────────────────────────────────────────
  const handlePayer = () => {
    if (!location) {
      Alert.alert('Aucune location', 'Vous n\'avez pas de location active.');
      return;
    }
    const moyen = moyensPaiement.find(m => m.id === moyenSelectionne);
    if (moyen && moyen.type === 'saspay') {
      setModalTelephone(true);
    } else {
      payerSimule();
    }
  };

  // ── Paiement Mobile Money via SasPay ────────────────────────────────────
  const lancerPaiementMobile = async () => {
    if (!telephone.trim() || telephone.trim().length < 8) {
      Alert.alert('Numéro invalide', 'Veuillez saisir un numéro de téléphone valide.');
      return;
    }
    setModalTelephone(false);
    setPaiementEnCours(true);

    try {
      const reseau = reseauxMobile.find(r => r.id === reseauSelectionne);
      const resultat = await initierPaiementSasPayAPI(
        token,
        location.id,
        reseauSelectionne,
        reseau.country,
        telephone.trim(),
        moisActuel()
      );

      setPaymentIdSasPay(resultat.payment_id);
      setIdPaiementLocal(resultat.id_paiement_local);

      // Si SasPay renvoie une checkout_url → ouvrir dans le navigateur
      if (resultat.checkout_url) {
        setCheckoutUrl(resultat.checkout_url);
        await Linking.openURL(resultat.checkout_url);
      }

      setModalAttente(true);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setPaiementEnCours(false);
    }
  };

  // ── Vérifier le statut après confirmation ───────────────────────────────
  const verifierStatut = async () => {
    if (!paymentIdSasPay) return;
    setPaiementEnCours(true);

    try {
      const resultat = await verifierPaiementSasPayAPI(token, paymentIdSasPay, idPaiementLocal);

      if (resultat.statut === 'SUCCESS') {
        setModalAttente(false);
        setDernierPaiement({
          montant: location.montant_loyer,
          mois_concerne: moisActuel(),
          reference: paymentIdSasPay,
          date_paiement: new Date().toISOString(),
          net_amount: resultat.net_amount,
        });
        setModalVisible(true);
        chargerPaiements();
      } else if (resultat.statut === 'FAILED') {
        setModalAttente(false);
        Alert.alert('Paiement échoué', 'Le paiement n\'a pas abouti. Vous pouvez réessayer.');
      } else {
        // PENDING → encore en attente
        Alert.alert('En attente', 'Le paiement est toujours en cours. Confirmez sur votre téléphone avec votre PIN, puis réessayez.');
      }
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setPaiementEnCours(false);
    }
  };

  // ── Paiement simulé (carte bancaire) ────────────────────────────────────
  const payerSimule = async () => {
    if (!location) {
      Alert.alert('Aucune location', 'Vous n\'avez pas de location active.');
      return;
    }
    setPaiementEnCours(true);
    try {
      const resultat = await effectuerPaiementAPI(
        token,
        location.id,
        location.montant_loyer,
        'carte',
        moisActuel()
      );
      setDernierPaiement(resultat);
      setModalVisible(true);
      chargerPaiements();
    } catch (e) {
      console.error('Erreur payer simule:', e);
      Alert.alert('Erreur', e.message);
    } finally {
      setPaiementEnCours(false);
    }
  };

  const formaterDate = (date) =>
    date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '---';

  const reseauActuel = reseauxMobile.find(r => r.id === reseauSelectionne);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* En-tête */}
      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <Text style={styles.headerTitre}>Paiement du loyer</Text>
        <View style={styles.loyerCard}>
          <Text style={styles.loyerLabel}>Loyer — {moisActuel()}</Text>
          <Text style={styles.loyerMontant}>{formaterPrix(location?.montant_loyer)}</Text>
          <View style={styles.echeanceRow}>
            <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.75)" />
            <Text style={styles.echeanceText}>
              Échéance : {formaterDate(location?.date_fin)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Onglets */}
      <View style={styles.ongletsContainer}>
        {[{ id: 'payer', label: 'Payer' }, { id: 'historique', label: 'Historique' }].map(o => (
          <TouchableOpacity
            key={o.id}
            style={[styles.onglet, onglet === o.id && styles.ongletActif]}
            onPress={() => setOnglet(o.id)}
          >
            <Text style={[styles.ongletText, onglet === o.id && styles.ongletTextActif]}>
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Onglet Payer ── */}
        {onglet === 'payer' && (
          <View>
            <Text style={styles.sectionTitre}>Moyen de paiement</Text>

            {moyensPaiement.map(moyen => (
              <TouchableOpacity
                key={moyen.id}
                style={[styles.moyenCard, moyenSelectionne === moyen.id && styles.moyenCardSelectionne]}
                onPress={() => setMoyenSelectionne(moyen.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.moyenIcone, { backgroundColor: moyen.bg }]}>
                  <Ionicons name={moyen.icon} size={24} color={moyen.couleur} />
                </View>
                <View style={styles.moyenInfo}>
                  <Text style={styles.moyenNom}>{moyen.nom}</Text>
                  {moyen.type === 'saspay' && (
                    <Text style={styles.moyenSous}>Orange, MTN, Wave…</Text>
                  )}
                </View>
                <View style={[styles.radio, moyenSelectionne === moyen.id && styles.radioActif]}>
                  {moyenSelectionne === moyen.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}

            {/* Sélecteur de réseau si Mobile Money */}
            {moyenSelectionne === 'mobile_money' && (
              <View style={styles.reseauxContainer}>
                <Text style={styles.reseauxTitre}>Choisir le réseau</Text>
                {reseauxMobile.map(r => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.reseauItem, reseauSelectionne === r.id && styles.reseauItemActif]}
                    onPress={() => setReseauSelectionne(r.id)}
                  >
                    <View style={[styles.reseauIcone, { backgroundColor: r.bg }]}>
                      <Ionicons name="phone-portrait-outline" size={18} color={r.couleur} />
                    </View>
                    <Text style={styles.reseauLabel}>{r.label}</Text>
                    {reseauSelectionne === r.id && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Récapitulatif */}
            <View style={styles.recapCard}>
              <Text style={styles.recapTitre}>Récapitulatif</Text>
              <View style={styles.recapLigne}>
                <Text style={styles.recapLabel}>Loyer {moisActuel()}</Text>
                <Text style={styles.recapValeur}>{formaterPrix(location?.montant_loyer)}</Text>
              </View>
              <View style={styles.recapLigne}>
                <Text style={styles.recapLabel}>Frais de service</Text>
                <Text style={styles.recapValeur}>Inclus</Text>
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
            <Text style={styles.securite}>🔒 Paiement sécurisé via SasPay</Text>
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
              paiements.map(p => {
                const estPaye = p.statut === 'payé';
                return (
                  <View key={p.id} style={styles.histItem}>
                    <View style={styles.histLeft}>
                      <View style={[styles.histIcone, { backgroundColor: estPaye ? '#ECFDF5' : '#FFF3E0' }]}>
                        <Ionicons name="receipt-outline" size={20} color={estPaye ? theme.colors.success : theme.colors.warning} />
                      </View>
                      <View>
                        <Text style={styles.histMois}>{p.mois_concerne}</Text>
                        <Text style={styles.histDate}>{formaterDate(p.date_paiement)}</Text>
                        <Text style={styles.histRef}>#{p.reference?.substring(0, 12)}</Text>
                      </View>
                    </View>
                    <View style={styles.histRight}>
                      <Text style={styles.histMontant}>{formaterPrix(p.montant)}</Text>
                      <View style={[styles.histStatut, { backgroundColor: estPaye ? '#ECFDF5' : '#FFF3E0' }]}>
                        <Text style={[styles.histStatutText, { color: estPaye ? theme.colors.success : theme.colors.warning }]}>
                          {estPaye ? 'Payé' : 'En attente'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Modal saisie numéro ── */}
      <Modal visible={modalTelephone} transparent animationType="slide" onRequestClose={() => setModalTelephone(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitre}>Numéro {reseauActuel?.label}</Text>
              <Text style={styles.modalMessage}>
                Entrez le numéro associé à votre compte {reseauActuel?.label}.
              </Text>
              <View style={styles.telWrapper}>
                <TextInput
                  style={styles.telInput}
                  placeholder="+225 07 00 00 00"
                  placeholderTextColor={theme.colors.textLight}
                  value={telephone}
                  onChangeText={setTelephone}
                  keyboardType="phone-pad"
                  autoFocus
                />
              </View>
              <TouchableOpacity style={styles.modalBtn} onPress={lancerPaiementMobile}>
                <Text style={styles.modalBtnText}>Envoyer la demande</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSec} onPress={() => setModalTelephone(false)}>
                <Text style={styles.modalBtnSecText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal attente confirmation ── */}
      <Modal visible={modalAttente} transparent animationType="slide" onRequestClose={() => setModalAttente(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="phone-portrait-outline" size={56} color={theme.colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitre}>Confirmez sur votre téléphone</Text>
            <Text style={styles.modalMessage}>
              {checkoutUrl
                ? 'La page de paiement a été ouverte. Complétez le paiement puis appuyez sur "J\'ai payé".'
                : `Une demande a été envoyée au ${telephone}. Entrez votre PIN ${reseauActuel?.label} pour confirmer.`
              }
            </Text>
            {paiementEnCours
              ? <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 16 }} />
              : (
                <TouchableOpacity style={styles.modalBtn} onPress={verifierStatut}>
                  <Text style={styles.modalBtnText}>J'ai confirmé le paiement</Text>
                </TouchableOpacity>
              )
            }
            <TouchableOpacity style={styles.modalBtnSec} onPress={() => setModalAttente(false)}>
              <Text style={styles.modalBtnSecText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Modal succès ── */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} style={{ marginBottom: 8 }} />
            <Text style={styles.modalTitre}>Paiement confirmé !</Text>
            <Text style={styles.modalMessage}>
              Votre loyer de {formaterPrix(dernierPaiement?.montant)} pour {dernierPaiement?.mois_concerne} a bien été reçu.
            </Text>
            {dernierPaiement && (
              <View style={styles.recapCard}>
                {[
                  { l: 'Référence', v: `#${dernierPaiement.reference?.substring(0, 14)}` },
                  { l: 'Date',      v: formaterDate(dernierPaiement.date_paiement) },
                  { l: 'Montant net', v: dernierPaiement.net_amount ? formaterPrix(dernierPaiement.net_amount) : formaterPrix(dernierPaiement.montant) },
                ].map((r, i) => (
                  <View key={i} style={styles.recapLigne}>
                    <Text style={styles.recapLabel}>{r.l}</Text>
                    <Text style={styles.recapValeur}>{r.v}</Text>
                  </View>
                ))}
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
  echeanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  echeanceText: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  ongletsContainer: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: theme.spacing.lg, marginTop: -1, borderRadius: theme.borderRadius.md, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, marginBottom: 8 },
  onglet: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: theme.borderRadius.sm },
  ongletActif: { backgroundColor: theme.colors.primary },
  ongletText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  ongletTextActif: { color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 40 },
  sectionTitre: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 14 },
  moyenCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: 10, borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  moyenCardSelectionne: { borderColor: theme.colors.primary, backgroundColor: '#F0F7FF' },
  moyenIcone: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  moyenInfo: { flex: 1 },
  moyenNom: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
  moyenSous: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' },
  radioActif: { borderColor: theme.colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  reseauxContainer: { backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  reseauxTitre: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 10 },
  reseauItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 10 },
  reseauItemActif: { backgroundColor: '#F0F7FF', borderRadius: 8, paddingHorizontal: 8 },
  reseauIcone: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  reseauLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: theme.colors.textPrimary },
  recapCard: { backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
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
  securite: { fontSize: 12, color: theme.colors.textLight, textAlign: 'center', marginTop: 12 },
  vide: { alignItems: 'center', marginTop: 40, gap: 12 },
  videText: { fontSize: 14, color: theme.colors.textSecondary },
  histItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  histLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  histIcone: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  histMois: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
  histDate: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  histRef: { fontSize: 11, color: theme.colors.textLight, marginTop: 1 },
  histRight: { alignItems: 'flex-end' },
  histMontant: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  histStatut: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  histStatutText: { fontSize: 11, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.lg, paddingBottom: 40, alignItems: 'center' },
  modalTitre: { fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  telWrapper: { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, width: '100%', marginBottom: 16 },
  telInput: { padding: 14, fontSize: 16, color: theme.colors.textPrimary },
  modalBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.lg, paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 10 },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalBtnSec: { paddingVertical: 12 },
  modalBtnSecText: { color: theme.colors.textSecondary, fontSize: 14 },
});
