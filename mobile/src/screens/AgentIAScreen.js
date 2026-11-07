import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, FlatList, KeyboardAvoidingView, Platform,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { useAuth } from '../context/AuthContext';
import {
  mesConversationsAPI,
  creerConversationAPI,
  envoyerMessageAPI,
  historiqueMessagesAPI,
} from '../services/api';

const { width } = Dimensions.get('window');

const suggestions = [
  'Quand payer mon prochain loyer ?',
  'Informations sur mon contrat',
  'Signaler un problème',
  'Contacter mon propriétaire',
];

export default function AgentIAScreen() {
  const { token, utilisateur } = useAuth();
  const [messages, setMessages] = useState([]);
  const [saisie, setSaisie] = useState('');
  const [enAttente, setEnAttente] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [convId, setConvId] = useState(null);
  const flatListRef = useRef(null);

  // Charger ou créer une conversation au montage
  useEffect(() => {
    const initialiser = async () => {
      try {
        let conv;
        // Tenter de récupérer les conversations existantes
        try {
          const convs = await mesConversationsAPI(token);
          if (convs.length > 0) {
            conv = convs[convs.length - 1];
            try {
              const msgs = await historiqueMessagesAPI(token, conv.id);
              setMessages(msgs.length > 0 ? msgs : [messageAccueil()]);
            } catch {
              setMessages([messageAccueil()]);
            }
          } else {
            conv = await creerConversationAPI(token);
            setMessages([messageAccueil()]);
          }
        } catch {
          // Si la récupération échoue, créer une nouvelle conversation
          conv = await creerConversationAPI(token);
          setMessages([messageAccueil()]);
        }
        setConvId(conv.id);
      } catch (e) {
        console.error('Erreur initialisation IA:', e?.message || e);
        // Mode hors-ligne : garder l'accueil sans convId
        setMessages([messageAccueil()]);
      } finally {
        setChargement(false);
      }
    };
    if (token) initialiser();
  }, [token]);

  const messageAccueil = () => ({
    id: 'accueil',
    role: 'ia',
    contenu: `Bonjour ${utilisateur?.prenom || ''} ! 👋\nJe suis votre assistant ImmoIA. Comment puis-je vous aider aujourd'hui ?`,
    horodatage: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  });

  const envoyerMessage = async (texte) => {
    const messageTexte = texte || saisie.trim();
    if (!messageTexte || enAttente) return;

    const heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Affiche immédiatement le message utilisateur
    const msgUser = { id: Date.now().toString(), role: 'utilisateur', contenu: messageTexte, horodatage: heure };
    setMessages(prev => [...prev, msgUser]);
    setSaisie('');
    setEnAttente(true);

    try {
      // Si pas de convId, en créer une maintenant
      let idConv = convId;
      if (!idConv) {
        const nouvelleConv = await creerConversationAPI(token);
        idConv = nouvelleConv.id;
        setConvId(idConv);
      }
      const reponse = await envoyerMessageAPI(token, idConv, messageTexte);
      setMessages(prev => [...prev, reponse]);
    } catch (e) {
      console.error('Erreur envoi message IA:', e?.message || e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ia',
        contenu: 'Désolé, je rencontre un problème de connexion. Vérifiez que le backend est démarré.',
        horodatage: heure,
      }]);
    } finally {
      setEnAttente(false);
    }
  };

  const renderMessage = ({ item }) => {
    const estUser = item.role === 'utilisateur';
    return (
      <View style={[styles.messageRow, estUser && styles.messageRowDroit]}>
        {!estUser && (
          <View style={styles.iaAvatar}>
            <Ionicons name="hardware-chip" size={16} color={theme.colors.white} />
          </View>
        )}
        <View style={[styles.bulle, estUser ? styles.bulleUser : styles.bulleIA]}>
          <Text style={[styles.bulleTexte, estUser && styles.bulleTexteUser]}>
            {item.contenu}
          </Text>
          <Text style={[styles.bulleHeure, estUser && styles.bulleHeureUser]}>
            {item.horodatage}
          </Text>
        </View>
      </View>
    );
  };

  if (chargement) {
    return (
      <View style={styles.chargement}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.chargementText}>Chargement de la conversation...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* En-tête */}
      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iaInfo}>
            <View style={styles.iaIconContainer}>
              <Ionicons name="hardware-chip" size={26} color={theme.colors.white} />
              <View style={styles.onlineIndicator} />
            </View>
            <View>
              <Text style={styles.iaNom}>Agent IA</Text>
              <Text style={styles.iaStatut}>● En ligne</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={async () => {
              try {
                setChargement(true);
                const conv = await creerConversationAPI(token);
                setConvId(conv.id);
                setMessages([messageAccueil()]);
              } catch (e) {
                console.error('Erreur création conversation:', e);
              } finally {
                setChargement(false);
              }
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          enAttente ? (
            <View style={styles.messageRow}>
              <View style={styles.iaAvatar}>
                <Ionicons name="hardware-chip" size={16} color={theme.colors.white} />
              </View>
              <View style={[styles.bulleIA, { paddingHorizontal: 16 }]}>
                <View style={styles.typing}>
                  {[0, 1, 2].map(i => <View key={i} style={styles.typingDot} />)}
                </View>
              </View>
            </View>
          ) : null
        }
      />

      {/* Suggestions */}
      {messages.length <= 1 && (
        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>Suggestions :</Text>
          <View style={styles.suggestionsRow}>
            {suggestions.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestion} onPress={() => envoyerMessage(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Saisie */}
      <View style={styles.saisieContainer}>
        <View style={styles.saisieWrapper}>
          <TextInput
            style={styles.saisieInput}
            placeholder="Écrivez votre message..."
            placeholderTextColor={theme.colors.textLight}
            value={saisie}
            onChangeText={setSaisie}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.envoyerBtn, !saisie.trim() && styles.envoyerBtnDisabled]}
            onPress={() => envoyerMessage()}
            disabled={!saisie.trim() || enAttente}
          >
            <LinearGradient
              colors={saisie.trim() ? ['#1565C0', '#1E88E5'] : ['#E5E7EB', '#E5E7EB']}
              style={styles.envoyerBtnGradient}
            >
              <Ionicons name="send" size={18} color={saisie.trim() ? theme.colors.white : theme.colors.textLight} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={styles.saisieLegal}>🔒 Vos conversations sont privées</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  chargement: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  chargementText: { color: theme.colors.textSecondary, fontSize: 14 },
  header: { paddingTop: 55, paddingBottom: 16, paddingHorizontal: theme.spacing.lg },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iaInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iaIconContainer: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.success, borderWidth: 2, borderColor: theme.colors.primary },
  iaNom: { fontSize: 17, fontWeight: '700', color: theme.colors.white },
  iaStatut: { fontSize: 12, color: '#A5D6A7' },
  headerBtn: { padding: 4 },
  messagesList: { flex: 1 },
  messagesContent: { padding: theme.spacing.md, paddingBottom: 8, gap: 12 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  messageRowDroit: { flexDirection: 'row-reverse' },
  iaAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  bulle: { maxWidth: width * 0.72, borderRadius: 16, padding: 12 },
  bulleIA: { backgroundColor: theme.colors.white, borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  bulleUser: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  bulleTexte: { fontSize: 14, color: theme.colors.textPrimary, lineHeight: 20 },
  bulleTexteUser: { color: theme.colors.white },
  bulleHeure: { fontSize: 10, color: theme.colors.textLight, marginTop: 4, textAlign: 'right' },
  bulleHeureUser: { color: 'rgba(255,255,255,0.65)' },
  typing: { flexDirection: 'row', gap: 4, padding: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.textLight },
  suggestions: { paddingHorizontal: theme.spacing.md, paddingBottom: 8 },
  suggestionsTitle: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 8, fontWeight: '600' },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestion: { backgroundColor: theme.colors.white, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: theme.colors.border },
  suggestionText: { fontSize: 12, color: theme.colors.primary, fontWeight: '500' },
  saisieContainer: { backgroundColor: theme.colors.white, paddingHorizontal: theme.spacing.md, paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  saisieWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.lg, paddingHorizontal: 14, paddingVertical: 4, gap: 8, borderWidth: 1, borderColor: theme.colors.border },
  saisieInput: { flex: 1, fontSize: 14, color: theme.colors.textPrimary, paddingVertical: 10, maxHeight: 100 },
  envoyerBtn: { borderRadius: 20, overflow: 'hidden' },
  envoyerBtnDisabled: { opacity: 0.6 },
  envoyerBtnGradient: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 18 },
  saisieLegal: { fontSize: 10, color: theme.colors.textLight, textAlign: 'center', marginTop: 6 },
});
