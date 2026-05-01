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
import RetroIcon from '../components/RetroIcon';
import PageBanner from '../components/PageBanner';

export default function ForumScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { id: 'all', label: 'Todos', icon: 'forum' },
    { id: 'discussao', label: 'Discussão', icon: 'discussion' },
    { id: 'duvida', label: 'Dúvida', icon: 'question' },
    { id: 'dica', label: 'Dica', icon: 'idea' },
    { id: 'review', label: 'Review', icon: 'star' },
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
      {/* Page Banner */}
      <PageBanner source="forum" />

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
              <RetroIcon name={item.icon} size={20} style={styles.categoryIcon} />
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
    borderBottomWidth: 4,
    borderBottomColor: colors.text.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 4,
    fontFamily: 'monospace',
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
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 3,
    borderColor: colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  categoryButtonActive: {
    backgroundColor: colors.yellow.primary,
    borderColor: colors.text.primary,
    transform: [{ translateY: 3 }, { translateX: 3 }],
    shadowOffset: { width: 0, height: 0 },
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
    fontFamily: 'monospace',
  },
  categoryLabelActive: {
    color: colors.text.primary,
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
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  pinnedText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  postContent: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'monospace',
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
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: colors.text.primary,
  },
  categoryText: {
    fontSize: 11,
    color: colors.yellow.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: 'monospace',
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
    fontSize: 36,
    fontWeight: 'bold',
  },
});
