import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { api } from '../api/client';

export default function CreateForumTopicScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: route.params?.categoryId || 'consoles',
    subcategory: route.params?.subcategoryId || '',
    title: '',
    content: '',
  });

  const categories = [
    { id: 'hardware', label: 'Hardware', icon: '⚙️' },
    { id: 'consoles', label: 'Consoles', icon: '🎮' },
    { id: 'jogos', label: 'Jogos', icon: '🕹️' },
    { id: 'marketplace', label: 'Compra e Venda', icon: '🛒' },
    { id: 'modificacoes', label: 'Modificações e Reparos', icon: '🔧' },
    { id: 'emulacao', label: 'Emulação', icon: '📺' },
    { id: 'comunidade', label: 'Comunidade', icon: '👥' },
  ];

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Digite um título para o tópico');
      return;
    }

    if (!formData.content.trim()) {
      Alert.alert('Erro', 'Digite o conteúdo do tópico');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/forum/posts', {
        category: formData.category,
        title: formData.title,
        content: formData.content,
      });

      if (response.status === 200) {
        Alert.alert(
          'Sucesso!',
          'Tópico criado com sucesso',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error(response.data?.detail || 'Erro ao criar tópico');
      }
    } catch (error) {
      console.error('Erro ao criar tópico:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.detail || error.message || 'Não foi possível criar o tópico'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Tópico</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Category Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Categoria *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    formData.category === cat.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category: cat.id })}
                >
                  <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryChipText,
                      formData.category === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Como consertar controle de SNES"
            placeholderTextColor={colors.text.muted}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            maxLength={200}
          />
          <Text style={styles.charCount}>
            {formData.title.length}/200
          </Text>
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.label}>Conteúdo *</Text>
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="Descreva sua dúvida, problema ou discussão..."
            placeholderTextColor={colors.text.muted}
            value={formData.content}
            onChangeText={(text) => setFormData({ ...formData, content: text })}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            maxLength={5000}
          />
          <Text style={styles.charCount}>
            {formData.content.length}/5000
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background.primary} />
          ) : (
            <Text style={styles.submitButtonText}>📝 Publicar Tópico</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    borderBottomWidth: 3,
    borderBottomColor: colors.yellow.primary,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 14,
    color: colors.yellow.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border.dark,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.yellow.primary,
    borderColor: colors.yellow.primary,
  },
  categoryChipIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  categoryChipTextActive: {
    color: colors.background.primary,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  contentInput: {
    minHeight: 200,
    maxHeight: 400,
  },
  charCount: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 6,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: colors.yellow.primary,
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.yellow.dark,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.background.primary,
    letterSpacing: 1,
  },
});
