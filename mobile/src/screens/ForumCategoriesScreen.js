import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import RetroCard from '../components/RetroCard';
import RetroIcon from '../components/RetroIcon';
import PageBanner from '../components/PageBanner';

export default function ForumCategoriesScreen({ navigation }) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Estrutura de categorias estilo Adrenaline
  const categories = [
    {
      id: 'hardware',
      name: 'Hardware',
      icon: 'circuit',
      color: colors.sonic.blue,
      description: 'Discussões sobre hardware de PCs e componentes',
      subcategories: [
        { id: 'placas', name: 'Placas de Vídeo', topics: 1243, posts: 45231 },
        { id: 'processadores', name: 'Processadores', topics: 892, posts: 32451 },
        { id: 'memorias', name: 'Memórias RAM', topics: 445, posts: 15234 },
        { id: 'ssd', name: 'SSD e Armazenamento', topics: 667, posts: 23451 },
        { id: 'perifericos', name: 'Periféricos', topics: 1089, posts: 38921 },
      ],
    },
    {
      id: 'consoles',
      name: 'Consoles',
      icon: 'console-stack',
      color: colors.yellow.primary,
      description: 'Tudo sobre consoles clássicos e modernos',
      subcategories: [
        { id: 'playstation', name: 'PlayStation (PS1-PS5)', topics: 2341, posts: 89234 },
        { id: 'xbox', name: 'Xbox (Classic-Series)', topics: 1456, posts: 52341 },
        { id: 'nintendo', name: 'Nintendo (NES-Switch)', topics: 3214, posts: 123456 },
        { id: 'sega', name: 'SEGA (Master-Dreamcast)', topics: 892, posts: 34521 },
        { id: 'retro', name: 'Consoles Retro', topics: 1245, posts: 45678 },
      ],
    },
    {
      id: 'jogos',
      name: 'Jogos',
      icon: 'game-stack',
      color: '#FF6B35',
      description: 'Discussões sobre jogos de todas as plataformas',
      subcategories: [
        { id: 'pc-games', name: 'Jogos de PC', topics: 5432, posts: 234567 },
        { id: 'console-games', name: 'Jogos de Console', topics: 4321, posts: 198765 },
        { id: 'mobile-games', name: 'Jogos Mobile', topics: 1234, posts: 45678 },
        { id: 'indie', name: 'Jogos Indie', topics: 891, posts: 32145 },
        { id: 'retro-games', name: 'Jogos Retro', topics: 2345, posts: 87654 },
      ],
    },
    {
      id: 'marketplace',
      name: 'Compra e Venda',
      icon: 'price-tag',
      color: '#4ECDC4',
      description: 'Compre, venda e troque jogos e hardware',
      subcategories: [
        { id: 'venda', name: 'Vendas', topics: 3421, posts: 45678 },
        { id: 'procuro', name: 'Procuro Comprar', topics: 1234, posts: 23456 },
        { id: 'trocas', name: 'Trocas', topics: 892, posts: 12345 },
        { id: 'avaliacoes', name: 'Avaliações de Vendedores', topics: 445, posts: 8901 },
      ],
    },
    {
      id: 'modificacoes',
      name: 'Modificações e Reparos',
      icon: 'tools',
      color: '#F7B801',
      description: 'Tutoriais, mods e reparos',
      subcategories: [
        { id: 'tutoriais', name: 'Tutoriais e Guias', topics: 892, posts: 34521 },
        { id: 'mods', name: 'Modificações', topics: 667, posts: 23451 },
        { id: 'reparos', name: 'Reparos e Manutenção', topics: 1089, posts: 45678 },
        { id: 'homebrew', name: 'Homebrew e Desbloqueio', topics: 445, posts: 12345 },
      ],
    },
    {
      id: 'emulacao',
      name: 'Emulação',
      icon: 'tv-retro',
      color: '#9B59B6',
      description: 'Emuladores e ROMs',
      subcategories: [
        { id: 'emuladores-pc', name: 'Emuladores para PC', topics: 1456, posts: 52341 },
        { id: 'emuladores-android', name: 'Emuladores Android', topics: 891, posts: 32145 },
        { id: 'retro-pie', name: 'RetroPie e Raspberry', topics: 667, posts: 23451 },
        { id: 'configs', name: 'Configurações', topics: 445, posts: 15234 },
      ],
    },
    {
      id: 'comunidade',
      name: 'Comunidade',
      icon: 'community',
      color: '#E74C3C',
      description: 'Bate-papo e off-topic',
      subcategories: [
        { id: 'apresentacoes', name: 'Apresentações', topics: 2341, posts: 12345 },
        { id: 'off-topic', name: 'Off-Topic', topics: 8921, posts: 456789 },
        { id: 'eventos', name: 'Eventos e Meetups', topics: 234, posts: 5678 },
        { id: 'sugestoes', name: 'Sugestões', topics: 178, posts: 3456 },
      ],
    },
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const getTotalStats = (subcategories) => {
    return subcategories.reduce(
      (acc, sub) => ({
        topics: acc.topics + sub.topics,
        posts: acc.posts + sub.posts,
      }),
      { topics: 0, posts: 0 }
    );
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Page Banner */}
      <PageBanner source="forum" />

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>25.4K</Text>
          <Text style={styles.statLabel}>Tópicos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>892K</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>1.2K</Text>
          <Text style={styles.statLabel}>Membros</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>243</Text>
          <Text style={styles.statLabel}>Online</Text>
        </View>
      </View>

      {/* Categories List */}
      <ScrollView style={styles.scrollView}>
        {categories.map((category) => {
          const isExpanded = expandedCategory === category.id;
          const stats = getTotalStats(category.subcategories);

          return (
            <View key={category.id} style={styles.categoryContainer}>
              {/* Category Header */}
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.id)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryHeaderLeft}>
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: category.color },
                    ]}
                  >
                    <RetroIcon name={category.icon} size={32} />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDescription}>
                      {category.description}
                    </Text>
                    <View style={styles.categoryStats}>
                      <Text style={styles.categoryStatText}>
                        📝 {formatNumber(stats.topics)} tópicos
                      </Text>
                      <Text style={styles.categoryStatText}>
                        💬 {formatNumber(stats.posts)} posts
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.expandIcon}>
                  {isExpanded ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>

              {/* Subcategories */}
              {isExpanded && (
                <View style={styles.subcategoriesContainer}>
                  {category.subcategories.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      style={styles.subcategoryItem}
                      onPress={() =>
                        navigation.navigate('ForumTopics', {
                          categoryId: category.id,
                          subcategoryId: sub.id,
                          subcategoryName: sub.name,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <View style={styles.subcategoryLeft}>
                        <View style={styles.subcategoryDot} />
                        <View style={styles.subcategoryInfo}>
                          <Text style={styles.subcategoryName}>
                            {sub.name}
                          </Text>
                          <View style={styles.subcategoryStats}>
                            <Text style={styles.subcategoryStatText}>
                              {formatNumber(sub.topics)} tópicos
                            </Text>
                            <Text style={styles.subcategoryStatDivider}>•</Text>
                            <Text style={styles.subcategoryStatText}>
                              {formatNumber(sub.posts)} posts
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text style={styles.subcategoryArrow}>→</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB - New Topic */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateForumTopic')}
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 4,
    borderBottomColor: colors.text.primary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 2,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.muted,
    fontFamily: 'monospace',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: colors.text.primary,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.dark,
    marginHorizontal: 4,
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  categoryHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 3,
    borderColor: colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  categoryDescription: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  categoryStats: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryStatText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  expandIcon: {
    fontSize: 14,
    color: colors.yellow.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  subcategoriesContainer: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.border.dark,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingLeft: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  subcategoryLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: colors.yellow.primary,
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.text.primary,
  },
  subcategoryInfo: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  subcategoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoryStatText: {
    fontSize: 11,
    color: colors.text.muted,
    fontFamily: 'monospace',
  },
  subcategoryStatDivider: {
    fontSize: 11,
    color: colors.text.muted,
    marginHorizontal: 6,
  },
  subcategoryArrow: {
    fontSize: 18,
    color: colors.yellow.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: colors.yellow.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  fabText: {
    color: colors.text.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
});
