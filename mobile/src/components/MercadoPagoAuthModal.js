import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { mercadopago } from '../api/client';
import { colors } from '../theme/colors';
import RetroButton from './RetroButton';
import RetroCard from './RetroCard';

export default function MercadoPagoAuthModal({ visible, onClose, onSuccess, type = 'sell' }) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      console.log('🔗 Iniciando conexão com Mercado Pago...');

      const { authorization_url } = await mercadopago.getConnectUrl();
      console.log('📱 URL de autorização:', authorization_url);

      const canOpen = await Linking.canOpenURL(authorization_url);
      if (canOpen) {
        await Linking.openURL(authorization_url);

        Alert.alert(
          'Autorização Necessária',
          'Você será redirecionado para o Mercado Pago. Após autorizar, volte para o app.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Aguardar alguns segundos e verificar status
                setTimeout(async () => {
                  try {
                    const status = await mercadopago.getStatus();
                    if (status.connected) {
                      Alert.alert('Sucesso!', 'Conta conectada com sucesso!', [
                        {
                          text: 'OK',
                          onPress: () => {
                            if (onSuccess) onSuccess();
                            onClose();
                          },
                        },
                      ]);
                    } else {
                      onClose();
                    }
                  } catch (error) {
                    console.error('Erro ao verificar status:', error);
                    onClose();
                  }
                }, 5000);
              },
            },
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o Mercado Pago');
      }
    } catch (error) {
      console.error('❌ Erro ao conectar MP:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.detail || 'Não foi possível conectar ao Mercado Pago'
      );
    } finally {
      setConnecting(false);
    }
  };

  const getTitle = () => {
    return type === 'sell'
      ? '💳 Conecte seu Mercado Pago'
      : '💳 Mercado Pago Necessário';
  };

  const getMessage = () => {
    return type === 'sell'
      ? 'Para vender produtos, você precisa conectar sua conta do Mercado Pago para receber os pagamentos.'
      : 'Para comprar produtos, você precisa ter uma conta do Mercado Pago conectada.';
  };

  const getBenefits = () => {
    if (type === 'sell') {
      return [
        '💰 Receba pagamentos diretamente na sua conta',
        '⚡ Dinheiro cai na hora (PIX)',
        '🔒 Transações seguras e protegidas',
        '📱 Acompanhe pelo app do Mercado Pago',
        '💯 Comissão de apenas 5%',
      ];
    } else {
      return [
        '🛡️ Compra 100% segura',
        '💳 Pague com PIX ou cartão',
        '🔐 Seus dados protegidos',
        '✅ Garantia de recebimento',
      ];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <RetroCard variant="highlighted" style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.icon}>🔐</Text>
              <Text style={styles.title}>{getTitle()}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Message */}
            <Text style={styles.message}>{getMessage()}</Text>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>
                {type === 'sell' ? 'Vantagens:' : 'Por quê?'}
              </Text>
              {getBenefits().map((benefit, index) => (
                <Text key={index} style={styles.benefitItem}>
                  {benefit}
                </Text>
              ))}
            </View>

            {/* Note */}
            <View style={styles.noteContainer}>
              <Text style={styles.noteIcon}>ℹ️</Text>
              <Text style={styles.noteText}>
                Você será redirecionado para o site do Mercado Pago para autorizar
                a RetroTrade Brasil.
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <RetroButton
                title="Conectar Agora"
                icon="🔗"
                onPress={handleConnect}
                loading={connecting}
                variant="primary"
                size="large"
                style={styles.connectButton}
              />
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </RetroCard>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
  },
  modal: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.border.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  benefitsContainer: {
    backgroundColor: colors.background.tertiary,
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 12,
  },
  benefitItem: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  noteIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.muted,
    lineHeight: 18,
  },
  buttons: {
    gap: 12,
  },
  connectButton: {
    marginBottom: 8,
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: colors.text.muted,
    fontWeight: '600',
  },
});
