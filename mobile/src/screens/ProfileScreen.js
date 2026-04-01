import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';
import RetroCard from '../components/RetroCard';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

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
});
