import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { payment } from '../api/client';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';
import RetroCard from '../components/RetroCard';

export default function TransactionDetailScreen({ route, navigation }) {
  const { transactionId, asSeller = false } = route.params;

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  const loadTransaction = async () => {
    try {
      console.log('📦 [TRANSACTION] Carregando detalhes:', transactionId);
      const data = await payment.get(transactionId);
      setTransaction(data);
      console.log('✅ [TRANSACTION] Detalhes carregados:', data);
    } catch (error) {
      console.error('❌ [TRANSACTION] Erro:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da transação');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransaction();
  }, [transactionId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTransaction();
  };

  const handleMarkAsShipped = () => {
    Alert.prompt(
      '📦 Marcar como Enviado',
      'Digite o código de rastreio dos Correios:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async (code) => {
            if (!code || code.trim().length < 5) {
              Alert.alert('Erro', 'Código de rastreio inválido');
              return;
            }

            try {
              setActionLoading(true);
              await payment.markAsShipped(transactionId, code.trim());
              Alert.alert(
                '✅ Enviado!',
                'Produto marcado como enviado. O comprador foi notificado.'
              );
              loadTransaction();
            } catch (error) {
              console.error('❌ Erro ao marcar como enviado:', error);
              Alert.alert(
                'Erro',
                error.response?.data?.detail || 'Não foi possível marcar como enviado'
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleUploadVideo = () => {
    navigation.navigate('VideoVerification', {
      transactionId,
      product: transaction?.product,
    });
  };

  const handleReleasePayment = () => {
    Alert.alert(
      '🎉 Liberar Pagamento',
      'Confirma que recebeu o produto em perfeitas condições e deseja liberar o pagamento para o vendedor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setActionLoading(true);
              await payment.release(transactionId);
              Alert.alert(
                '✅ Pagamento Liberado!',
                'O vendedor receberá o valor em breve. Obrigado pela compra!'
              );
              loadTransaction();
            } catch (error) {
              console.error('❌ Erro ao liberar pagamento:', error);
              Alert.alert(
                'Erro',
                error.response?.data?.detail || 'Não foi possível liberar o pagamento'
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDispute = () => {
    Alert.prompt(
      '⚠️ Abrir Reclamação',
      'Descreva o problema com o produto recebido:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason || reason.trim().length < 10) {
              Alert.alert('Erro', 'Por favor, descreva o problema detalhadamente');
              return;
            }

            try {
              setActionLoading(true);
              await payment.dispute(transactionId, reason.trim());
              Alert.alert(
                '✅ Reclamação Aberta',
                'Nossa equipe irá analisar seu caso. O pagamento foi bloqueado até a resolução.'
              );
              loadTransaction();
            } catch (error) {
              console.error('❌ Erro ao abrir reclamação:', error);
              Alert.alert(
                'Erro',
                error.response?.data?.detail || 'Não foi possível abrir a reclamação'
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        emoji: '⏳',
        title: 'Aguardando Pagamento',
        color: colors.yellow.primary,
        description: 'Finalize o pagamento para prosseguir',
      },
      paid: {
        emoji: '💰',
        title: 'Pago - Aguardando Envio',
        color: colors.yellow.primary,
        description: asSeller
          ? 'Envie o produto e informe o código de rastreio'
          : 'Aguardando o vendedor enviar o produto',
      },
      shipped: {
        emoji: '📦',
        title: 'Produto Enviado',
        color: colors.yellow.primary,
        description: asSeller
          ? 'Aguardando confirmação do comprador'
          : 'Confirme o recebimento quando o produto chegar',
      },
      video_uploaded: {
        emoji: '📹',
        title: 'Vídeo em Análise',
        color: colors.yellow.primary,
        description: 'Nossa IA está verificando o produto',
      },
      verified: {
        emoji: '✅',
        title: 'Produto Verificado',
        color: '#4ade80',
        description: 'IA confirmou que o produto está correto',
      },
      released: {
        emoji: '🎉',
        title: 'Pagamento Liberado',
        color: '#4ade80',
        description: asSeller
          ? 'Você receberá o valor em breve'
          : 'Transação concluída com sucesso',
      },
      disputed: {
        emoji: '⚠️',
        title: 'Em Disputa',
        color: '#ff4444',
        description: 'Aguardando análise da equipe',
      },
      refunded: {
        emoji: '↩️',
        title: 'Reembolsado',
        color: '#ff4444',
        description: 'Valor devolvido ao comprador',
      },
      auto_released: {
        emoji: '⏰',
        title: 'Liberado Automaticamente',
        color: '#4ade80',
        description: 'Liberado após prazo de confirmação',
      },
    };

    return statusMap[status] || statusMap.pending;
  };

  const renderActions = () => {
    if (!transaction) return null;

    const { status } = transaction;

    // Ações do Vendedor
    if (asSeller) {
      if (status === 'paid') {
        return (
          <View style={styles.actionsContainer}>
            <RetroButton
              title="Marcar como Enviado"
              icon="📦"
              onPress={handleMarkAsShipped}
              loading={actionLoading}
              variant="primary"
              size="large"
            />
          </View>
        );
      }

      if (['shipped', 'video_uploaded'].includes(status)) {
        return (
          <RetroCard style={styles.waitingCard}>
            <Text style={styles.waitingText}>
              ⏳ Aguardando confirmação do comprador
            </Text>
            {transaction.auto_release_date && (
              <Text style={styles.autoReleaseText}>
                Liberação automática em:{' '}
                {new Date(transaction.auto_release_date).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </RetroCard>
        );
      }

      if (['released', 'auto_released'].includes(status)) {
        return (
          <RetroCard variant="highlighted" style={styles.successCard}>
            <Text style={styles.successTitle}>🎉 Venda Concluída!</Text>
            <Text style={styles.successAmount}>
              Você recebe: R$ {transaction.seller_amount?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.successText}>
              O valor será transferido para sua conta em até 2 dias úteis
            </Text>
          </RetroCard>
        );
      }
    }

    // Ações do Comprador
    if (!asSeller) {
      if (status === 'shipped') {
        return (
          <View style={styles.actionsContainer}>
            <RetroButton
              title="Confirmar Recebimento"
              icon="✅"
              onPress={handleReleasePayment}
              loading={actionLoading}
              variant="primary"
              size="large"
              style={styles.actionButton}
            />
            <RetroButton
              title="Gravar Vídeo de Verificação"
              icon="📹"
              onPress={handleUploadVideo}
              variant="secondary"
              size="large"
              style={styles.actionButton}
            />
            <RetroButton
              title="Abrir Reclamação"
              icon="⚠️"
              onPress={handleDispute}
              variant="secondary"
              size="medium"
              style={styles.actionButton}
            />

            {transaction.auto_release_date && (
              <RetroCard style={styles.autoReleaseCard}>
                <Text style={styles.autoReleaseInfo}>
                  ⏰ Sem ação, o pagamento será liberado automaticamente em:
                </Text>
                <Text style={styles.autoReleaseDate}>
                  {new Date(transaction.auto_release_date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </RetroCard>
            )}
          </View>
        );
      }

      if (status === 'video_uploaded') {
        return (
          <RetroCard style={styles.waitingCard}>
            <Text style={styles.waitingText}>
              🤖 IA analisando seu vídeo...
            </Text>
            <Text style={styles.waitingSubtext}>
              Você será notificado quando a análise estiver completa
            </Text>
          </RetroCard>
        );
      }

      if (['released', 'auto_released'].includes(status)) {
        return (
          <RetroCard variant="highlighted" style={styles.successCard}>
            <Text style={styles.successTitle}>🎉 Compra Concluída!</Text>
            <Text style={styles.successText}>
              Obrigado pela sua compra! Esperamos que tenha gostado do produto.
            </Text>
          </RetroCard>
        );
      }

      if (status === 'disputed') {
        return (
          <RetroCard style={styles.disputeCard}>
            <Text style={styles.disputeTitle}>⚠️ Reclamação em Análise</Text>
            <Text style={styles.disputeText}>
              Nossa equipe está analisando seu caso. Você será notificado sobre a decisão.
            </Text>
          </RetroCard>
        );
      }
    }

    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.yellow.primary} />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Transação não encontrada</Text>
      </View>
    );
  }

  const statusInfo = getStatusInfo(transaction.status);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.yellow.primary}
          colors={[colors.yellow.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>TRANSAÇÃO #{transaction.id}</Text>
          <Text style={styles.subtitle}>
            {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>

      {/* Status Card */}
      <View style={styles.section}>
        <RetroCard
          variant="highlighted"
          style={[styles.statusCard, { borderColor: statusInfo.color }]}
        >
          <Text style={[styles.statusEmoji]}>{statusInfo.emoji}</Text>
          <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
            {statusInfo.title}
          </Text>
          <Text style={styles.statusDescription}>{statusInfo.description}</Text>
        </RetroCard>
      </View>

      {/* Product Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 PRODUTO</Text>
        <RetroCard style={styles.productCard}>
          <Text style={styles.productTitle}>{transaction.product?.title}</Text>
          <Text style={styles.productConsole}>
            {transaction.product?.console_type}
          </Text>
          {transaction.product?.description && (
            <Text style={styles.productDescription} numberOfLines={3}>
              {transaction.product.description}
            </Text>
          )}
        </RetroCard>
      </View>

      {/* Payment Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 VALORES</Text>
        <RetroCard style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Valor do Produto:</Text>
            <Text style={styles.paymentValue}>
              R$ {transaction.amount?.toFixed(2) || '0.00'}
            </Text>
          </View>

          {asSeller && (
            <>
              <View style={styles.paymentDivider} />
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Taxa da Plataforma (5%):</Text>
                <Text style={styles.paymentValue}>
                  - R$ {transaction.platform_fee?.toFixed(2) || '0.00'}
                </Text>
              </View>
              <View style={styles.paymentDivider} />
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabelTotal}>Você Recebe:</Text>
                <Text style={styles.paymentValueTotal}>
                  R$ {transaction.seller_amount?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </>
          )}
        </RetroCard>
      </View>

      {/* Tracking Info */}
      {transaction.tracking_code && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 RASTREAMENTO</Text>
          <RetroCard style={styles.trackingCard}>
            <Text style={styles.trackingCode}>{transaction.tracking_code}</Text>
            <Text style={styles.trackingDate}>
              Enviado em:{' '}
              {transaction.shipped_at
                ? new Date(transaction.shipped_at).toLocaleDateString('pt-BR')
                : 'N/A'}
            </Text>
            <RetroButton
              title="Rastrear nos Correios"
              icon="🔍"
              onPress={() => {
                Alert.alert(
                  'Rastreamento',
                  `Código: ${transaction.tracking_code}\n\nAbrir site dos Correios?`,
                  [
                    { text: 'Cancelar' },
                    { text: 'Abrir', onPress: () => console.log('Open tracking URL') },
                  ]
                );
              }}
              variant="secondary"
              size="medium"
              style={{ marginTop: 12 }}
            />
          </RetroCard>
        </View>
      )}

      {/* Actions */}
      {renderActions()}

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 3,
    borderBottomColor: colors.yellow.primary,
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
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: colors.yellow.primary,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 12,
    letterSpacing: 1,
  },
  statusCard: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
  },
  statusEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  productCard: {
    padding: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 6,
  },
  productConsole: {
    fontSize: 14,
    color: colors.yellow.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  paymentCard: {
    padding: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  paymentValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  paymentDivider: {
    height: 2,
    backgroundColor: colors.border.dark,
    marginVertical: 12,
  },
  paymentLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  paymentValueTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.yellow.primary,
  },
  trackingCard: {
    padding: 16,
    alignItems: 'center',
  },
  trackingCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  trackingDate: {
    fontSize: 13,
    color: colors.text.muted,
  },
  actionsContainer: {
    paddingHorizontal: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
  waitingCard: {
    marginHorizontal: 20,
    padding: 20,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  waitingSubtext: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
  },
  autoReleaseText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 8,
  },
  autoReleaseCard: {
    padding: 16,
    marginTop: 12,
  },
  autoReleaseInfo: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  autoReleaseDate: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    textAlign: 'center',
  },
  successCard: {
    marginHorizontal: 20,
    padding: 24,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  successAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  disputeCard: {
    marginHorizontal: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: '#ff4444',
  },
  disputeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  disputeText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.muted,
  },
});
