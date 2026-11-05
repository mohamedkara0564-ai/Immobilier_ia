import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const { width } = Dimensions.get('window');

const moyensPaiement = [
  {
    id: 'orange',
    nom: 'Orange Money',
    description: 'Paiement via Orange Money',
    icon: 'phone-portrait-outline',
    couleur: '#FF6B00',
    bg: '#FFF3E0',
  },
  {
    id: 'mtn',
    nom: 'MTN Mobile Money',
    description: 'Paiement via MTN MoMo',
    icon: 'phone-portrait-outline',
    couleur: '#FFC107',
    bg: '#FFFDE7',
  },
  {
    id: 'carte',
    nom: 'Carte bancaire',
    description: 'Visa / Mastercard',
    icon: 'card-outline',
    couleur: '#1565C0',
    bg: '#E3F2FD',
  },
];

const historiqueData = [
  { mois: 'Mai 2025',    montant: '650 000 FCFA', statut: 'Payé',    date: '02 mai 2025',    couleur: theme.colors.success },
  { mois: 'Avril 2025',  montant: '650 000 FCFA', statut: 'Payé',    date: '01 avr. 2025',   couleur: theme.colors.success },
  { mois: 'Mars 2025',   montant: '650 000 FCFA', statut: 'Payé',    date: '03 mars 2025',   couleur: theme.colors.success },
  { mois: 'Février 2025',montant: '650 000 FCFA', statut: 'En retard',date: '12 fév. 2025',  couleur: theme.colors.error },
];

export default function PaiementScreen() {
  const [moyenSelectionne, setMoyenSelectionne] = useState('orange');
  const [onglet, setOnglet] = useState('payer');
  const [modalVisible, setModalVisible] = useState(false);

  const handlePayer = () => {
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* En-tête */}
      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <Text style={styles.headerTitre}>Paiement du loyer</Text>

        {/* Carte loyer */}
        <View style={styles.loyerCard}>
          <Text style={styles.loyerLabel}>Loyer du mois de mai 2025</Text>
          <Text style={styles.loyerMontant}>650 000 FCFA</Text>
          <View style={styles.loyerEcheance}>
            <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.75)" />
            <Text style={styles.loyerEcheanceText}>Échéance : 5 mai 2025</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Onglets */}
      <View style={styles.ongletsContainer}>
        <TouchableOpacity
          style={[styles.onglet, onglet === 'payer' && styles.ongletActif]}
          onPress={() => setOnglet('payer')}
        >
          <Text style={[styles.ongletText, onglet === 'payer' && styles.ongletTextActif]}>
            Payer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.onglet, onglet === 'historique' && styles.ongletActif]}
          onPress={() => setOnglet('historique')}
        >
          <Text style={[styles.ongletText, onglet === 'historique' && styles.ongletTextActif]}>
            Historique
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Onglet Payer */}
        {onglet === 'payer' && (
          <View>
            <Text style={styles.sectionTitre}>Choisir un moyen de paiement</Text>

            {moyensPaiement.map((moyen) => (
              <TouchableOpacity
                key={moyen.id}
                style={[
                  styles.moyenCard,
                  moyenSelectionne === moyen.id && styles.moyenCardSelectionne,
                ]}
                onPress={() => setMoyenSelectionne(moyen.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.moyenIcon, { backgroundColor: moyen.bg }]}>
                  <Ionicons name={moyen.icon} size={24} color={moyen.couleur} />
                </View>
                <View style={styles.moyenInfo}>
                  <Text style={styles.moyenNom}>{moyen.nom}</Text>
                  <Text style={styles.moyenDescription}>{moyen.description}</Text>
                </View>
                <View style={[
                  styles.radio,
                  moyenSelectionne === moyen.id && styles.radioSelectionne,
                ]}>
                  {moyenSelectionne === moyen.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}

            {/* Récapitulatif */}
            <View style={styles.recapCard}>
              <Text style={styles.recapTitre}>Récapitulatif</Text>
              <View style={styles.recapLigne}>
                <Text style={styles.recapLabel}>Loyer mai 2025</Text>
                <Text style={styles.recapValeur}>650 000 FCFA</Text>
              </View>
              <View style={styles.recapLigne}>
                <Text style={styles.recapLabel}>Frais de service</Text>
                <Text style={styles.recapValeur}>0 FCFA</Text>
              </View>
              <View style={styles.recapSeparateur} />
              <View style={styles.recapLigne}>
                <Text style={styles.recapTotal}>Total</Text>
                <Text style={styles.recapTotalMontant}>650 000 FCFA</Text>
              </View>
            </View>

            {/* Bouton payer */}
            <TouchableOpacity
              style={styles.btnPayer}
              onPress={handlePayer}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#1565C0', '#1E88E5']}
                style={styles.btnPayerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="lock-closed" size={16} color={theme.colors.white} />
                <Text style={styles.btnPayerText}>Payer maintenant</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.securiteText}>🔒 Paiement 100% sécurisé</Text>
          </View>
        )}

        {/* Onglet Historique */}
        {onglet === 'historique' && (
          <View>
            <Text style={styles.sectionTitre}>Historique des paiements</Text>
            {historiqueData.map((item, i) => (
              <View key={i} style={styles.historiqueItem}>
                <View style={styles.historiqueLeft}>
                  <View style={[styles.historiqueIcone, { backgroundColor: item.couleur + '20' }]}>
                    <Ionicons name="receipt-outline" size={20} color={item.couleur} />
                  </View>
                  <View>
                    <Text style={styles.historiqueMois}>{item.mois}</Text>
                    <Text style={styles.historiqueDate}>{item.date}</Text>
                  </View>
                </View>
                <View style={styles.historiqueRight}>
                  <Text style={styles.historiqueMontant}>{item.montant}</Text>
                  <View style={[styles.histStatut, { backgroundColor: item.couleur + '20' }]}>
                    <Text style={[styles.histStatutText, { color: item.couleur }]}>{item.statut}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal confirmation */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalSuccess}>
              <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
            </View>
            <Text style={styles.modalTitre}>Paiement confirmé !</Text>
            <Text style={styles.modalMessage}>
              Votre loyer de 650 000 FCFA pour le mois de mai 2025 a bien été reçu.
            </Text>
            <View style={styles.modalDetails}>
              <View style={styles.modalLigne}>
                <Text style={styles.modalLabel}>Référence</Text>
                <Text style={styles.modalValeur}>#PAY-2025-0501</Text>
              </View>
              <View style={styles.modalLigne}>
                <Text style={styles.modalLabel}>Date</Text>
                <Text style={styles.modalValeur}>5 mai 2025</Text>
              </View>
              <View style={styles.modalLigne}>
                <Text style={styles.modalLabel}>Moyen</Text>
                <Text style={styles.modalValeur}>
                  {moyensPaiement.find(m => m.id === moyenSelectionne)?.nom}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Télécharger le reçu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnSecondaire}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnSecondaireText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  headerTitre: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 16,
  },
  loyerCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  loyerLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  loyerMontant: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: 6,
  },
  loyerEcheance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loyerEcheanceText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  ongletsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginTop: -1,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 8,
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
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  ongletTextActif: {
    color: theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 30,
  },
  sectionTitre: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 14,
  },
  moyenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  moyenCardSelectionne: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F7FF',
  },
  moyenIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moyenInfo: {
    flex: 1,
  },
  moyenNom: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  moyenDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelectionne: {
    borderColor: theme.colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  recapCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  recapTitre: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  recapLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recapLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  recapValeur: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  recapSeparateur: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  recapTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  recapTotalMontant: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  btnPayer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnPayerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  btnPayerText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  securiteText: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: 12,
  },
  historiqueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  historiqueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historiqueIcone: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historiqueMois: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  historiqueDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  historiqueRight: {
    alignItems: 'flex-end',
  },
  historiqueMontant: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  histStatut: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  histStatutText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalSuccess: {
    marginBottom: 12,
    marginTop: 8,
  },
  modalTitre: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalDetails: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    width: '100%',
    marginBottom: 20,
  },
  modalLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  modalValeur: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  modalBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalBtnText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  modalBtnSecondaire: {
    paddingVertical: 12,
  },
  modalBtnSecondaireText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});
