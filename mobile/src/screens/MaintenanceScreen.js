import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { api, maintenance } from '../api/client';
import RetroIcon from '../components/RetroIcon';

export default function MaintenanceScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const scrollViewRef = useRef();

  useEffect(() => {
    startSession();
  }, []);

  const startSession = async () => {
    try {
      setLoading(true);
      const response = await maintenance.start();

      if (response.success) {
        setMessages([{
          id: Date.now(),
          text: response.greeting,
          isBot: true,
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      console.error('Detalhes:', error.response?.data);
      setMessages([{
        id: Date.now(),
        text: '👋 Olá! Sou seu assistente de manutenção de consoles retro. Me conte qual é o problema!',
        isBot: true,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos');
      return;
    }

    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 3)); // Max 3 images
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para usar a câmera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets) {
      setSelectedImages(prev => [...prev, result.assets[0].uri].slice(0, 3));
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!inputText.trim() && selectedImages.length === 0) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      images: selectedImages,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    const imagesToSend = [...selectedImages];
    setSelectedImages([]);
    setLoading(true);

    try {
      const response = await maintenance.chat(
        inputText || 'Analise estas imagens',
        imagesToSend
      );

      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.response,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);

      let errorText = '❌ Desculpe, ocorreu um erro. Tente novamente.';

      if (error.response?.status === 401) {
        errorText = '🔐 Sessão expirada. Faça login novamente.';
      } else if (error.response?.data?.detail) {
        errorText = `❌ ${error.response.data.detail}`;
      }

      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = (message) => {
    return (
      <View
        key={message.id}
        style={[
          styles.messageBubble,
          message.isBot ? styles.botBubble : styles.userBubble,
        ]}
      >
        {message.images && message.images.length > 0 && (
          <View style={styles.messageImages}>
            {message.images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.messageImage}
              />
            ))}
          </View>
        )}
        {message.text ? (
          <Text style={[
            styles.messageText,
            message.isBot ? styles.botText : styles.userText,
          ]}>
            {message.text}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛠️ Manutenção</Text>
        <Text style={styles.headerSubtitle}>Assistente de Reparo</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
          {loading && (
            <View style={[styles.messageBubble, styles.botBubble]}>
              <ActivityIndicator color={colors.yellow.primary} />
              <Text style={styles.botText}>Analisando...</Text>
            </View>
          )}
        </ScrollView>

        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <View style={styles.selectedImagesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.selectedImageWrapper}>
                  <Image source={{ uri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={pickImage}
          >
            <RetroIcon name="gallery" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.imageButton}
            onPress={takePhoto}
          >
            <RetroIcon name="camera" size={24} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Descreva o problema..."
            placeholderTextColor={colors.text.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() && selectedImages.length === 0) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() && selectedImages.length === 0}
          >
            <RetroIcon name="send" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 20,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 4,
    borderBottomColor: colors.text.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    fontFamily: 'monospace',
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.secondary,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.yellow.primary,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  botText: {
    color: colors.text.primary,
  },
  userText: {
    color: colors.background.primary,
  },
  messageImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  messageImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedImagesContainer: {
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  selectedImageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
    alignItems: 'flex-end',
  },
  imageButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 3,
    borderColor: colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  imageButtonText: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text.primary,
    maxHeight: 100,
    fontSize: 15,
    borderWidth: 3,
    borderColor: colors.text.primary,
    fontFamily: 'monospace',
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.yellow.primary,
    borderRadius: 4,
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
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
