import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from '../api/client';
import { colors } from '../theme/colors';
import RetroCard from '../components/RetroCard';

export default function ForumScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { id: 'all', label: 'Todos', icon: '📝' },
    { id: 'discussao', label: 'Discussão', icon: '💬' },
    { id: 'duvida', label: 'Dúvida', icon: '❓' },
    { id: 'dica', label: 'Dica', icon: '💡' },
    { id: 'review', label: 'Review', icon: '⭐' },
  ];

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = selectedCategory && selectedCategory !== 'all'
        ? { category: selectedCategory }
        : {};
      const response = await axios.get('/forum/posts', { params });
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading forum posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ForumPost', { postId: item.id })}
    >
      <RetroCard style={styles.postCard}>
        {item.is_pinned && (
          <View style={styles.pinnedBadge}>
            <Text style={styles.pinnedText}>📌 FIXADO</Text>
          </View>
        )}

        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.postContent} numberOfLines={3}>
          {item.content}
        </Text>

        <View style={styles.postMeta}>
          <View style={styles.postStats}>
            <Text style={styles.postStat}>
              👁️ {item.views_count}
            </Text>
            <Text style={styles.postStat}>
              💬 {item.comments_count || 0}
            </Text>
            <Text style={styles.postStat}>
              ❤️ {item.likes_count}
            </Text>
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </RetroCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎮 FÓRUM GAMER</Text>
        <Text style={styles.headerSubtitle}>
          Discussões, dúvidas e dicas
        </Text>
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

      {/* Posts List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.yellow.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          contentContainerStyle={styles.postList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.yellow.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>Nenhum post ainda</Text>
              <Text style={styles.emptyHint}>
                Seja o primeiro a criar uma discussão!
              </Text>
            </View>
          }
        />
      )}

      {/* FAB - Create Post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateForumPost')}
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 3,
    borderBottomColor: colors.yellow.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 4,
  },
  categories: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 2,
    borderBottomColor: colors.border.dark,
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
  postList: {
    padding: 16,
  },
  postCard: {
    padding: 16,
    marginBottom: 12,
  },
  pinnedBadge: {
    backgroundColor: colors.yellow.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.yellow.dark,
  },
  pinnedText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.background.primary,
    letterSpacing: 1,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postStats: {
    flexDirection: 'row',
    gap: 12,
  },
  postStat: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  categoryText: {
    fontSize: 11,
    color: colors.yellow.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
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
});
