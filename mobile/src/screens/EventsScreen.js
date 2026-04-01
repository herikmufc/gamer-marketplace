import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';
import RetroCard from '../components/RetroCard';
import { api } from '../api/client';

const ESTADOS_BRASIL = [
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
];

const EVENT_TYPES = {
  feira: { icon: '🎪', label: 'Feira', color: colors.yellow.primary },
  encontro: { icon: '🤝', label: 'Encontro', color: colors.sonic.blue },
  campeonato: { icon: '🏆', label: 'Campeonato', color: colors.mario.red },
  exposicao: { icon: '🎨', label: 'Exposição', color: colors.success },
};

export default function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [selectedState, setSelectedState] = useState('SP');

  useEffect(() => {
    loadEvents();
  }, [selectedState]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events', {
        params: {
          state: selectedState,
          upcoming_only: true,
        },
      });
      setEvents(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const discoverEvents = async () => {
    try {
      setDiscovering(true);
      const response = await api.post('/events/discover', {
        state: selectedState,
      });

      if (response.data.success && response.data.events_found > 0) {
        alert(`🎉 IA descobriu ${response.data.events_found} eventos em ${selectedState}!`);
        loadEvents();
      } else {
        alert(`😔 IA não encontrou novos eventos em ${selectedState}`);
      }
    } catch (error) {
      console.error('Erro ao descobrir eventos:', error);
      alert('Erro ao descobrir eventos. Tente novamente.');
    } finally {
      setDiscovering(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderEvent = ({ item }) => {
    const eventType = EVENT_TYPES[item.event_type] || EVENT_TYPES.feira;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      >
        <RetroCard style={styles.eventCard} variant={item.is_verified ? 'highlighted' : 'default'}>
          {/* Data Badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{formatDate(item.start_date)}</Text>
          </View>

          {/* Tipo do Evento */}
          <View style={[styles.typeTag, { backgroundColor: eventType.color }]}>
            <Text style={styles.typeIcon}>{eventType.icon}</Text>
            <Text style={styles.typeLabel}>{eventType.label}</Text>
          </View>

          {/* Título */}
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Local */}
          <Text style={styles.eventLocation}>
            📍 {item.city}/{item.state}
          </Text>

          {/* Verificado Badge */}
          {item.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✅ Verificado</Text>
            </View>
          )}

          {/* Interesse */}
          <View style={styles.interestRow}>
            <Text style={styles.interestText}>
              ⭐ {item.interest_count} {item.interest_count === 1 ? 'interessado' : 'interessados'}
            </Text>
          </View>
        </RetroCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Retro */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>📅</Text>
          <View>
            <Text style={styles.headerTitle}>Eventos Retro</Text>
            <Text style={styles.headerSubtitle}>Feiras, encontros e campeonatos</Text>
          </View>
        </View>
      </View>

      {/* Seletor de Estado */}
      <View style={styles.stateSelector}>
        <Text style={styles.stateSelectorLabel}>Estado:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stateScroll}
        >
          {ESTADOS_BRASIL.map((estado) => (
            <TouchableOpacity
              key={estado.sigla}
              style={[
                styles.stateButton,
                selectedState === estado.sigla && styles.stateButtonActive,
              ]}
              onPress={() => setSelectedState(estado.sigla)}
            >
              <Text
                style={[
                  styles.stateButtonText,
                  selectedState === estado.sigla && styles.stateButtonTextActive,
                ]}
              >
                {estado.sigla}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Botão Descobrir com IA */}
      <View style={styles.discoverSection}>
        <RetroButton
          title="🤖 Descobrir com IA"
          onPress={discoverEvents}
          loading={discovering}
          variant="primary"
          size="large"
          style={styles.discoverButton}
        />
        <Text style={styles.discoverHint}>
          IA busca novos eventos de jogos retro em {selectedState}
        </Text>
      </View>

      {/* Lista de Eventos */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.yellow.primary} />
          <Text style={styles.loadingText}>Carregando eventos...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>😔</Text>
          <Text style={styles.emptyTitle}>Nenhum evento encontrado</Text>
          <Text style={styles.emptyText}>
            Use o botão "Descobrir com IA" para buscar novos eventos em {selectedState}
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEvent}
          contentContainerStyle={styles.eventList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.yellow.primary}
              colors={[colors.yellow.primary]}
            />
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
    backgroundColor: colors.background.secondary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: colors.yellow.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerIcon: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  stateSelector: {
    backgroundColor: colors.background.secondary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.border.dark,
  },
  stateSelectorLabel: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  stateScroll: {
    flexDirection: 'row',
  },
  stateButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.border.dark,
    marginRight: 10,
  },
  stateButtonActive: {
    backgroundColor: colors.yellow.primary,
    borderColor: colors.yellow.dark,
  },
  stateButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
  stateButtonTextActive: {
    color: colors.background.primary,
  },
  discoverSection: {
    padding: 20,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 2,
    borderBottomColor: colors.border.dark,
  },
  discoverButton: {
    marginBottom: 10,
  },
  discoverHint: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
  },
  eventList: {
    padding: 16,
    gap: 16,
  },
  eventCard: {
    marginBottom: 0,
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.yellow.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.yellow.dark,
  },
  dateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.background.primary,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  typeIcon: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    marginRight: 80,
  },
  eventLocation: {
    fontSize: 14,
    color: colors.sonic.blue,
    marginBottom: 12,
  },
  verifiedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  interestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  interestText: {
    fontSize: 13,
    color: colors.yellow.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.muted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
