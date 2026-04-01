import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { payment } from '../api/client';
import { colors } from '../theme/colors';
import RetroCard from '../components/RetroCard';

export default function MyTransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('buyer'); // 'buyer' or 'seller'

  const loadTransactions = async () => {
    try {
      console.log('📦 [TRANSACTIONS] Carregando transações...', filter);
      const data = await payment.listMyTransactions(filter === 'buyer');
      setTransactions(data);
      console.log('✅ [TRANSACTIONS] Transações carregadas:', data.length);
    } catch (error) {
      console.error('❌ [TRANSACTIONS] Erro:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTransactions();
  }, [filter]);

  const getStatusEmoji = (status) => {
    const emojiMap = {
      pending: '⏳',
      paid: '💰',
      shipped: '📦',
      video_uploaded: '📹',
      verified: '✅',
      released: '🎉',
      disputed: '⚠️',
      refunded: '↩️',
      auto_released: '⏰',
    };
    return emojiMap[status] || '📄';
  };

  const getStatusText = (status) => {
    const textMap = {
      pending: 'Aguardando Pagamento',
      paid: 'Pago - Aguardando Envio',
      shipped: 'Enviado',
      video_uploaded: 'Vídeo em Análise',
      verified: 'Verificado',
      released: 'Pagamento Liberado',
      disputed: 'Em Disputa',
      refunded: 'Reembolsado',
      auto_released: 'Liberado Automaticamente',
    };
    return textMap[status] || status;
  };

  const getStatusColor = (status) => {
    if (['released', 'auto_released', 'verified'].includes(status)) {
      return colors.green?.primary || colors.yellow.primary;
    }
    if (['disputed', 'refunded'].includes(status)) {
      return colors.red?.primary || '#ff4444';
    }
    return colors.yellow.primary;
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('TransactionDetail', {
          transactionId: item.id,
          asSeller: filter === 'seller',
        })
      }
      activeOpacity={0.7}
    >
      <RetroCard style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionId}>
              #{item.id} - {item.product?.title || 'Produto'}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(item.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <Text style={styles.transactionAmount}>
            R$ {item.amount?.toFixed(2) || '0.00'}
          </Text>
        </View>

        <View style={styles.transactionFooter}>
          <View
            style={[
              styles.statusBadge,
              { borderColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusEmoji}>{getStatusEmoji(item.status)}</Text>
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>

          {filter === 'seller' && item.status === 'released' && (
            <Text style={styles.earningsText}>
              Você recebe: R$ {item.seller_amount?.toFixed(2) || '0.00'}
            </Text>
          )}

          {filter === 'buyer' && item.status === 'shipped' && (
            <Text style={styles.actionHint}>Toque para confirmar recebimento</Text>
          )}
        </View>

        {item.tracking_code && (
          <View style={styles.trackingContainer}>
            <Text style={styles.trackingLabel}>Rastreio:</Text>
            <Text style={styles.trackingCode}>{item.tracking_code}</Text>
          </View>
        )}
      </RetroCard>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>
        {filter === 'buyer' ? '🛒' : '💼'}
      </Text>
      <Text style={styles.emptyTitle}>
        {filter === 'buyer' ? 'Nenhuma Compra' : 'Nenhuma Venda'}
      </Text>
      <Text style={styles.emptyText}>
        {filter === 'buyer'
          ? 'Você ainda não fez nenhuma compra'
          : 'Você ainda não vendeu nenhum produto'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.yellow.primary} />
        <Text style={styles.loadingText}>Carregando transações...</Text>
      </View>
    );
  }

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
          <Text style={styles.title}>TRANSAÇÕES</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'buyer' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('buyer')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'buyer' && styles.filterTabTextActive,
              ]}
            >
              🛒 Compras
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'seller' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('seller')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'seller' && styles.filterTabTextActive,
              ]}
            >
              💼 Vendas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          transactions.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.yellow.primary}
            colors={[colors.yellow.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
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
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 3,
    borderBottomColor: colors.yellow.primary,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
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
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.border.dark,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.yellow.primary,
    borderColor: colors.yellow.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
  filterTabTextActive: {
    color: colors.background.primary,
  },
  listContent: {
    padding: 20,
  },
  listContentEmpty: {
    flex: 1,
  },
  transactionCard: {
    padding: 16,
    marginBottom: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.text.muted,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.yellow.primary,
  },
  transactionFooter: {
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: colors.background.tertiary,
  },
  statusEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  earningsText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  actionHint: {
    fontSize: 11,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  trackingLabel: {
    fontSize: 12,
    color: colors.text.muted,
    marginRight: 8,
  },
  trackingCode: {
    fontSize: 12,
    color: colors.text.primary,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.text.secondary,
  },
});
