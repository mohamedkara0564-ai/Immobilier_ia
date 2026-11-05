import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const menuItems = [
  {
    id: 'infos',
    label: 'Informations personnelles',
    icon: 'person-outline',
    couleur: '#1565C0',
    bg: '#E3F2FD',
  },
  {
    id: 'contrat',
    label: 'Mon contrat',
    icon: 'document-text-outline',
    couleur: '#7B1FA2',
    bg: '#F3E5F5',
  },
  {
    id: 'securite',
    label: 'Sécurité',
    icon: 'shield-checkmark-outline',
    couleur: '#2E7D32',
    bg: '#E8F5E9',
  },
  {
    id: 'aide',
    label: 'Aide et support',
    icon: 'help-circle-outline',
    couleur: '#E65100',
    bg: '#FFF3E0',
  },
];

export default function ProfilScreen({ navigation }) {
  const [onglet, setOnglet] = useState('profil');
  const [notifActive, setNotifActive] = useState(true);
  const [langue, setLangue] = useState('Français');
  const [modalInfos, setModalInfos] = useState(false);
  const [nom, setNom] = useState('Jean Dupont');
  const [email, setEmail] = useState('jean.dupont@email.com');
  const [telephone, setTelephone] = useState('+225 07 00 00 00');

  const handleDeconnexion = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Splash' }] }),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* En-tête */}
      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitre}>Profil</Text>
          <TouchableOpacity
            style={styles.parametresBtn}
            onPress={() => setOnglet(onglet === 'profil' ? 'parametres' : 'profil')}
          >
            <Ionicons
              name={onglet === 'profil' ? 'settings-outline' : 'person-outline'}
              size={22}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <Text style={styles.nom}>{nom}</Text>
          <Text style={styles.email}>{email}</Text>
          <TouchableOpacity
            style={styles.btnModifier}
            onPress={() => setModalInfos(true)}
          >
            <Ionicons name="pencil-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.btnModifierText}>Modifier</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Onglet Profil */}
        {onglet === 'profil' && (
          <View>
            {/* Carte infos rapides */}
            <View style={styles.infoRapideCard}>
              <View style={styles.infoRapideItem}>
                <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.infoRapideText}>{telephone}</Text>
              </View>
              <View style={styles.infoRapideSep} />
              <View style={styles.infoRapideItem}>
                <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.infoRapideText}>Cocody, Abidjan</Text>
              </View>
            </View>

            {/* Menu */}
            <Text style={styles.sectionTitre}>Mon espace</Text>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.menuItem} activeOpacity={0.8}>
                <View style={[styles.menuIcone, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={20} color={item.couleur} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} />
              </TouchableOpacity>
            ))}

            {/* Déconnexion */}
            <TouchableOpacity style={styles.menuItemDeconnexion} onPress={handleDeconnexion} activeOpacity={0.8}>
              <View style={[styles.menuIcone, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.colors.error }]}>Déconnexion</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Onglet Paramètres */}
        {onglet === 'parametres' && (
          <View>
            <Text style={styles.sectionTitre}>Compte</Text>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
              <View style={[styles.menuIcone, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.menuLabel}>Changer de mot de passe</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} />
            </TouchableOpacity>

            {/* Toggle Notifications */}
            <View style={styles.menuItemToggle}>
              <View style={[styles.menuIcone, { backgroundColor: '#FFFDE7' }]}>
                <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.menuLabel}>Notifications</Text>
              <Switch
                value={notifActive}
                onValueChange={setNotifActive}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                thumbColor={notifActive ? theme.colors.primary : theme.colors.textLight}
              />
            </View>

            {/* Langue */}
            <View style={styles.menuItemToggle}>
              <View style={[styles.menuIcone, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="language-outline" size={20} color="#2E7D32" />
              </View>
              <Text style={styles.menuLabel}>Langue</Text>
              <Text style={styles.langueValeur}>{langue}</Text>
            </View>

            <Text style={styles.sectionTitre}>Support</Text>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
              <View style={[styles.menuIcone, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="help-buoy-outline" size={20} color="#E65100" />
              </View>
              <Text style={styles.menuLabel}>Centre d'aide</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
              <View style={[styles.menuIcone, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="chatbubble-outline" size={20} color="#7B1FA2" />
              </View>
              <Text style={styles.menuLabel}>Nous contacter</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} />
            </TouchableOpacity>

            {/* Se déconnecter */}
            <TouchableOpacity
              style={styles.btnDeconnexion}
              onPress={handleDeconnexion}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={18} color={theme.colors.white} />
              <Text style={styles.btnDeconnexionText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal modifier infos */}
      <Modal
        visible={modalInfos}
        transparent
        animationType="slide"
        onRequestClose={() => setModalInfos(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitre}>Modifier le profil</Text>
              <TouchableOpacity onPress={() => setModalInfos(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {[
              { label: 'Nom complet', value: nom, setter: setNom, keyboard: 'default' },
              { label: 'Email', value: email, setter: setEmail, keyboard: 'email-address' },
              { label: 'Téléphone', value: telephone, setter: setTelephone, keyboard: 'phone-pad' },
            ].map((field, i) => (
              <View key={i} style={styles.modalField}>
                <Text style={styles.modalLabel}>{field.label}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType={field.keyboard}
                  autoCapitalize="none"
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setModalInfos(false)}
            >
              <LinearGradient
                colors={['#1565C0', '#1E88E5']}
                style={styles.modalBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.modalBtnText}>Enregistrer</Text>
              </LinearGradient>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitre: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.white,
  },
  parametresBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.white,
  },
  nom: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 12,
  },
  btnModifier: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    gap: 6,
  },
  btnModifierText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  infoRapideCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRapideItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  infoRapideText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  infoRapideSep: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
    marginHorizontal: 8,
  },
  sectionTitre: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  menuItemDeconnexion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  menuItemToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  menuIcone: {
    width: 40,
    height: 40,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  langueValeur: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  btnDeconnexion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    gap: 8,
    marginTop: theme.spacing.md,
  },
  btnDeconnexionText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitre: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  modalField: {
    marginBottom: theme.spacing.md,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 13,
    fontSize: 14,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalBtn: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginTop: 8,
  },
  modalBtnGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalBtnText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
