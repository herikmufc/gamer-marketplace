import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { mercadopago } from '../api/client';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';
import RetroCard from '../components/RetroCard';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [mpStatus, setMpStatus] = useState(null);
  const [loadingMp, setLoadingMp] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadMpStatus();
    }, [])
  );

  const loadMpStatus = async () => {
    try {
      setLoadingMp(true);
      const status = await mercadopago.getStatus();
      setMpStatus(status);
      console.log('📊 [MP STATUS]:', status);
    } catch (error) {
      console.error('❌ Erro ao carregar status MP:', error);
    } finally {
      setLoadingMp(false);
    }
  };

  const handleConnectMercadoPago = async () => {
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
                setTimeout(() => loadMpStatus(), 3000);
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

  const handleDisconnectMercadoPago = async () => {
    Alert.alert(
      'Desconectar Mercado Pago',
      'Você não poderá receber pagamentos até conectar novamente. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            try {
              await mercadopago.disconnect();
              Alert.alert('Sucesso', 'Conta desconectada com sucesso');
              loadMpStatus();
            } catch (error) {
              console.error('❌ Erro ao desconectar MP:', error);
              Alert.alert('Erro', 'Não foi possível desconectar');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', onPress: logout, style: 'destructive' },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <View style={styles.reputation}>
          <Text style={styles.reputationText}>
            ⭐ {user?.reputation_score} pontos
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <RetroCard style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Anúncios</Text>
        </RetroCard>
        <RetroCard style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Vendas</Text>
        </RetroCard>
        <RetroCard style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Avaliações</Text>
        </RetroCard>
      </View>

      {/* Mercado Pago Status */}
      <View style={styles.mpSection}>
        <Text style={styles.mpTitle}>💳 MERCADO PAGO</Text>

        {loadingMp ? (
          <RetroCard style={styles.mpCard}>
            <ActivityIndicator size="small" color={colors.yellow.primary} />
            <Text style={styles.mpLoadingText}>Carregando...</Text>
          </RetroCard>
        ) : mpStatus?.connected ? (
          <RetroCard variant="highlighted" style={styles.mpCard}>
            <View style={styles.mpHeader}>
              <Text style={styles.mpIcon}>✅</Text>
              <View style={styles.mpInfo}>
                <Text style={styles.mpStatusTitle}>Conta Conectada</Text>
                <Text style={styles.mpStatusText}>
                  Você pode receber pagamentos
                </Text>
              </View>
            </View>
            <RetroButton
              title="Desconectar"
              icon="🔌"
              onPress={handleDisconnectMercadoPago}
              variant="secondary"
              size="small"
              style={styles.mpButton}
            />
          </RetroCard>
        ) : (
          <RetroCard style={styles.mpCard}>
            <View style={styles.mpHeader}>
              <Text style={styles.mpIcon}>⚠️</Text>
              <View style={styles.mpInfo}>
                <Text style={styles.mpStatusTitle}>Conecte sua Conta</Text>
                <Text style={styles.mpStatusText}>
                  Necessário para receber pagamentos
                </Text>
              </View>
            </View>
            <RetroButton
              title="Conectar Mercado Pago"
              icon="🔗"
              onPress={handleConnectMercadoPago}
              loading={connecting}
              variant="primary"
              size="small"
              style={styles.mpButton}
            />
          </RetroCard>
        )}
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <TouchableOpacity>
          <RetroCard style={styles.menuItem}>
            <Text style={styles.menuIcon}>📦</Text>
            <Text style={styles.menuText}>Meus Anúncios</Text>
            <Text style={styles.menuArrow}>→</Text>
          </RetroCard>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('MyTransactions')}>
          <RetroCard style={styles.menuItem}>
            <Text style={styles.menuIcon}>💳</Text>
            <Text style={styles.menuText}>Minhas Transações</Text>
            <Text style={styles.menuArrow}>→</Text>
          </RetroCard>
        </TouchableOpacity>

        <TouchableOpacity>
          <RetroCard style={styles.menuItem}>
            <Text style={styles.menuIcon}>❤️</Text>
            <Text style={styles.menuText}>Favoritos</Text>
            <Text style={styles.menuArrow}>→</Text>
          </RetroCard>
        </TouchableOpacity>

        <TouchableOpacity>
          <RetroCard style={styles.menuItem}>
            <Text style={styles.menuIcon}>💬</Text>
            <Text style={styles.menuText}>Conversas</Text>
            <Text style={styles.menuArrow}>→</Text>
          </RetroCard>
        </TouchableOpacity>

        <TouchableOpacity>
          <RetroCard style={styles.menuItem}>
            <Text style={styles.menuIcon}>🎮</Text>
            <Text style={styles.menuText}>Minha Coleção</Text>
            <Text style={styles.menuArrow}>→</Text>
          </RetroCard>
        </TouchableOpacity>

        <TouchableOpacity>
          <RetroCard style={styles.menuItem}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Configurações</Text>
            <Text style={styles.menuArrow}>→</Text>
          </RetroCard>
        </TouchableOpacity>

        <TouchableOpacity>
          <RetroCard style={styles.menuItem}>
            <Text style={styles.menuIcon}>ℹ️</Text>
            <Text style={styles.menuText}>Sobre</Text>
            <Text style={styles.menuArrow}>→</Text>
          </RetroCard>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <RetroButton
        title="Sair da Conta"
        icon="🚪"
        onPress={handleLogout}
        variant="danger"
        size="large"
        style={styles.logoutButton}
      />

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
    alignItems: 'center',
    padding: 40,
    paddingTop: 80,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 3,
    borderBottomColor: colors.yellow.primary,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.yellow.primary,
    borderWidth: 3,
    borderColor: colors.yellow.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.yellow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.background.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
    letterSpacing: 1,
  },
  username: {
    fontSize: 16,
    color: colors.yellow.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  reputation: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  reputationText: {
    color: colors.yellow.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.muted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  menu: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuArrow: {
    fontSize: 20,
    color: colors.yellow.primary,
  },
  logoutButton: {
    margin: 20,
  },
  mpSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 12,
    letterSpacing: 1,
  },
  mpCard: {
    padding: 16,
  },
  mpLoadingText: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  mpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mpIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  mpInfo: {
    flex: 1,
  },
  mpStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 4,
  },
  mpStatusText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  mpButton: {
    marginTop: 8,
  },
});
