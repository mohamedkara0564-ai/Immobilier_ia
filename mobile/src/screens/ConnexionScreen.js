import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { useAuth } from '../context/AuthContext';

export default function ConnexionScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [sesouvenir, setSeSouvenir] = useState(false);
  const [chargement, setChargement] = useState(false);
  const { seConnecter } = useAuth();

  const handleConnexion = async () => {
    if (!email.trim() || !motDePasse.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir l\'email et le mot de passe.');
      return;
    }
    setChargement(true);
    try {
      await seConnecter(email.trim(), motDePasse);
      // Navigation automatique grâce au AuthContext
    } catch (error) {
      Alert.alert('Erreur de connexion', error.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <View style={styles.logoIcon}>
          <Ionicons name="home" size={28} color={theme.colors.primary} />
        </View>
        <Text style={styles.logoText}>HomeLink</Text>
        <Text style={styles.headerSubtitle}>Accédez à votre espace locataire</Text>
      </LinearGradient>

      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.formTitle}>Connexion</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email ou téléphone</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="exemple@email.com"
              placeholderTextColor={theme.colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mot de passe</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Votre mot de passe"
              placeholderTextColor={theme.colors.textLight}
              value={motDePasse}
              onChangeText={setMotDePasse}
              secureTextEntry={!motDePasseVisible}
            />
            <TouchableOpacity onPress={() => setMotDePasseVisible(!motDePasseVisible)}>
              <Ionicons name={motDePasseVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setSeSouvenir(!sesouvenir)}>
            <View style={[styles.checkbox, sesouvenir && styles.checkboxChecked]}>
              {sesouvenir && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Se souvenir de moi</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.forgotLink}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btnPrimary, chargement && { opacity: 0.7 }]}
          onPress={handleConnexion}
          disabled={chargement}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#1565C0', '#1E88E5']} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {chargement
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnPrimaryText}>Se connecter</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.separatorRow}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>ou</Text>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.btnSocial}>
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <Text style={styles.btnSocialText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSocial}>
            <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            <Text style={styles.btnSocialText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inscriptionRow}>
          <Text style={styles.inscriptionText}>Vous n'avez pas de compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
            <Text style={styles.inscriptionLink}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  formContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    paddingVertical: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  forgotLink: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  btnPrimary: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: theme.colors.textLight,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: theme.spacing.lg,
  },
  btnSocial: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  btnSocialText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  inscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inscriptionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  inscriptionLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
