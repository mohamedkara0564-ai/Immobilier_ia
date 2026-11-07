import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { inscriptionAPI } from '../services/api';

export default function InscriptionScreen({ navigation }) {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', motDePasse: '', confirmer: '' });
  const [visible, setVisible] = useState(false);
  const [chargement, setChargement] = useState(false);

  const update = (champ, val) => setForm(prev => ({ ...prev, [champ]: val }));

  const handleInscription = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.motDePasse) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (form.motDePasse !== form.confirmer) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.motDePasse.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setChargement(true);
    try {
      await inscriptionAPI(form.nom, form.prenom, form.email, form.motDePasse, form.telephone);
      Alert.alert('Compte créé ✅', 'Votre compte a été créé. Connectez-vous maintenant.', [
        { text: 'Se connecter', onPress: () => navigation.navigate('Connexion') },
      ]);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setChargement(false);
    }
  };

  const champs = [
    { key: 'nom',       label: 'Nom *',       placeholder: 'Votre nom',       keyboard: 'default' },
    { key: 'prenom',    label: 'Prénom *',    placeholder: 'Votre prénom',    keyboard: 'default' },
    { key: 'email',     label: 'Email *',     placeholder: 'exemple@email.com', keyboard: 'email-address' },
    { key: 'telephone', label: 'Téléphone',   placeholder: '+225 07 00 00 00', keyboard: 'phone-pad' },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoIcon}>
          <Ionicons name="home" size={26} color={theme.colors.primary} />
        </View>
        <Text style={styles.logoText}>ImmoIA</Text>
        <Text style={styles.headerSubtitle}>Créez votre espace locataire</Text>
      </LinearGradient>

      <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.formTitle}>Créer un compte</Text>

        {champs.map(({ key, label, placeholder, keyboard }) => (
          <View key={key} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textLight}
                value={form[key]}
                onChangeText={v => update(key, v)}
                keyboardType={keyboard}
                autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
              />
            </View>
          </View>
        ))}

        {/* Mot de passe */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mot de passe *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 caractères"
              placeholderTextColor={theme.colors.textLight}
              value={form.motDePasse}
              onChangeText={v => update('motDePasse', v)}
              secureTextEntry={!visible}
            />
            <TouchableOpacity onPress={() => setVisible(!visible)}>
              <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmer */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirmer le mot de passe *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Répétez votre mot de passe"
              placeholderTextColor={theme.colors.textLight}
              value={form.confirmer}
              onChangeText={v => update('confirmer', v)}
              secureTextEntry={!visible}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btnPrimary, chargement && { opacity: 0.7 }]}
          onPress={handleInscription}
          disabled={chargement}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#1565C0', '#1E88E5']} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {chargement
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnPrimaryText}>Créer mon compte</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.connexionRow}>
          <Text style={styles.connexionText}>Déjà un compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Connexion')}>
            <Text style={styles.connexionLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: 55, paddingBottom: 28, alignItems: 'center', position: 'relative' },
  backBtn: { position: 'absolute', top: 55, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  logoIcon: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  logoText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  formContainer: { flex: 1 },
  formContent: { padding: theme.spacing.lg, paddingBottom: 40 },
  formTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: theme.spacing.lg, marginTop: theme.spacing.sm },
  inputGroup: { marginBottom: theme.spacing.md },
  inputLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderColor: theme.colors.border },
  input: { flex: 1, fontSize: 15, color: theme.colors.textPrimary, paddingVertical: 12 },
  btnPrimary: { borderRadius: theme.borderRadius.lg, overflow: 'hidden', marginBottom: theme.spacing.lg, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnGradient: { paddingVertical: 16, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  connexionRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  connexionText: { fontSize: 14, color: theme.colors.textSecondary },
  connexionLink: { fontSize: 14, color: theme.colors.primary, fontWeight: '700' },
});
