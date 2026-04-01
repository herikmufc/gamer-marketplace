import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { products } from '../api/client';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';
import RetroCard from '../components/RetroCard';

export default function IdentifyGameScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [identification, setIdentification] = useState(null);

  const pickImage = async (source) => {
    try {
      let result;

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Precisamos de acesso à câmera');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Precisamos de acesso às fotos');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setIdentification(null); // Limpar identificação anterior
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const identifyGame = async () => {
    if (!selectedImage) {
      Alert.alert('Atenção', 'Selecione uma imagem primeiro');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Iniciando identificação do jogo...');
      const result = await products.identifyGame(selectedImage);
      console.log('✅ Identificação recebida:', result);

      if (result.success && result.identification) {
        setIdentification(result.identification);
      } else {
        // Mostrar resposta raw se não veio em formato estruturado
        Alert.alert(
          'Análise da IA',
          result.raw_response || 'Não foi possível identificar o jogo',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Erro ao identificar:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.detail || 'Não foi possível analisar a imagem'
      );
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    if (!rarity) return '#888';
    const lower = rarity.toLowerCase();
    if (lower.includes('extremamente')) return '#ff1744';
    if (lower.includes('muito')) return '#ff9100';
    if (lower.includes('raro')) return '#ffd600';
    return '#4caf50';
  };

  const getAuthenticityColor = (score) => {
    if (score >= 85) return '#4caf50';
    if (score >= 70) return '#ffd600';
    if (score >= 50) return '#ff9100';
    return '#ff1744';
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
          <Text style={styles.title}>IDENTIFICAR JOGO</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.subtitle}>
          🤖 IA analisa e identifica automaticamente
        </Text>
      </View>

      {/* Botões de ação */}
      <View style={styles.buttonContainer}>
        <RetroButton
          title="Tirar Foto"
          icon="📷"
          onPress={() => pickImage('camera')}
          variant="primary"
          size="large"
          style={styles.actionButton}
        />

        <RetroButton
          title="Galeria"
          icon="🖼️"
          onPress={() => pickImage('gallery')}
          variant="secondary"
          size="large"
          style={styles.actionButton}
        />
      </View>

      {/* Preview da imagem */}
      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />

          <RetroButton
            title="Identificar com IA"
            icon="🤖"
            onPress={identifyGame}
            loading={loading}
            variant="primary"
            size="large"
          />
        </View>
      )}

      {/* Resultados da identificação */}
      {identification && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultIcon}>✨</Text>
            <Text style={styles.resultTitle}>ANÁLISE COMPLETA</Text>
          </View>

          {/* Nome do jogo */}
          <RetroCard variant="highlighted" style={styles.resultCard}>
            <Text style={styles.resultLabel}>🎮 Jogo</Text>
            <Text style={styles.resultValue}>{identification.game_name}</Text>
          </RetroCard>

          {/* Console e Região */}
          <View style={styles.resultRow}>
            <RetroCard style={styles.halfCard}>
              <Text style={styles.resultLabel}>Console</Text>
              <Text style={styles.resultValue}>{identification.console}</Text>
            </RetroCard>
            <RetroCard style={styles.halfCard}>
              <Text style={styles.resultLabel}>Região</Text>
              <Text style={styles.resultValue}>{identification.region}</Text>
            </RetroCard>
          </View>

          {/* Versão e Estado */}
          <View style={styles.resultRow}>
            <RetroCard style={styles.halfCard}>
              <Text style={styles.resultLabel}>Versão</Text>
              <Text style={styles.resultValue}>{identification.version}</Text>
            </RetroCard>
            <RetroCard style={styles.halfCard}>
              <Text style={styles.resultLabel}>Estado</Text>
              <Text style={styles.resultValue}>
                ⭐ {identification.condition_score}/10
              </Text>
            </RetroCard>
          </View>

          {/* Completude */}
          <RetroCard style={styles.resultCard}>
            <Text style={styles.resultLabel}>📦 Completude</Text>
            <View style={styles.completudeContainer}>
              <Text style={styles.completudeItem}>
                {identification.has_box ? '✅' : '❌'} Caixa
              </Text>
              <Text style={styles.completudeItem}>
                {identification.has_manual ? '✅' : '❌'} Manual
              </Text>
              {identification.has_extras && identification.has_extras.length > 0 && (
                <Text style={styles.completudeItem}>
                  ✅ Extras: {identification.has_extras.join(', ')}
                </Text>
              )}
            </View>
          </RetroCard>

          {/* Raridade */}
          <RetroCard style={styles.resultCard}>
            <Text style={styles.resultLabel}>⭐ Raridade no Brasil</Text>
            <View
              style={[
                styles.rarityBadge,
                { backgroundColor: getRarityColor(identification.rarity) },
              ]}
            >
              <Text style={styles.rarityText}>{identification.rarity}</Text>
            </View>
          </RetroCard>

          {/* Preço Estimado */}
          <RetroCard variant="premium" style={styles.resultCard}>
            <Text style={styles.resultLabel}>💰 Preço Estimado</Text>
            <Text style={styles.priceValue}>{identification.estimated_price}</Text>
          </RetroCard>

          {/* Autenticidade */}
          <RetroCard style={styles.resultCard}>
            <Text style={styles.resultLabel}>🔒 Autenticidade</Text>
            <View style={styles.authenticityContainer}>
              <View style={styles.authenticityBar}>
                <View
                  style={[
                    styles.authenticityFill,
                    {
                      width: `${identification.authenticity_score}%`,
                      backgroundColor: getAuthenticityColor(
                        identification.authenticity_score
                      ),
                    },
                  ]}
                />
              </View>
              <Text style={styles.authenticityScore}>
                {identification.authenticity_score}/100
              </Text>
            </View>
            {identification.authenticity_notes && (
              <Text style={styles.authenticityNotes}>
                {identification.authenticity_notes}
              </Text>
            )}
          </RetroCard>

          {/* Análise de Mercado */}
          {identification.market_analysis && (
            <RetroCard style={styles.resultCard}>
              <Text style={styles.resultLabel}>📈 Análise de Mercado</Text>
              <Text style={styles.marketAnalysis}>
                {identification.market_analysis}
              </Text>
            </RetroCard>
          )}

          {/* Confiança */}
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceText}>
              🎯 Confiança: {identification.confidence}%
            </Text>
          </View>

          {/* Botão para criar anúncio */}
          <RetroButton
            title="Criar Anúncio"
            icon="✨"
            onPress={() => {
              navigation.navigate('CreateProduct', {
                prefilledData: {
                  title: identification.game_name,
                  console: identification.console,
                  condition: identification.condition_score,
                  price: identification.estimated_price,
                },
              });
            }}
            variant="primary"
            size="large"
            style={styles.createProductButton}
          />
        </View>
      )}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  imageContainer: {
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: colors.yellow.primary,
  },
  resultContainer: {
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.yellow.primary,
  },
  resultIcon: {
    fontSize: 28,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 2,
  },
  resultCard: {
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfCard: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  resultValue: {
    fontSize: 17,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  completudeContainer: {
    gap: 8,
  },
  completudeItem: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '600',
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  rarityText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.background.primary,
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.yellow.primary,
  },
  authenticityContainer: {
    gap: 12,
  },
  authenticityBar: {
    height: 35,
    backgroundColor: colors.background.tertiary,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  authenticityFill: {
    height: '100%',
    borderRadius: 18,
  },
  authenticityScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  authenticityNotes: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    marginTop: 8,
  },
  marketAnalysis: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 24,
  },
  confidenceContainer: {
    backgroundColor: colors.background.secondary,
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  confidenceText: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    fontWeight: '600',
  },
  createProductButton: {
    marginTop: 10,
  },
});
