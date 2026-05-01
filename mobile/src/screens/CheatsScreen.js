import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import RetroCard from '../components/RetroCard';
import RetroIcon from '../components/RetroIcon';

const API_URL = 'https://gamer-marketplace.onrender.com';

export default function CheatsScreen() {
  const [view, setView] = useState('consoles'); // consoles, games, cheats
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data
  const [consoles, setConsoles] = useState([]);
  const [games, setGames] = useState([]);
  const [cheats, setCheats] = useState([]);

  // Selected
  const [selectedConsole, setSelectedConsole] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    loadConsoles();
  }, []);

  const loadConsoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/cheats/consoles`);
      const data = await response.json();
      setConsoles(data);
    } catch (error) {
      console.error('Error loading consoles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGames = async (console) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/cheats/games?console=${console}`);
      const data = await response.json();
      setGames(data);
      setView('games');
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCheats = async (gameTitle, console) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/cheats/game/${encodeURIComponent(gameTitle)}?console=${console}`
      );
      const data = await response.json();
      setCheats(data);
      setView('cheats');
    } catch (error) {
      console.error('Error loading cheats:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCheats = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/cheats/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setCheats(data);
      setView('cheats');
    } catch (error) {
      console.error('Error searching cheats:', error);
    } finally {
      setLoading(false);
    }
  };

  // === CONSOLES VIEW ===
  const renderConsole = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedConsole(item.console);
        loadGames(item.console);
      }}
    >
      <RetroCard style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={getConsoleIcon(item.console)}
              size={28}
              color={colors.yellow.primary}
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.console}</Text>
            <Text style={styles.cardSubtitle}>{item.cheat_count} cheats</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.yellow.primary} />
        </View>
      </RetroCard>
    </TouchableOpacity>
  );

  // === GAMES VIEW ===
  const renderGame = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedGame(item.game_title);
        loadCheats(item.game_title, item.console);
      }}
    >
      <RetroCard style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="game-controller"
              size={24}
              color={colors.yellow.primary}
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.game_title}</Text>
            <Text style={styles.cardSubtitle}>
              {item.console} • {item.cheat_count} cheats
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.yellow.primary} />
        </View>
      </RetroCard>
    </TouchableOpacity>
  );

  // === CHEATS VIEW ===
  const renderCheat = ({ item }) => (
    <RetroCard style={styles.cheatCard}>
      <View style={styles.cheatHeader}>
        <Text style={styles.cheatTitle}>{item.cheat_title}</Text>
        {item.verified && <Text style={styles.verifiedBadge}>✓ Verificado</Text>}
      </View>

      <View style={styles.cheatCodeBox}>
        <Text style={styles.cheatCodeLabel}>Código:</Text>
        <Text style={styles.cheatCode}>{item.cheat_code}</Text>
      </View>

      {item.description && (
        <Text style={styles.cheatDescription}>{item.description}</Text>
      )}

      <View style={styles.cheatFooter}>
        <View style={styles.cheatTags}>
          {item.cheat_type && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.cheat_type}</Text>
            </View>
          )}
          {item.difficulty && (
            <View style={[styles.tag, styles[`tag_${item.difficulty}`]]}>
              <Text style={styles.tagText}>{item.difficulty}</Text>
            </View>
          )}
        </View>
        <View style={styles.votes}>
          <Text style={styles.upvotes}>👍 {item.upvotes}</Text>
          <Text style={styles.downvotes}>👎 {item.downvotes}</Text>
        </View>
      </View>
    </RetroCard>
  );

  const getConsoleIcon = (console) => {
    // Retorna nome do ícone Ionicons baseado no console
    const icons = {
      'NES': 'game-controller-outline',
      'SNES': 'game-controller',
      'N64': 'cube-outline',
      'Genesis': 'flash',
      'PS1': 'square-outline',
      'PS2': 'square',
      'Game Boy': 'phone-portrait-outline',
      'GBA': 'phone-portrait',
      'GameCube': 'cube',
      'Xbox': 'logo-xbox',
      'Dreamcast': 'disc-outline',
      'Atari 2600': 'hardware-chip-outline',
    };
    return icons[console] || 'game-controller';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="key" size={32} color={colors.yellow.primary} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>CHEATS</Text>
            <Text style={styles.headerSubtitle}>Códigos Secretos • Biblioteca Ilimitada</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <RetroIcon name="search" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cheats..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchCheats}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={searchCheats}>
          <Text style={styles.searchButtonText}>BUSCAR</Text>
        </TouchableOpacity>
      </View>

      {/* Breadcrumb Navigation */}
      {view !== 'consoles' && (
        <View style={styles.breadcrumb}>
          <TouchableOpacity
            onPress={() => {
              setView('consoles');
              setSelectedConsole(null);
              setSelectedGame(null);
            }}
          >
            <Text style={styles.breadcrumbText}>Consoles</Text>
          </TouchableOpacity>

          {selectedConsole && (
            <>
              <Text style={styles.breadcrumbSeparator}>›</Text>
              {view === 'cheats' ? (
                <TouchableOpacity
                  onPress={() => {
                    setView('games');
                    setSelectedGame(null);
                    loadGames(selectedConsole);
                  }}
                >
                  <Text style={styles.breadcrumbText}>{selectedConsole}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.breadcrumbActive}>{selectedConsole}</Text>
              )}
            </>
          )}

          {selectedGame && (
            <>
              <Text style={styles.breadcrumbSeparator}>›</Text>
              <Text style={styles.breadcrumbActive}>{selectedGame}</Text>
            </>
          )}
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.yellow.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={view === 'consoles' ? consoles : view === 'games' ? games : cheats}
          keyExtractor={(item, index) => index.toString()}
          renderItem={
            view === 'consoles'
              ? renderConsole
              : view === 'games'
              ? renderGame
              : renderCheat
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎮</Text>
              <Text style={styles.emptyText}>Nenhum cheat encontrado</Text>
            </View>
          }
        />
      )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: colors.background.secondary,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderWidth: 4,
    borderColor: colors.text.primary,
    borderRadius: 4,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
  searchButton: {
    backgroundColor: colors.yellow.primary,
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  searchButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    backgroundColor: colors.background.primary,
  },
  breadcrumbText: {
    fontSize: 14,
    color: colors.yellow.primary,
    fontWeight: '600',
  },
  breadcrumbActive: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  breadcrumbSeparator: {
    fontSize: 18,
    color: colors.text.muted,
    marginHorizontal: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: colors.background.primary,
    borderWidth: 3,
    borderColor: colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  cheatCard: {
    marginBottom: 16,
    padding: 16,
  },
  cheatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cheatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    flex: 1,
  },
  verifiedBadge: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: 'bold',
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.text.primary,
    fontFamily: 'monospace',
  },
  cheatCodeBox: {
    backgroundColor: colors.background.primary,
    padding: 12,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: colors.text.primary,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  cheatCodeLabel: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 4,
    fontWeight: '600',
  },
  cheatCode: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  cheatDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cheatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cheatTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  tag_easy: {
    backgroundColor: colors.success,
    borderColor: '#388E3C',
  },
  tag_medium: {
    backgroundColor: colors.warning,
    borderColor: '#F57C00',
  },
  tag_hard: {
    backgroundColor: colors.error,
    borderColor: '#C62828',
  },
  tagText: {
    fontSize: 11,
    color: colors.text.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  votes: {
    flexDirection: 'row',
    gap: 12,
  },
  upvotes: {
    fontSize: 14,
    color: colors.success,
    fontWeight: 'bold',
  },
  downvotes: {
    fontSize: 14,
    color: colors.text.muted,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
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
    color: colors.text.muted,
    fontSize: 16,
  },
});
