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
import { colors } from '../theme/colors';
import RetroCard from '../components/RetroCard';

export default function ForumTopicsScreen({ route, navigation }) {
  const { categoryId, subcategoryId, subcategoryName } = route.params;

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('recent'); // recent, hot, unanswered

  // Mock data - em produção, buscar da API
  const mockTopics = [
    {
      id: 1,
      title: 'Qual o melhor console retro para começar uma coleção?',
      author: {
        username: 'retrogamer92',
        avatar: 'R',
        reputation: 1245,
      },
      isPinned: true,
      isLocked: false,
      isHot: true,
      replies: 243,
      views: 8921,
      lastReply: {
        author: 'mario_fan',
        time: '5 min atrás',
      },
      createdAt: '2026-03-25T10:30:00Z',
      tags: ['Dúvida', 'Coleção'],
    },
    {
      id: 2,
      title: '[TUTORIAL] Como limpar e fazer manutenção em cartuchos antigos',
      author: {
        username: 'techmaster',
        avatar: 'T',
        reputation: 3421,
      },
      isPinned: true,
      isLocked: false,
      isHot: false,
      replies: 89,
      views: 4532,
      lastReply: {
        author: 'cleanmaster',
        time: '1h atrás',
      },
      createdAt: '2026-03-20T14:20:00Z',
      tags: ['Tutorial', 'Manutenção'],
    },
    {
      id: 3,
      title: 'Mega Drive vs Super Nintendo: qual era superior tecnicamente?',
      author: {
        username: 'console_wars',
        avatar: 'C',
        reputation: 892,
      },
      isPinned: false,
      isLocked: true,
      isHot: true,
      replies: 1234,
      views: 45678,
      lastReply: {
        author: 'mod_admin',
        time: '2h atrás',
      },
      createdAt: '2026-03-15T09:15:00Z',
      tags: ['Discussão', 'Clássico'],
    },
    {
      id: 4,
      title: 'Comprei um PS1 slim, mas não está lendo os discos',
      author: {
        username: 'newbie_gamer',
        avatar: 'N',
        reputation: 45,
      },
      isPinned: false,
      isLocked: false,
      isHot: false,
      replies: 23,
      views: 567,
      lastReply: {
        author: 'techexpert',
        time: '15min atrás',
      },
      createdAt: '2026-03-29T18:45:00Z',
      tags: ['Ajuda', 'PS1'],
    },
    {
      id: 5,
      title: 'Qual o valor justo para um Nintendo 64 completo na caixa?',
      author: {
        username: 'collector88',
        avatar: 'C',
        reputation: 2134,
      },
      isPinned: false,
      isLocked: false,
      isHot: true,
      replies: 67,
      views: 2341,
      lastReply: {
        author: 'priceexpert',
        time: '30min atrás',
      },
      createdAt: '2026-03-28T11:20:00Z',
      tags: ['Valor', 'N64'],
    },
  ];

  useEffect(() => {
    loadTopics();
  }, [filter]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTopics(mockTopics);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTopics();
    setRefreshing(false);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderTopic = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ForumTopicDetail', {
          topicId: item.id,
          topicTitle: item.title,
        })
      }
      activeOpacity={0.7}
    >
      <RetroCard style={styles.topicCard}>
        {/* Header: Badges + Title */}
        <View style={styles.topicHeader}>
          <View style={styles.badgesContainer}>
            {item.isPinned && (
              <View style={[styles.badge, styles.badgePinned]}>
                <Text style={styles.badgeText}>📌 FIXADO</Text>
              </View>
            )}
            {item.isHot && (
              <View style={[styles.badge, styles.badgeHot]}>
                <Text style={styles.badgeText}>🔥 QUENTE</Text>
              </View>
            )}
            {item.isLocked && (
              <View style={[styles.badge, styles.badgeLocked]}>
                <Text style={styles.badgeText}>🔒 FECHADO</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.topicTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Author + Stats */}
        <View style={styles.topicMeta}>
          <View style={styles.topicAuthor}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>{item.author.avatar}</Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{item.author.username}</Text>
              <Text style={styles.authorReputation}>
                ⭐ {formatNumber(item.author.reputation)} pts
              </Text>
            </View>
          </View>

          <View style={styles.topicStats}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statText}>{formatNumber(item.replies)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👁️</Text>
              <Text style={styles.statText}>{formatNumber(item.views)}</Text>
            </View>
          </View>
        </View>

        {/* Last Reply */}
        {item.lastReply && (
          <View style={styles.lastReply}>
            <Text style={styles.lastReplyText}>
              Última resposta: <Text style={styles.lastReplyAuthor}>{item.lastReply.author}</Text>
            </Text>
            <Text style={styles.lastReplyTime}>{item.lastReply.time}</Text>
          </View>
        )}
      </RetroCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {subcategoryName}
            </Text>
            <Text style={styles.headerSubtitle}>
              {topics.length} tópicos
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'recent' && styles.filterButtonActive]}
            onPress={() => setFilter('recent')}
          >
            <Text style={[styles.filterText, filter === 'recent' && styles.filterTextActive]}>
              📅 Recentes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'hot' && styles.filterButtonActive]}
            onPress={() => setFilter('hot')}
          >
            <Text style={[styles.filterText, filter === 'hot' && styles.filterTextActive]}>
              🔥 Populares
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'unanswered' && styles.filterButtonActive]}
            onPress={() => setFilter('unanswered')}
          >
            <Text style={[styles.filterText, filter === 'unanswered' && styles.filterTextActive]}>
              ❓ Sem resposta
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Topics List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.yellow.primary} />
        </View>
      ) : (
        <FlatList
          data={topics}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTopic}
          contentContainerStyle={styles.topicsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.yellow.primary}
              colors={[colors.yellow.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>Nenhum tópico ainda</Text>
              <Text style={styles.emptyHint}>
                Seja o primeiro a criar uma discussão!
              </Text>
            </View>
          }
        />
      )}

      {/* FAB - New Topic */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate('CreateForumTopic', {
            categoryId,
            subcategoryId,
            subcategoryName,
          })
        }
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
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 3,
    borderBottomColor: colors.yellow.primary,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: colors.yellow.primary,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.dark,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.yellow.primary,
    borderColor: colors.yellow.dark,
  },
  filterText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text.muted,
  },
  filterTextActive: {
    color: colors.background.primary,
  },
  topicsList: {
    padding: 16,
    paddingBottom: 80,
  },
  topicCard: {
    padding: 16,
    marginBottom: 12,
  },
  topicHeader: {
    marginBottom: 10,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 2,
  },
  badgePinned: {
    backgroundColor: colors.yellow.primary,
    borderColor: colors.yellow.dark,
  },
  badgeHot: {
    backgroundColor: '#FF6B35',
    borderColor: '#E74C3C',
  },
  badgeLocked: {
    backgroundColor: colors.text.muted,
    borderColor: colors.border.dark,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.background.primary,
    letterSpacing: 0.5,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  tagText: {
    fontSize: 10,
    color: colors.yellow.primary,
    fontWeight: '600',
  },
  topicMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topicAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.yellow.primary,
    borderWidth: 2,
    borderColor: colors.yellow.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.background.primary,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  authorReputation: {
    fontSize: 11,
    color: colors.text.muted,
  },
  topicStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 14,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  lastReply: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastReplyText: {
    fontSize: 11,
    color: colors.text.muted,
    flex: 1,
  },
  lastReplyAuthor: {
    fontWeight: 'bold',
    color: colors.yellow.primary,
  },
  lastReplyTime: {
    fontSize: 11,
    color: colors.text.muted,
    marginLeft: 8,
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
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 32,
    fontWeight: 'bold',
  },
});
