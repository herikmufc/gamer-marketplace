import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { products } from '../api/client';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';
import RetroCard from '../components/RetroCard';
import { useAuth } from '../contexts/AuthContext';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      console.log('📦 [PRODUCT DETAIL] Carregando produto:', productId);
      console.log('📦 [PRODUCT DETAIL] Usuário logado:', user?.username || 'NÃO LOGADO');

      const data = await products.get(productId);

      console.log('✅ [PRODUCT DETAIL] Produto carregado:', {
        id: data.id,
        title: data.title,
        is_sold: data.is_sold,
        owner: data.owner?.username,
        ownerEmail: data.owner?.email
      });

      console.log('📦 [PRODUCT DETAIL] Comparação de usuários:', {
        currentUser: user?.username,
        currentUserEmail: user?.email,
        productOwner: data.owner?.username,
        areEqual: user?.username === data.owner?.username
      });

      setProduct(data);
    } catch (error) {
      console.error('❌ [PRODUCT DETAIL] Erro:', error);
      Alert.alert('Erro', 'Falha ao carregar produto');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    console.log('💬 [CHAT] Abrindo chat com:', product.owner.username);

    // TODO: Implementar navegação para chat individual
    // Por enquanto, navega para lista de chats
    navigation.navigate('Main', {
      screen: 'ChatTab'
    });

    Alert.alert(
      'Chat',
      `Funcionalidade de chat individual em desenvolvimento. Por enquanto, veja suas conversas na aba Chat.`,
      [{ text: 'OK' }]
    );
  };

  const handleBuyNow = () => {
    console.log('🛒 [BUY] Tentativa de compra:', {
      productId: product.id,
      currentUser: user?.username,
      owner: product.owner?.username,
      isSold: product.is_sold
    });

    if (!user) {
      Alert.alert('Login Necessário', 'Faça login para comprar produtos.');
      navigation.navigate('Login');
      return;
    }

    if (user.username === product.owner.username) {
      Alert.alert('Ação Não Permitida', 'Você não pode comprar seu próprio produto.');
      return;
    }

    if (product.is_sold) {
      Alert.alert('Produto Indisponível', 'Este produto já foi vendido.');
      return;
    }

    console.log('✅ [BUY] Navegando para checkout...');
    navigation.navigate('Checkout', { product });
  };

  // Check if user can buy this product
  const canBuyProduct = () => {
    // ALWAYS check product exists first
    if (!product) return false;
    if (!user) return false;
    if (product.is_sold) return false;
    if (!product.owner) return false;
    if (user.username === product.owner.username) return false;
    return true;
  };

  const getBuyButtonText = () => {
    // ALWAYS check product exists first
    if (!product) return 'Carregando...';
    if (!user) return 'Fazer Login para Comprar';
    if (!product.owner) return 'Carregando...';
    if (user.username === product.owner.username) return 'Seu Produto';
    if (product.is_sold) return 'Produto Vendido';
    return 'Comprar';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.yellow.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <Text style={styles.imageGalleryPlaceholder}>📦</Text>
          <Text style={styles.imageCount}>🖼️ GALERIA DE FOTOS</Text>
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.console}>{product.console_type}</Text>

          {/* Price */}
          <RetroCard variant="premium" style={styles.priceContainer}>
            <Text style={styles.priceLabel}>💰 PREÇO</Text>
            <Text style={styles.price}>
              R$ {product.final_price?.toFixed(2)}
            </Text>
            {product.price_min && product.price_max && (
              <Text style={styles.priceRange}>
                Faixa: R$ {product.price_min.toFixed(2)} - R${' '}
                {product.price_max.toFixed(2)}
              </Text>
            )}
          </RetroCard>

          {/* Scores */}
          <View style={styles.scoresContainer}>
            <RetroCard style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Condição</Text>
              <Text style={styles.scoreValue}>
                ⭐ {product.condition_score?.toFixed(0) || 'N/A'}/100
              </Text>
            </RetroCard>
            <RetroCard style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Raridade</Text>
              <Text style={styles.scoreValue}>
                💎 {product.rarity_score?.toFixed(0) || 'N/A'}/100
              </Text>
            </RetroCard>
            <RetroCard style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Visualizações</Text>
              <Text style={styles.scoreValue}>
                👁️ {product.views_count}
              </Text>
            </RetroCard>
          </View>

          {/* Badges */}
          <View style={styles.badgesContainer}>
            {product.is_working && (
              <View style={[styles.badge, styles.badgeSuccess]}>
                <Text style={styles.badgeText}>✓ Funcionando</Text>
              </View>
            )}
            {product.is_complete && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📦 Completo (CIB)</Text>
              </View>
            )}
            {product.has_box && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📦 Com Caixa</Text>
              </View>
            )}
            {product.has_manual && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📖 Com Manual</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <RetroCard style={styles.section}>
            <Text style={styles.sectionTitle}>📝 DESCRIÇÃO</Text>
            <Text style={styles.description}>{product.description}</Text>
          </RetroCard>

          {/* Seller */}
          <RetroCard style={styles.section}>
            <Text style={styles.sectionTitle}>👤 VENDEDOR</Text>
            <View style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerAvatarText}>
                  {product.owner.username[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>
                  {product.owner.full_name}
                </Text>
                <Text style={styles.sellerUsername}>
                  @{product.owner.username}
                </Text>
                <View style={styles.sellerMeta}>
                  <Text style={styles.sellerReputation}>
                    ⭐ {product.owner.reputation_score} pontos
                  </Text>
                  {product.owner.is_technician && (
                    <View style={styles.technicianBadge}>
                      <Text style={styles.technicianBadgeText}>
                        🔧 Técnico
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </RetroCard>

          {/* Metadata */}
          <View style={styles.metadataContainer}>
            <Text style={styles.metadata}>
              📅 Publicado em:{' '}
              {new Date(product.created_at).toLocaleDateString('pt-BR')}
            </Text>
            <Text style={styles.metadata}>
              🎮 Categoria: {product.category}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer - Action Buttons */}
      <View style={styles.footer}>
        <RetroButton
          title={getBuyButtonText()}
          icon="🛒"
          onPress={handleBuyNow}
          variant="primary"
          size="large"
          style={styles.buyButton}
          disabled={!canBuyProduct()}
        />
        <RetroButton
          title="Chat"
          icon="💬"
          onPress={handleContact}
          variant="secondary"
          size="large"
          style={styles.contactButton}
        />
      </View>
    </View>
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
  header: {
    padding: 20,
    paddingTop: 60,
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
  imageGallery: {
    height: 300,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: colors.yellow.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGalleryPlaceholder: {
    fontSize: 80,
    marginBottom: 16,
  },
  imageCount: {
    color: colors.text.muted,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  console: {
    fontSize: 16,
    color: colors.yellow.primary,
    marginBottom: 16,
    fontWeight: '600',
  },
  priceContainer: {
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 4,
  },
  priceRange: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  scoresContainer: {
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
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  badge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  badgeSuccess: {
    backgroundColor: colors.success,
    borderColor: '#388E3C',
  },
  badgeText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  sellerCard: {
    flexDirection: 'row',
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.yellow.primary,
    borderWidth: 2,
    borderColor: colors.yellow.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sellerAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.background.primary,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  sellerUsername: {
    fontSize: 14,
    color: colors.yellow.primary,
    marginBottom: 8,
  },
  sellerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sellerReputation: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  technicianBadge: {
    backgroundColor: colors.sonic.blue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  technicianBadgeText: {
    fontSize: 10,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  metadataContainer: {
    marginBottom: 24,
  },
  metadata: {
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 3,
    borderTopColor: colors.yellow.primary,
  },
  buyButton: {
    flex: 2,
  },
  contactButton: {
    flex: 1,
  },
});
