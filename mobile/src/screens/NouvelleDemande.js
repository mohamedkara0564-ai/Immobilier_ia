import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { useAuth } from '../context/AuthContext';
import { creerDemandeAPI } from '../services/api';

const typesDemande = [
  { id: 'plomberie',   label: 'Problème de plomberie', icon: 'water-outline',        couleur: '#1565C0' },
  { id: 'electricite', label: 'Panne électrique',      icon: 'flash-outline',        couleur: '#F59E0B' },
  { id: 'reparation',  label: 'Demande de réparation', icon: 'construct-outline',    couleur: '#10B981' },
  { id: 'securite',    label: 'Problème de sécurité',  icon: 'shield-outline',       couleur: '#EF4444' },
  { id: 'autre',       label: 'Autre demande',         icon: 'help-circle-outline',  couleur: '#6B7280' },
];

export default function NouvelleDemande({ navigation }) {
  const { token, location } = useAuth();
  const [typeSelectionne, setTypeSelectionne] = useState(null);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const handleEnvoyer = async () => {
    if (!typeSelectionne) {
      Alert.alert('Type requis', 'Veuillez sélectionner un type de demande.');
      return;
    }
    if (!titre.trim()) {
      Alert.alert('Titre requis', 'Veuillez saisir un titre pour votre demande.');
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert('Description requise', 'Décrivez votre problème (10 caractères minimum).');
      return;
    }

    setEnvoi(true);
    try {
      const type = typesDemande.find(t => t.id === typeSelectionne);
      await creerDemandeAPI(
        token,
        titre.trim(),
        description.trim(),
        typeSelectionne,
        location?.id_logement || null
      );
      Alert.alert(
        'Demande envoyée ✅',
        'Votre demande a bien été transmise. Vous recevrez une réponse sous 24h.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Erreur', e.message || 'Impossible d\'envoyer la demande.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitre}>Nouvelle demande</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Titre */}
        <Text style={styles.sectionTitre}>Titre de la demande</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ex: Fuite d'eau dans la salle de bain"
            placeholderTextColor={theme.colors.textLight}
            value={titre}
            onChangeText={setTitre}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <Text style={styles.sectionTitre}>Description du problème</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Décrivez votre problème en détail..."
            placeholderTextColor={theme.colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.compteur}>{description.length}/500</Text>
        </View>

        {/* Type */}
        <Text style={styles.sectionTitre}>Type de demande</Text>
        <View style={styles.typesGrid}>
          {typesDemande.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeItem, typeSelectionne === type.id && styles.typeItemSelectionne]}
              onPress={() => setTypeSelectionne(type.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.typeIcone, { backgroundColor: typeSelectionne === type.id ? type.couleur : type.couleur + '20' }]}>
                <Ionicons name={type.icon} size={22} color={typeSelectionne === type.id ? '#fff' : type.couleur} />
              </View>
              <Text style={[styles.typeLabel, typeSelectionne === type.id && { color: type.couleur, fontWeight: '700' }]}>
                {type.label}
              </Text>
              {typeSelectionne === type.id && (
                <View style={[styles.typeCheck, { backgroundColor: type.couleur }]}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Photo optionnelle */}
        <Text style={styles.sectionTitre}>
          Photo <Text style={styles.optionnel}>(optionnel)</Text>
        </Text>
        <TouchableOpacity style={styles.photoBtn}>
          <Ionicons name="camera-outline" size={28} color={theme.colors.textSecondary} />
          <Text style={styles.photoBtnText}>Appuyer pour ajouter une photo</Text>
          <Text style={styles.photoBtnSub}>JPG, PNG — max 5 Mo</Text>
        </TouchableOpacity>

        {/* Bouton envoyer */}
        <TouchableOpacity
          style={[styles.btnEnvoyer, envoi && { opacity: 0.7 }]}
          onPress={handleEnvoyer}
          disabled={envoi}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#1565C0', '#1E88E5']} style={styles.btnEnvoyerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {envoi
              ? <ActivityIndicator color="#fff" />
              : <><Ionicons name="send-outline" size={18} color="#fff" /><Text style={styles.btnEnvoyerText}>Envoyer la demande</Text></>
            }
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: 55, paddingBottom: 16, paddingHorizontal: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitre: { fontSize: 18, fontWeight: '700', color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 40 },
  sectionTitre: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 10, marginTop: 8 },
  optionnel: { fontWeight: '400', color: theme.colors.textSecondary, fontSize: 13 },
  inputWrapper: { backgroundColor: '#fff', borderRadius: theme.borderRadius.md, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.lg },
  input: { fontSize: 14, color: theme.colors.textPrimary, paddingVertical: 12 },
  inputContainer: { backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: 4, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
  textArea: { padding: 12, fontSize: 14, color: theme.colors.textPrimary, minHeight: 120 },
  compteur: { textAlign: 'right', fontSize: 11, color: theme.colors.textLight, paddingRight: 12, paddingBottom: 8 },
  typesGrid: { gap: 10, marginBottom: theme.spacing.lg },
  typeItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: theme.borderRadius.md, padding: 14, gap: 12, borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, position: 'relative' },
  typeItemSelectionne: { borderColor: theme.colors.primary, backgroundColor: '#F0F7FF' },
  typeIcone: { width: 42, height: 42, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  typeLabel: { fontSize: 14, fontWeight: '500', color: theme.colors.textPrimary, flex: 1 },
  typeCheck: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  photoBtn: { backgroundColor: '#fff', borderRadius: theme.borderRadius.md, borderWidth: 2, borderColor: theme.colors.border, borderStyle: 'dashed', padding: 24, alignItems: 'center', gap: 8, marginBottom: theme.spacing.lg },
  photoBtnText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '500' },
  photoBtnSub: { fontSize: 12, color: theme.colors.textLight },
  btnEnvoyer: { borderRadius: theme.borderRadius.lg, overflow: 'hidden', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnEnvoyerGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  btnEnvoyerText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
