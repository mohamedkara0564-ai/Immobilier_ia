import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const { width } = Dimensions.get('window');

const suggestionsInitiales = [
  'Quand payer mon prochain loyer ?',
  'Informations sur mon contrat',
  'Signaler un problème',
  'Contacter mon propriétaire',
];

const messagesInitiaux = [
  {
    id: '1',
    type: 'ia',
    texte: 'Bonjour Jean ! 👋\nJe suis votre assistant HomeLink. Comment puis-je vous aider aujourd\'hui ?',
    heure: '09:41',
  },
];

export default function AgentIAScreen() {
  const [messages, setMessages] = useState(messagesInitiaux);
  const [saisie, setSaisie] = useState('');
  const [enAttente, setEnAttente] = useState(false);
  const flatListRef = useRef(null);

  const reponsesIA = {
    'loyer': 'Votre prochain loyer est prévu le 5 mai 2025. Le montant est de 650 000 FCFA.',
    'contrat': 'Votre contrat de location a débuté le 5 mars 2025 et se termine le 5 mars 2026. Vous pouvez le télécharger depuis l\'onglet "Mon logement".',
    'problème': 'Je comprends. Vous pouvez signaler votre problème depuis la section "Mes demandes". Souhaitez-vous que je vous guide ?',
    'propriétaire': 'Votre propriétaire est M. Pierre Kouassi. Vous pouvez le contacter au +225 07 00 00 00 ou par email à pierre.k@email.com.',
    'default': 'Je n\'ai pas bien compris votre question. Pouvez-vous reformuler ? Vous pouvez aussi utiliser les suggestions ci-dessus. 😊',
  };

  const obtenirReponse = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('loyer') || msg.includes('payer') || msg.includes('paiement')) return reponsesIA.loyer;
    if (msg.includes('contrat')) return reponsesIA.contrat;
    if (msg.includes('problème') || msg.includes('signaler') || msg.includes('panne')) return reponsesIA['problème'];
    if (msg.includes('propriétaire') || msg.includes('contacter')) return reponsesIA['propriétaire'];
    return reponsesIA.default;
  };

  const envoyerMessage = (texte) => {
    const messageTexte = texte || saisie.trim();
    if (!messageTexte) return;

    const maintenant = new Date();
    const heure = `${maintenant.getHours().toString().padStart(2, '0')}:${maintenant.getMinutes().toString().padStart(2, '0')}`;

    // Message utilisateur
    const msgUtilisateur = {
      id: Date.now().toString(),
      type: 'utilisateur',
      texte: messageTexte,
      heure,
    };

    setMessages(prev => [...prev, msgUtilisateur]);
    setSaisie('');
    setEnAttente(true);

    // Réponse IA après délai
    setTimeout(() => {
      const msgIA = {
        id: (Date.now() + 1).toString(),
        type: 'ia',
        texte: obtenirReponse(messageTexte),
        heure,
      };
      setMessages(prev => [...prev, msgIA]);
      setEnAttente(false);
    }, 1200);
  };

  const renderMessage = ({ item }) => {
    const estUtilisateur = item.type === 'utilisateur';
    return (
      <View style={[styles.messageRow, estUtilisateur && styles.messageRowDroit]}>
        {!estUtilisateur && (
          <View style={styles.iaAvatar}>
            <Ionicons name="hardware-chip" size={16} color={theme.colors.white} />
          </View>
        )}
        <View style={[styles.bulle, estUtilisateur ? styles.bulleUtilisateur : styles.bulleIA]}>
          <Text style={[styles.bulleTexte, estUtilisateur && styles.bulleTexteUtilisateur]}>
            {item.texte}
          </Text>
          <Text style={[styles.bulleHeure, estUtilisateur && styles.bulleHeureUtilisateur]}>
            {item.heure}
          </Text>
        </View>
      </View>
    );
  };

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
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Liste des messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          enAttente ? (
            <View style={styles.messageRow}>
              <View style={styles.iaAvatar}>
                <Ionicons name="hardware-chip" size={16} color={theme.colors.white} />
              </View>
              <View style={styles.bulleIA}>
                <View style={styles.typing}>
                  <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                  <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
                  <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
                </View>
              </View>
            </View>
          ) : null
        }
      />

      {/* Suggestions */}
      {messages.length <= 2 && (
        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>Suggestions :</Text>
          <View style={styles.suggestionsRow}>
            {suggestionsInitiales.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestion}
                onPress={() => envoyerMessage(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Zone de saisie */}
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
            disabled={!saisie.trim()}
          >
            <LinearGradient
              colors={saisie.trim() ? ['#1565C0', '#1E88E5'] : ['#E5E7EB', '#E5E7EB']}
              style={styles.envoyerBtnGradient}
            >
              <Ionicons
                name="send"
                size={18}
                color={saisie.trim() ? theme.colors.white : theme.colors.textLight}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={styles.saisieLegal}>🔒 Paiement sécurisé</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 55,
    paddingBottom: 16,
    paddingHorizontal: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iaIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  iaNom: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.white,
  },
  iaStatut: {
    fontSize: 12,
    color: '#A5D6A7',
  },
  headerBtn: {
    padding: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
    paddingBottom: 8,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 4,
  },
  messageRowDroit: {
    flexDirection: 'row-reverse',
  },
  iaAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  bulle: {
    maxWidth: width * 0.72,
    borderRadius: 16,
    padding: 12,
  },
  bulleIA: {
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  bulleUtilisateur: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bulleTexte: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  bulleTexteUtilisateur: {
    color: theme.colors.white,
  },
  bulleHeure: {
    fontSize: 10,
    color: theme.colors.textLight,
    marginTop: 4,
    textAlign: 'right',
  },
  bulleHeureUtilisateur: {
    color: 'rgba(255,255,255,0.65)',
  },
  typing: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textLight,
  },
  suggestions: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestion: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  saisieContainer: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saisieWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saisieInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    paddingVertical: 10,
    maxHeight: 100,
  },
  envoyerBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  envoyerBtnDisabled: {
    opacity: 0.6,
  },
  envoyerBtnGradient: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  saisieLegal: {
    fontSize: 10,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: 6,
  },
});
