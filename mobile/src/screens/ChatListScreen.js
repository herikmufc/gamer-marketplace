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

export default function ChatListScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/chat/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  const renderRoom = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ChatRoom', { roomId: item.id })}
    >
      <RetroCard style={styles.roomCard}>
        <View style={styles.roomAvatar}>
          <Text style={styles.roomAvatarText}>💬</Text>
        </View>

        <View style={styles.roomInfo}>
          <Text style={styles.roomProduct} numberOfLines={1}>
            Produto #{item.product_id}
          </Text>
          <Text style={styles.roomLastMessage} numberOfLines={1}>
            Última mensagem...
          </Text>
        </View>

        <View style={styles.roomMeta}>
          <Text style={styles.roomTime}>Agora</Text>
          {/* <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>3</Text>
          </View> */}
        </View>
      </RetroCard>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.yellow.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 CONVERSAS</Text>
        <Text style={styles.headerSubtitle}>
          🛡️ Protegido por IA anti-fraude
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRoom}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.yellow.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>Nenhuma conversa ainda</Text>
            <Text style={styles.emptyHint}>
              Entre em contato com vendedores para iniciar uma conversa
            </Text>
          </View>
        }
      />
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
  list: {
    padding: 16,
  },
  roomCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
  },
  roomAvatar: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: colors.yellow.primary,
    borderWidth: 3,
    borderColor: colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  roomAvatarText: {
    fontSize: 24,
  },
  roomInfo: {
    flex: 1,
  },
  roomProduct: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  roomLastMessage: {
    fontSize: 14,
    color: colors.text.muted,
    fontFamily: 'monospace',
  },
  roomMeta: {
    alignItems: 'flex-end',
  },
  roomTime: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  unreadBadge: {
    backgroundColor: colors.yellow.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.text.primary,
  },
  unreadText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
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
    fontFamily: 'monospace',
  },
  emptyHint: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});
