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
  TextInput,
  Modal,
} from 'react-native';
import { payment, shipping } from '../api/client';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';
import RetroCard from '../components/RetroCard';

export default function CheckoutScreen({ route, navigation }) {
  const { product } = route.params;
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [paymentCreated, setPaymentCreated] = useState(null);

  // Shipping states
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState(null);
  const [address, setAddress] = useState({
    zipcode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    loadAddress();
  }, []);

  const loadAddress = async () => {
    try {
      const data = await shipping.getAddress();
      console.log('📍 Address loaded:', data);

      // Backend returns with address_ prefix, convert to local state format
      if (data && data.zipcode) {
        setAddress({
          zipcode: data.zipcode,
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
        });
        // Auto-calculate shipping if address exists
        handleCalculateShipping(data.zipcode);
      }
    } catch (error) {
      console.log('Nenhum endereço cadastrado ainda:', error);
    }
  };

  const handleSaveAddress = async () => {
    try {
      setLoadingShipping(true);

      // Transform address to backend format (with address_ prefix)
      const addressPayload = {
        address_zipcode: address.zipcode,
        address_street: address.street,
        address_number: address.number,
        address_complement: address.complement,
        address_neighborhood: address.neighborhood,
        address_city: address.city,
        address_state: address.state,
      };

      await shipping.updateAddress(addressPayload);
      setAddressModalVisible(false);
      Alert.alert('Sucesso', 'Endereço salvo com sucesso!');
      // Calculate shipping after saving address
      handleCalculateShipping(address.zipcode);
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      Alert.alert('Erro', 'Não foi possível salvar o endereço');
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleCalculateShipping = async (zipcode) => {
    try {
      setLoadingShipping(true);
      setShippingError(null);
      console.log('📦 Calculando frete...', { productId: product.id, zipcode });

      const result = await shipping.calculateShipping(product.id, zipcode);
      console.log('✅ Resultado do frete:', result);

      setShippingOptions(result.options || []);
      // Auto-select first option
      if (result.options && result.options.length > 0) {
        setSelectedShipping(result.options[0]);
        console.log('✅ Opção de frete selecionada:', result.options[0]);
      } else {
        setShippingError('Nenhuma opção de frete disponível');
      }
    } catch (error) {
      console.error('❌ Erro ao calcular frete:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail || 'Não foi possível calcular o frete';
      setShippingError(errorMessage);
      Alert.alert('Erro no Frete', errorMessage);
    } finally {
      setLoadingShipping(false);
    }
  };

  const getTotalPrice = () => {
    const productPrice = product.final_price || 0;
    const shippingCost = selectedShipping?.cost || 0;
    return productPrice + shippingCost;
  };

  const handleCreatePayment = async () => {
    // Validate address
    if (!address.zipcode || !address.street || !address.number) {
      Alert.alert('Atenção', 'Por favor, preencha seu endereço de entrega');
      setAddressModalVisible(true);
      return;
    }

    // Validate shipping selected
    if (!selectedShipping) {
      Alert.alert('Atenção', 'Por favor, selecione uma opção de frete');
      return;
    }

    try {
      setLoading(true);

      console.log('💳 Criando pagamento...', {
        productId: product.id,
        method: paymentMethod,
        shipping: selectedShipping,
      });

      const result = await payment.create(product.id, paymentMethod);

      console.log('✅ Pagamento criado:', result);
      console.log('📋 Resultado completo:', JSON.stringify(result, null, 2));
      console.log('🔗 init_point:', result.init_point);
      console.log('💳 mp_preference_id:', result.mp_preference_id);
      console.log('💰 transaction_id:', result.transaction_id);

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
          <>
            <View style={styles.linkContainer}>
              <Text style={styles.linkLabel}>🔗 Link de Pagamento:</Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Link Completo',
                    paymentCreated.init_point,
                    [
                      {
                        text: 'Fechar',
                        style: 'cancel'
                      },
                      {
                        text: 'Abrir no Navegador',
                        onPress: () => Linking.openURL(paymentCreated.init_point)
                      }
                    ]
                  );
                }}
                style={styles.linkBox}
              >
                <Text style={styles.linkText} numberOfLines={2}>
                  {paymentCreated.init_point}
                </Text>
                <Text style={styles.linkHint}>👆 Toque para ver/copiar o link completo</Text>
              </TouchableOpacity>
            </View>

            <RetroButton
              title="🌐 Abrir Pagamento no Navegador"
              onPress={async () => {
                try {
                  console.log('🔗 Abrindo link direto no navegador...');
                  console.log('🌐 URL:', paymentCreated.init_point);

                  const supported = await Linking.canOpenURL(paymentCreated.init_point);
                  console.log('✅ URL suportada?', supported);

                  if (supported) {
                    await Linking.openURL(paymentCreated.init_point);
                    console.log('✅ Link aberto com sucesso');
                  } else {
                    throw new Error('URL não é suportada');
                  }
                } catch (error) {
                  console.error('❌ Erro ao abrir link:', error);
                  Alert.alert(
                    'Erro ao Abrir Link',
                    'Não foi possível abrir o link automaticamente. Toque no link acima para copiar e colar no navegador.',
                    [{ text: 'OK' }]
                  );
                }
              }}
              variant="primary"
              size="large"
            />

            {paymentCreated.mp_preference_id && (
              <RetroButton
                title="📱 Abrir no App Mercado Pago"
                onPress={async () => {
                  try {
                    const appDeepLink = `mercadopago://checkout?preference-id=${paymentCreated.mp_preference_id}`;
                    console.log('📱 Tentando abrir app MP:', appDeepLink);

                    const canOpen = await Linking.canOpenURL(appDeepLink);
                    if (canOpen) {
                      await Linking.openURL(appDeepLink);
                      console.log('✅ App MP aberto');
                    } else {
                      Alert.alert(
                        'App não instalado',
                        'O app do Mercado Pago não está instalado. Use a opção de abrir no navegador.',
                        [{ text: 'OK' }]
                      );
                    }
                  } catch (error) {
                    console.error('❌ Erro ao abrir app MP:', error);
                    Alert.alert('Erro', 'Não foi possível abrir o app do Mercado Pago');
                  }
                }}
                variant="secondary"
                size="large"
              />
            )}
          </>
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

      {/* Endereço de Entrega */}
      {!paymentCreated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 ENDEREÇO DE ENTREGA</Text>
          {address.zipcode ? (
            <RetroCard style={styles.addressCard}>
              <Text style={styles.addressText}>
                {address.street || 'Sem rua'}, {address.number || 'S/N'}
                {address.complement ? ` - ${address.complement}` : ''}
              </Text>
              <Text style={styles.addressText}>
                {address.neighborhood || 'Sem bairro'} - {address.city || 'Sem cidade'}/{address.state || 'XX'}
              </Text>
              <Text style={styles.addressText}>CEP: {address.zipcode || '00000-000'}</Text>
              <RetroButton
                title="Alterar Endereço"
                icon="✏️"
                onPress={() => setAddressModalVisible(true)}
                variant="secondary"
                size="small"
                style={{ marginTop: 12 }}
              />
            </RetroCard>
          ) : (
            <RetroButton
              title="Cadastrar Endereço"
              icon="📍"
              onPress={() => setAddressModalVisible(true)}
              variant="highlighted"
              size="large"
            />
          )}
        </View>
      )}

      {/* Opções de Frete */}
      {!paymentCreated && address.zipcode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚚 FRETE</Text>
          {loadingShipping ? (
            <RetroCard style={styles.loadingCard}>
              <ActivityIndicator size="large" color={colors.yellow.primary} />
              <Text style={styles.loadingText}>Calculando frete...</Text>
            </RetroCard>
          ) : shippingError ? (
            <RetroCard variant="danger" style={styles.errorCard}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{shippingError}</Text>
              <RetroButton
                title="Tentar Novamente"
                icon="🔄"
                onPress={() => handleCalculateShipping(address.zipcode)}
                variant="secondary"
                size="small"
                style={{ marginTop: 12 }}
              />
            </RetroCard>
          ) : shippingOptions.length > 0 ? (
            shippingOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedShipping(option)}
                activeOpacity={0.7}
              >
                <RetroCard
                  variant={
                    selectedShipping?.id === option.id ? 'highlighted' : 'default'
                  }
                  style={styles.shippingCard}
                >
                  <View style={styles.shippingContent}>
                    <View style={styles.shippingInfo}>
                      <Text style={styles.shippingName}>{option.name || 'Método de envio'}</Text>
                      <Text style={styles.shippingTime}>
                        {option.estimated_delivery_time || 'Prazo não informado'}
                      </Text>
                    </View>
                    <View style={styles.shippingPrice}>
                      <Text style={styles.shippingPriceValue}>
                        R$ {option.cost?.toFixed(2) || '0.00'}
                      </Text>
                      {selectedShipping?.id === option.id && (
                        <Text style={styles.checkIcon}>✓</Text>
                      )}
                    </View>
                  </View>
                </RetroCard>
              </TouchableOpacity>
            ))
          ) : (
            <RetroCard>
              <Text style={styles.noShippingText}>
                Aguardando cálculo de frete...
              </Text>
            </RetroCard>
          )}
        </View>
      )}

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
          {selectedShipping && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Frete ({selectedShipping.name || 'Envio'}):</Text>
              <Text style={styles.priceValue}>
                R$ {selectedShipping.cost?.toFixed(2) || '0.00'}
              </Text>
            </View>
          )}
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabelTotal}>TOTAL:</Text>
            <Text style={styles.priceValueTotal}>
              R$ {getTotalPrice().toFixed(2)}
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

      {/* Address Modal */}
      <Modal
        visible={addressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📍 Endereço de Entrega</Text>
                <TouchableOpacity
                  onPress={() => setAddressModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>CEP *</Text>
                <TextInput
                  style={styles.input}
                  value={address.zipcode}
                  onChangeText={(text) => setAddress({ ...address, zipcode: text })}
                  placeholder="00000-000"
                  keyboardType="numeric"
                  maxLength={9}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Rua/Avenida *</Text>
                <TextInput
                  style={styles.input}
                  value={address.street}
                  onChangeText={(text) => setAddress({ ...address, street: text })}
                  placeholder="Nome da rua"
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Número *</Text>
                  <TextInput
                    style={styles.input}
                    value={address.number}
                    onChangeText={(text) => setAddress({ ...address, number: text })}
                    placeholder="123"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Complemento</Text>
                  <TextInput
                    style={styles.input}
                    value={address.complement}
                    onChangeText={(text) =>
                      setAddress({ ...address, complement: text })
                    }
                    placeholder="Apto, bloco..."
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Bairro *</Text>
                <TextInput
                  style={styles.input}
                  value={address.neighborhood}
                  onChangeText={(text) =>
                    setAddress({ ...address, neighborhood: text })
                  }
                  placeholder="Nome do bairro"
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupLarge}>
                  <Text style={styles.label}>Cidade *</Text>
                  <TextInput
                    style={styles.input}
                    value={address.city}
                    onChangeText={(text) => setAddress({ ...address, city: text })}
                    placeholder="Nome da cidade"
                  />
                </View>

                <View style={styles.formGroupSmall}>
                  <Text style={styles.label}>UF *</Text>
                  <TextInput
                    style={styles.input}
                    value={address.state}
                    onChangeText={(text) =>
                      setAddress({ ...address, state: text.toUpperCase() })
                    }
                    placeholder="SP"
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <RetroButton
                title="Salvar Endereço"
                icon="✅"
                onPress={handleSaveAddress}
                loading={loadingShipping}
                variant="primary"
                size="large"
                style={{ marginTop: 20, marginBottom: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addressCard: {
    padding: 16,
  },
  addressText: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  shippingCard: {
    marginBottom: 12,
    padding: 16,
  },
  shippingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingInfo: {
    flex: 1,
  },
  shippingName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  shippingTime: {
    fontSize: 12,
    color: colors.text.muted,
  },
  shippingPrice: {
    alignItems: 'flex-end',
  },
  shippingPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.yellow.primary,
  },
  loadingCard: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 12,
  },
  noShippingText: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    padding: 20,
  },
  errorCard: {
    padding: 20,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.yellow.primary,
  },
  modalScroll: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.border.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
    marginBottom: 16,
  },
  formGroupLarge: {
    flex: 2,
    marginBottom: 16,
  },
  formGroupSmall: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.border.dark,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text.primary,
  },
  debugText: {
    fontSize: 11,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  linkContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.background.tertiary,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.yellow.primary,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 12,
  },
  linkBox: {
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  linkText: {
    fontSize: 11,
    color: colors.text.primary,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  linkHint: {
    fontSize: 10,
    color: colors.text.muted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
