import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { products } from '../api/client';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';
import RetroCard from '../components/RetroCard';

export default function CreateProductScreen({ navigation }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'game',
    console_type: '',
    price: '',
    is_working: true,
    is_complete: false,
    has_box: false,
    has_manual: false,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const categories = [
    { id: 'console', label: 'Console', icon: '🕹️' },
    { id: 'game', label: 'Jogo', icon: '👾' },
    { id: 'peripheral', label: 'Periférico', icon: '🎧' },
  ];

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      maxSelected: 5,
    });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  const suggestPriceWithAI = async () => {
    if (images.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma foto para a IA analisar');
      return;
    }

    if (!formData.title || !formData.console_type) {
      Alert.alert('Erro', 'Preencha título e tipo de console primeiro');
      return;
    }

    try {
      setAnalyzing(true);
      console.log('🔍 Iniciando análise de preço...');

      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('category', formData.category);
      formDataObj.append('console_type', formData.console_type);

      // Converter booleans para strings (FormData issue)
      formDataObj.append('is_working', String(formData.is_working));
      formDataObj.append('is_complete', String(formData.is_complete));
      formDataObj.append('has_box', String(formData.has_box));
      formDataObj.append('has_manual', String(formData.has_manual));

      console.log('📤 Dados enviados:', {
        title: formData.title,
        console_type: formData.console_type,
        is_working: formData.is_working,
        images: images.length
      });

      images.forEach((image, index) => {
        formDataObj.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `photo_${index}.jpg`,
        });
      });

      console.log('📡 Enviando para API...');
      const analysis = await products.analyze(formDataObj);

      console.log('✅ Análise recebida:', analysis);

      // Verificar se a resposta tem a estrutura esperada
      if (!analysis || !analysis.price_suggestion) {
        throw new Error('Resposta da API em formato inválido');
      }

      setAiSuggestion(analysis);

      // Preencher preço automaticamente com a sugestão da IA
      const idealPrice = Number(analysis.price_suggestion.ideal);
      if (isNaN(idealPrice)) {
        throw new Error('Preço sugerido inválido');
      }

      setFormData(prev => ({
        ...prev,
        price: idealPrice.toFixed(2)
      }));

      Alert.alert(
        '💡 Sugestão da IA',
        `Preço sugerido: R$ ${idealPrice.toFixed(2)}\n\nFaixa: R$ ${Number(analysis.price_suggestion.min).toFixed(2)} - R$ ${Number(analysis.price_suggestion.max).toFixed(2)}\n\nCondição: ${Number(analysis.condition_score).toFixed(0)}/100\nRaridade: ${Number(analysis.rarity_score).toFixed(0)}/100\n\nVocê pode ajustar o preço manualmente se preferir.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ ERRO NA ANÁLISE:', error);
      console.error('❌ Detalhes:', error.response?.data);

      const errorMsg = error.response?.data?.detail ||
                       error.message ||
                       'Falha ao analisar produto. Você pode definir o preço manualmente.';

      Alert.alert('Erro na Análise', errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  const createProduct = async () => {
    // Validações
    if (!formData.title || !formData.description || !formData.console_type) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Erro', 'Defina um preço válido para o produto');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma foto do produto');
      return;
    }

    try {
      setLoading(true);

      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('category', formData.category);
      formDataObj.append('console_type', formData.console_type);
      formDataObj.append('is_working', formData.is_working);
      formDataObj.append('is_complete', formData.is_complete);
      formDataObj.append('has_box', formData.has_box);
      formDataObj.append('has_manual', formData.has_manual);
      formDataObj.append('final_price', parseFloat(formData.price));

      // Se a IA foi usada, enviar dados adicionais
      if (aiSuggestion) {
        formDataObj.append('condition_score', aiSuggestion.condition_score);
        formDataObj.append('rarity_score', aiSuggestion.rarity_score);
        formDataObj.append('price_min', aiSuggestion.price_suggestion.min);
        formDataObj.append('price_ideal', aiSuggestion.price_suggestion.ideal);
        formDataObj.append('price_max', aiSuggestion.price_suggestion.max);
      }

      images.forEach((image, index) => {
        formDataObj.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `photo_${index}.jpg`,
        });
      });

      await products.create(formDataObj);

      Alert.alert('Sucesso! 🎉', 'Produto criado com sucesso', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar produto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>ANUNCIAR PRODUTO</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.subtitle}>
          💡 Use a IA para sugerir preço (opcional)
        </Text>
      </View>

      {/* Images */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fotos do Produto</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
          <Text style={styles.imagePickerIcon}>📸</Text>
          <Text style={styles.imagePickerText}>
            {images.length > 0
              ? `${images.length} foto(s) selecionada(s)`
              : 'Adicionar fotos (até 5)'}
          </Text>
        </TouchableOpacity>

        {images.length > 0 && (
          <View style={styles.imagePreview}>
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image.uri }}
                style={styles.previewImage}
              />
            ))}
          </View>
        )}
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Básicas</Text>

        <TextInput
          style={styles.input}
          placeholder="Título do produto"
          placeholderTextColor="#999"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                formData.category === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setFormData({ ...formData, category: cat.id })}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
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

        <TextInput
          style={styles.input}
          placeholder="Console/Plataforma (ex: PS2, Xbox 360)"
          placeholderTextColor="#999"
          value={formData.console_type}
          onChangeText={(text) =>
            setFormData({ ...formData, console_type: text })
          }
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição detalhada"
          placeholderTextColor="#999"
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Condition */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Condição</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Funcionando</Text>
          <Switch
            value={formData.is_working}
            onValueChange={(value) =>
              setFormData({ ...formData, is_working: value })
            }
            trackColor={{ false: colors.border.dark, true: colors.yellow.primary }}
            thumbColor={colors.text.primary}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Completo (CIB)</Text>
          <Switch
            value={formData.is_complete}
            onValueChange={(value) =>
              setFormData({ ...formData, is_complete: value })
            }
            trackColor={{ false: colors.border.dark, true: colors.yellow.primary }}
            thumbColor={colors.text.primary}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Com caixa</Text>
          <Switch
            value={formData.has_box}
            onValueChange={(value) =>
              setFormData({ ...formData, has_box: value })
            }
            trackColor={{ false: colors.border.dark, true: colors.yellow.primary }}
            thumbColor={colors.text.primary}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Com manual</Text>
          <Switch
            value={formData.has_manual}
            onValueChange={(value) =>
              setFormData({ ...formData, has_manual: value })
            }
            trackColor={{ false: colors.border.dark, true: colors.yellow.primary }}
            thumbColor={colors.text.primary}
          />
        </View>
      </View>

      {/* Price */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preço</Text>
        <Text style={styles.helperText}>
          💡 Você pode definir o preço manualmente ou usar a IA para sugerir
        </Text>

        <TextInput
          style={styles.input}
          placeholder="R$ 0,00"
          placeholderTextColor="#999"
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          keyboardType="decimal-pad"
        />

        <TouchableOpacity
          style={styles.aiSuggestionButton}
          onPress={suggestPriceWithAI}
          disabled={analyzing || images.length === 0}
        >
          <Text style={styles.aiSuggestionIcon}>💡</Text>
          <Text style={styles.aiSuggestionText}>
            {analyzing ? 'Analisando...' : 'Sugerir preço com IA (Opcional)'}
          </Text>
        </TouchableOpacity>

        {aiSuggestion && (
          <View style={styles.analysisResult}>
            <Text style={styles.analysisTitle}>✨ SUGESTÃO DA IA</Text>

            <View style={styles.scoreRow}>
              <RetroCard style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Condição</Text>
                <Text style={styles.scoreValue}>
                  {aiSuggestion.condition_score.toFixed(0)}/100
                </Text>
              </RetroCard>
              <RetroCard style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Raridade</Text>
                <Text style={styles.scoreValue}>
                  {aiSuggestion.rarity_score.toFixed(0)}/100
                </Text>
              </RetroCard>
            </View>

            <RetroCard variant="premium" style={styles.priceCard}>
              <Text style={styles.priceLabel}>💰 FAIXA DE PREÇO</Text>
              <Text style={styles.priceValue}>
                R$ {aiSuggestion.price_suggestion.ideal.toFixed(2)}
              </Text>
              <Text style={styles.priceRange}>
                Entre R$ {aiSuggestion.price_suggestion.min.toFixed(2)} e R${' '}
                {aiSuggestion.price_suggestion.max.toFixed(2)}
              </Text>
            </RetroCard>

            {aiSuggestion.insights && aiSuggestion.insights.map((insight, index) => (
              <Text key={index} style={styles.insight}>
                • {insight}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Submit */}
      <RetroButton
        title="Publicar Anúncio"
        icon="✨"
        onPress={createProduct}
        loading={loading}
        variant="primary"
        size="large"
        style={styles.submitButton}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 3,
    borderBottomColor: colors.yellow.primary,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.yellow.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.yellow.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.border.dark,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.dark,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  label: {
    color: colors.text.muted,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.dark,
    borderRadius: 10,
    padding: 12,
  },
  categoryChipActive: {
    backgroundColor: colors.yellow.primary,
    borderColor: colors.yellow.dark,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  categoryChipText: {
    color: colors.text.muted,
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryChipTextActive: {
    color: colors.background.primary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  switchLabel: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  imagePicker: {
    backgroundColor: colors.background.secondary,
    borderWidth: 3,
    borderColor: colors.yellow.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  imagePickerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  imagePickerText: {
    color: colors.text.muted,
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.yellow.primary,
  },
  analysisResult: {
    marginTop: 20,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  scoreCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  scoreLabel: {
    color: colors.text.muted,
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  scoreValue: {
    color: colors.yellow.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  priceCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  priceValue: {
    color: colors.yellow.primary,
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  priceRange: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  insight: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  submitButton: {
    margin: 20,
  },
  helperText: {
    color: colors.text.secondary,
    fontSize: 13,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  aiSuggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.yellow.primary,
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
  },
  aiSuggestionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  aiSuggestionText: {
    color: colors.yellow.primary,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
