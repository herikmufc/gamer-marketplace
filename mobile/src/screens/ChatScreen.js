import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../api/client';
import { colors } from '../theme/colors';
import RetroCard from '../components/RetroCard';

export default function ChatScreen({ route, navigation }) {
  const { roomId, productTitle, otherUser } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      loadMessages(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId]);

  const loadMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await chat.getMessages(roomId);
      setMessages(data);

      // Scroll to bottom on new messages
      if (data.length > messages.length) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      if (!silent) {
        Alert.alert('Erro', 'Não foi possível carregar as mensagens');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageToSend = newMessage.trim();
    setNewMessage('');

    try {
      setSending(true);
      await chat.sendMessage(roomId, messageToSend);
      await loadMessages(true);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      Alert.alert('Erro', 'Não foi possível enviar a mensagem');
      setNewMessage(messageToSend); // Restore message
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender_username === user?.username;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        <RetroCard
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.theirMessage,
          ]}
        >
          {!isMyMessage && (
            <Text style={styles.senderName}>{item.sender_username}</Text>
          )}
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </RetroCard>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.yellow.primary} />
        <Text style={styles.loadingText}>Carregando chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{otherUser || 'Chat'}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {productTitle}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>
              Nenhuma mensagem ainda
            </Text>
            <Text style={styles.emptySubtext}>
              Envie uma mensagem para iniciar a conversa
            </Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <RetroCard style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={colors.text.muted}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.background.primary} />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </RetroCard>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text.secondary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 4,
    borderBottomColor: colors.text.primary,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: colors.background.tertiary,
    borderWidth: 3,
    borderColor: colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  backIcon: {
    fontSize: 24,
    color: colors.yellow.primary,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  messagesList: {
    flexGrow: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
  },
  myMessage: {
    backgroundColor: colors.yellow.primary,
  },
  theirMessage: {
    backgroundColor: colors.background.secondary,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  messageText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  messageTime: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 4,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
  },
  inputContainer: {
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 2,
    borderTopColor: colors.border.dark,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    maxHeight: 100,
    paddingVertical: 8,
    fontFamily: 'monospace',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: colors.yellow.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 3,
    borderColor: colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  sendButtonDisabled: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.dark,
    shadowOffset: { width: 1, height: 1 },
  },
  sendIcon: {
    fontSize: 20,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
});
