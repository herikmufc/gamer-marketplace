import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { products } from '../api/client';
import { colors } from '../theme/colors';
import RetroCard from '../components/RetroCard';

export default function HomeScreen({ navigation }) {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { id: 'all', label: 'Todos', icon: '🎮' },
    { id: 'console', label: 'Consoles', icon: '🕹️' },
    { id: 'game', label: 'Jogos', icon: '👾' },
  ];

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  // Reload products when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
    }, [selectedCategory])
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = selectedCategory && selectedCategory !== 'all'
        ? { category: selectedCategory }
        : {};
      console.log('📡 [HOME] Carregando produtos com filtros:', params);
      const data = await products.list(params);
      console.log('✅ [HOME] Produtos recebidos:', data?.length || 0);
      setProductList(data);
    } catch (error) {
      console.error('❌ [HOME] Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }

    try {
      setLoading(true);
      const data = await products.search(searchQuery);
      setProductList(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const renderProduct = ({ item }) => {
    // Parse images from JSON string
    let imageUrls = [];
    try {
      if (item.images) {
        imageUrls = JSON.parse(item.images);
      }
    } catch (e) {
      console.warn('Failed to parse product images:', e);
    }

    const firstImage = imageUrls.length > 0 ? imageUrls[0] : null;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <RetroCard style={styles.productCard}>
          <View style={styles.productImage}>
            {firstImage ? (
              <Image
                source={{ uri: firstImage }}
                style={styles.productImageActual}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.productImagePlaceholder}>🎮</Text>
            )}
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.productConsole}>{item.console_type}</Text>

            <View style={styles.productMeta}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  ⭐ {item.condition_score?.toFixed(0) || 70}/100
                </Text>
              </View>
              {item.is_working && (
                <View style={[styles.badge, styles.badgeSuccess]}>
                  <Text style={styles.badgeText}>✓ Funciona</Text>
                </View>
              )}
            </View>

            <Text style={styles.productPrice}>
              R$ {item.final_price?.toFixed(2) || '0.00'}
            </Text>

            <Text style={styles.productSeller}>
              👤 {item.owner?.username}
            </Text>
          </View>
        </RetroCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Brand Banner */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/brand/banner.png')}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.taglineContainer}>
          <Ionicons name="game-controller" size={16} color={colors.text.secondary} />
          <Text style={styles.brandTagline}>Games Clássicos, Preços Modernos</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produtos..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>BUSCAR</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categories}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.categoryButtonActive,
              ]}
              onPress={() =>
                setSelectedCategory(item.id === 'all' ? null : item.id)
              }
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === item.id && styles.categoryLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* AI Feature Banner */}
      <TouchableOpacity
        style={styles.aiBanner}
        onPress={() => navigation.navigate('IdentifyGame')}
      >
        <View style={styles.aiBannerContent}>
          <Text style={styles.aiBannerIcon}>🤖</Text>
          <View style={styles.aiBannerText}>
            <Text style={styles.aiBannerTitle}>Identificação por IA</Text>
            <Text style={styles.aiBannerSubtitle}>
              Tire foto e descubra o jogo, preço e raridade
            </Text>
          </View>
          <Text style={styles.aiBannerArrow}>→</Text>
        </View>
      </TouchableOpacity>

      {/* Products List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.yellow.primary} />
        </View>
      ) : (
        <FlatList
          data={productList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.productList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.yellow.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhum produto encontrado
              </Text>
            </View>
          }
        />
      )}

      {/* FAB - Create Product */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateProduct')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: 0,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 3,
    borderBottomColor: colors.yellow.primary,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    marginBottom: 12,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  brandTagline: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: colors.background.secondary,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.dark,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  searchButton: {
    backgroundColor: colors.yellow.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.yellow.dark,
  },
  searchButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.background.primary,
    letterSpacing: 1,
  },
  categories: {
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.background.secondary,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  categoryButtonActive: {
    backgroundColor: colors.yellow.primary,
    borderColor: colors.yellow.dark,
    shadowColor: colors.yellow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryLabel: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryLabelActive: {
    color: colors.background.primary,
  },
  productList: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 90,
    height: 90,
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.yellow.primary,
    overflow: 'hidden',
  },
  productImageActual: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    fontSize: 36,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 6,
  },
  productConsole: {
    fontSize: 13,
    color: colors.yellow.primary,
    marginBottom: 10,
    fontWeight: '600',
  },
  productMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  badgeSuccess: {
    backgroundColor: colors.success,
    borderColor: '#388E3C',
  },
  badgeText: {
    fontSize: 11,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 4,
  },
  productSeller: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.yellow.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.yellow.dark,
    shadowColor: colors.yellow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  fabText: {
    color: colors.background.primary,
    fontSize: 36,
    fontWeight: 'bold',
  },
  aiBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  aiBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 3,
    borderColor: colors.yellow.primary,
    padding: 18,
    gap: 15,
    shadowColor: colors.yellow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  aiBannerIcon: {
    fontSize: 36,
  },
  aiBannerText: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiBannerSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  aiBannerArrow: {
    fontSize: 28,
    color: colors.yellow.primary,
  },
});
