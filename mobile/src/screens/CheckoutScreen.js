import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { payment } from '../api/client';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';
import RetroCard from '../components/RetroCard';

export default function CheckoutScreen({ route, navigation }) {
  const { product } = route.params;
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [paymentCreated, setPaymentCreated] = useState(null);

  const handleCreatePayment = async () => {
    try {
      setLoading(true);

      console.log('💳 Criando pagamento...', {
        productId: product.id,
        method: paymentMethod,
      });

      const result = await payment.create(product.id, paymentMethod);

      console.log('✅ Pagamento criado:', result);

      setPaymentCreated(result);

      Alert.alert(
        '🎉 Pagamento Criado!',
        paymentMethod === 'pix'
          ? 'Use o QR Code ou código PIX para pagar'
          : 'Você será redirecionado para finalizar o pagamento',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Erro ao criar pagamento:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.detail || 'Não foi possível criar o pagamento'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentResult = () => {
    if (!paymentCreated) return null;

    if (paymentMethod === 'pix' && paymentCreated.qr_code_text) {
      return (
        <RetroCard variant="highlighted" style={styles.pixResult}>
          <Text style={styles.pixTitle}>📱 PIX - Pague Agora</Text>

          {paymentCreated.qr_code && (
            <View style={styles.qrCodeContainer}>
              <Image
                source={{ uri: paymentCreated.qr_code }}
                style={styles.qrCode}
                resizeMode="contain"
              />
            </View>
          )}

          <Text style={styles.pixInstructions}>
            Escaneie o QR Code acima ou copie o código PIX abaixo:
          </Text>

          <TouchableOpacity
            style={styles.pixCodeContainer}
            onPress={() => {
              // TODO: Copiar código PIX
              Alert.alert('Copiado!', 'Código PIX copiado');
            }}
          >
            <Text style={styles.pixCode} numberOfLines={2}>
              {paymentCreated.qr_code_text}
            </Text>
          </TouchableOpacity>

          <RetroButton
            title="Copiar Código PIX"
            icon="📋"
            onPress={() => {
              // TODO: Implementar cópia real com Clipboard
              Alert.alert('Copiado!', 'Código PIX copiado para área de transferência');
            }}
            variant="secondary"
            size="large"
            style={styles.copyButton}
          />

          <View style={styles.pixInfo}>
            <Text style={styles.pixInfoText}>
              ⏱️ O pagamento será confirmado em alguns segundos após o PIX
            </Text>
          </View>
        </RetroCard>
      );
    }

    return (
      <RetroCard variant="highlighted" style={styles.cardResult}>
        <Text style={styles.resultTitle}>✅ Pagamento Iniciado</Text>
        <Text style={styles.resultText}>
          Transação #{paymentCreated.transaction_id}
        </Text>
        <Text style={styles.resultStatus}>
          Status: {paymentCreated.status}
        </Text>

        {paymentCreated.init_point && (
          <RetroButton
            title="Ir para Pagamento"
            icon="🔗"
            onPress={async () => {
              try {
                console.log('🔗 Tentando abrir Mercado Pago...');
                console.log('📱 Preference ID:', paymentCreated.mp_preference_id);
                console.log('🌐 Init Point:', paymentCreated.init_point);

                // Tentar abrir o app do Mercado Pago primeiro
                if (paymentCreated.mp_preference_id) {
                  const appDeepLink = `mercadopago://checkout?preference-id=${paymentCreated.mp_preference_id}`;
                  console.log('📱 Tentando abrir app com deep link:', appDeepLink);

                  const canOpenApp = await Linking.canOpenURL(appDeepLink);
                  if (canOpenApp) {
                    await Linking.openURL(appDeepLink);
                    console.log('✅ App do Mercado Pago aberto');
                    return;
                  } else {
                    console.log('⚠️ App do Mercado Pago não está instalado, abrindo navegador...');
                  }
                }

                // Se não conseguiu abrir o app, abre no navegador
                const canOpenBrowser = await Linking.canOpenURL(paymentCreated.init_point);
                if (canOpenBrowser) {
                  await Linking.openURL(paymentCreated.init_point);
                  console.log('✅ Navegador aberto com sucesso');
                } else {
                  console.warn('⚠️ Não é possível abrir esta URL');
                  Alert.alert('Erro', 'Não foi possível abrir o link de pagamento');
                }
              } catch (error) {
                console.error('❌ Erro ao abrir Mercado Pago:', error);
                Alert.alert('Erro', 'Não foi possível abrir o Mercado Pago');
              }
            }}
            variant="primary"
            size="large"
          />
        )}
      </RetroCard>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>CHECKOUT</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.subtitle}>💳 Finalize sua compra com segurança</Text>
      </View>

      {/* Resumo do Produto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 RESUMO DO PEDIDO</Text>
        <RetroCard style={styles.productCard}>
          <View style={styles.productImage}>
            <Text style={styles.productImagePlaceholder}>🎮</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {product.title}
            </Text>
            <Text style={styles.productConsole}>{product.console_type}</Text>
            <View style={styles.badges}>
              {product.is_working && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>✓ Funciona</Text>
                </View>
              )}
              {product.has_box && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>📦 C/ Caixa</Text>
                </View>
              )}
            </View>
          </View>
        </RetroCard>
      </View>

      {/* Valores */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 VALORES</Text>
        <RetroCard variant="premium" style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Produto:</Text>
            <Text style={styles.priceValue}>
              R$ {product.final_price?.toFixed(2) || '0.00'}
            </Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabelTotal}>TOTAL:</Text>
            <Text style={styles.priceValueTotal}>
              R$ {product.final_price?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </RetroCard>
      </View>

      {/* Método de Pagamento */}
      {!paymentCreated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 MÉTODO DE PAGAMENTO</Text>

          <TouchableOpacity
            onPress={() => setPaymentMethod('pix')}
            activeOpacity={0.7}
          >
            <RetroCard
              variant={paymentMethod === 'pix' ? 'highlighted' : 'default'}
              style={styles.paymentMethodCard}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentIcon}>📱</Text>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodTitle}>PIX</Text>
                  <Text style={styles.paymentMethodDesc}>
                    Aprovação instantânea
                  </Text>
                </View>
                {paymentMethod === 'pix' && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </View>
            </RetroCard>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPaymentMethod('credit_card')}
            activeOpacity={0.7}
          >
            <RetroCard
              variant={
                paymentMethod === 'credit_card' ? 'highlighted' : 'default'
              }
              style={styles.paymentMethodCard}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentIcon}>💳</Text>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodTitle}>Cartão de Crédito</Text>
                  <Text style={styles.paymentMethodDesc}>
                    Parcelamento disponível
                  </Text>
                </View>
                {paymentMethod === 'credit_card' && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </View>
            </RetroCard>
          </TouchableOpacity>
        </View>
      )}

      {/* Resultado do Pagamento */}
      {renderPaymentResult()}

      {/* Informações de Segurança */}
      {!paymentCreated && (
        <View style={styles.section}>
          <RetroCard style={styles.securityCard}>
            <Text style={styles.securityTitle}>🛡️ COMPRA SEGURA</Text>
            <Text style={styles.securityItem}>
              ✅ Pagamento retido até confirmação
            </Text>
            <Text style={styles.securityItem}>
              ✅ IA verifica produto recebido
            </Text>
            <Text style={styles.securityItem}>
              ✅ Auto-liberação em 3 dias úteis
            </Text>
            <Text style={styles.securityItem}>
              ✅ Sistema de reclamação disponível
            </Text>
          </RetroCard>
        </View>
      )}

      {/* Botão Finalizar Compra */}
      {!paymentCreated && (
        <RetroButton
          title="Finalizar Compra"
          icon="🛒"
          onPress={handleCreatePayment}
          loading={loading}
          variant="primary"
          size="large"
          style={styles.checkoutButton}
        />
      )}

      {paymentCreated && (
        <RetroButton
          title="Ver Meus Pedidos"
          icon="📦"
          onPress={() => navigation.navigate('MyTransactions')}
          variant="secondary"
          size="large"
          style={styles.checkoutButton}
        />
      )}

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
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
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
  productCard: {
    flexDirection: 'row',
    padding: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.yellow.primary,
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
    marginBottom: 8,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  badgeText: {
    fontSize: 10,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  priceCard: {
    padding: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  priceValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  priceDivider: {
    height: 2,
    backgroundColor: colors.border.dark,
    marginVertical: 12,
  },
  priceLabelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 1,
  },
  priceValueTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.yellow.primary,
  },
  paymentMethodCard: {
    marginBottom: 12,
    padding: 16,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  paymentMethodDesc: {
    fontSize: 12,
    color: colors.text.muted,
  },
  checkIcon: {
    fontSize: 28,
    color: colors.yellow.primary,
  },
  securityCard: {
    padding: 16,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  securityItem: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  checkoutButton: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  pixResult: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  pixTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.text.primary,
    padding: 16,
    borderRadius: 12,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  pixInstructions: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  pixCodeContainer: {
    backgroundColor: colors.background.tertiary,
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  pixCode: {
    fontSize: 12,
    color: colors.text.primary,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  copyButton: {
    marginBottom: 16,
  },
  pixInfo: {
    backgroundColor: colors.background.tertiary,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  pixInfoText: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
  },
  cardResult: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
});
