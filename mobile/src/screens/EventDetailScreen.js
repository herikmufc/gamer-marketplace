import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';
import RetroCard from '../components/RetroCard';
import { api } from '../api/client';

const EVENT_TYPES = {
  feira: { icon: '🎪', label: 'Feira do Rolo', color: colors.yellow.primary },
  encontro: { icon: '🤝', label: 'Encontro', color: colors.sonic.blue },
  campeonato: { icon: '🏆', label: 'Campeonato', color: colors.mario.red },
  exposicao: { icon: '🎨', label: 'Exposição', color: colors.success },
};

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interested, setInterested] = useState(false);
  const [processingInterest, setProcessingInterest] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = async () => {
    try {
      setProcessingInterest(true);

      if (interested) {
        await api.delete(`/events/${eventId}/interest`);
        setInterested(false);
        setEvent({ ...event, interest_count: event.interest_count - 1 });
      } else {
        await api.post(`/events/${eventId}/interest`);
        setInterested(true);
        setEvent({ ...event, interest_count: event.interest_count + 1 });
      }
    } catch (error) {
      console.error('Erro ao marcar interesse:', error);
      alert('Erro ao processar. Tente novamente.');
    } finally {
      setProcessingInterest(false);
    }
  };

  const openWebsite = () => {
    if (event?.website) {
      Linking.openURL(event.website);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.yellow.primary} />
        <Text style={styles.loadingText}>Carregando evento...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>😔</Text>
        <Text style={styles.errorText}>Evento não encontrado</Text>
        <RetroButton
          title="Voltar"
          onPress={() => navigation.goBack()}
          variant="secondary"
        />
      </View>
    );
  }

  const eventType = EVENT_TYPES[event.event_type] || EVENT_TYPES.feira;

  return (
    <View style={styles.container}>
      {/* Header com botão voltar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {event.title}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Hero Section */}
        <RetroCard variant="highlighted" style={styles.heroCard}>
          <View style={[styles.typeTag, { backgroundColor: eventType.color }]}>
            <Text style={styles.typeIcon}>{eventType.icon}</Text>
            <Text style={styles.typeLabel}>{eventType.label}</Text>
          </View>

          <Text style={styles.title}>{event.title}</Text>

          {event.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✅ Evento Verificado</Text>
            </View>
          )}
        </RetroCard>

        {/* Data e Local */}
        <RetroCard style={styles.infoCard}>
          <Text style={styles.sectionTitle}>📅 Quando</Text>
          <Text style={styles.dateText}>{formatDate(event.start_date)}</Text>
          {event.end_date && event.end_date !== event.start_date && (
            <Text style={styles.dateSubtext}>
              até {formatDate(event.end_date)}
            </Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>📍 Onde</Text>
          <Text style={styles.locationText}>
            {event.city}, {event.state}
          </Text>
          {event.address && (
            <Text style={styles.addressText}>{event.address}</Text>
          )}
        </RetroCard>

        {/* Descrição */}
        <RetroCard style={styles.infoCard}>
          <Text style={styles.sectionTitle}>📝 Sobre o Evento</Text>
          <Text style={styles.descriptionText}>{event.description}</Text>
        </RetroCard>

        {/* Organizador */}
        {event.organizer && (
          <RetroCard style={styles.infoCard}>
            <Text style={styles.sectionTitle}>👥 Organizador</Text>
            <Text style={styles.organizerText}>{event.organizer}</Text>
          </RetroCard>
        )}

        {/* Interesse */}
        <RetroCard variant="premium" style={styles.interestCard}>
          <View style={styles.interestHeader}>
            <Text style={styles.interestIcon}>⭐</Text>
            <View style={styles.interestInfo}>
              <Text style={styles.interestCount}>
                {event.interest_count}
              </Text>
              <Text style={styles.interestLabel}>
                {event.interest_count === 1 ? 'pessoa interessada' : 'pessoas interessadas'}
              </Text>
            </View>
          </View>

          <RetroButton
            title={interested ? '✅ Interessado' : '⭐ Marcar Interesse'}
            onPress={toggleInterest}
            loading={processingInterest}
            variant={interested ? 'secondary' : 'primary'}
            size="large"
            style={styles.interestButton}
          />

          {interested && (
            <Text style={styles.interestHint}>
              Você receberá notificação 1 semana e 1 dia antes do evento
            </Text>
          )}
        </RetroCard>

        {/* Website */}
        {event.website && (
          <RetroCard style={styles.infoCard}>
            <Text style={styles.sectionTitle}>🌐 Site do Evento</Text>
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={openWebsite}
            >
              <Text style={styles.websiteText} numberOfLines={1}>
                {event.website}
              </Text>
              <Text style={styles.websiteIcon}>→</Text>
            </TouchableOpacity>
          </RetroCard>
        )}

        {/* Contato */}
        {event.contact_info && (
          <RetroCard style={styles.infoCard}>
            <Text style={styles.sectionTitle}>📞 Contato</Text>
            <Text style={styles.contactText}>{event.contact_info}</Text>
          </RetroCard>
        )}

        {/* Fonte (se foi descoberto por IA) */}
        {event.created_by === 'ai' && (
          <View style={styles.aiDiscoveredTag}>
            <Text style={styles.aiDiscoveredText}>
              🤖 Descoberto automaticamente pela IA
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
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
    backgroundColor: colors.background.secondary,
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: colors.yellow.primary,
    gap: 15,
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  heroCard: {
    margin: 16,
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
    fontSize: 18,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 12,
    lineHeight: 32,
  },
  verifiedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  dateSubtext: {
    fontSize: 14,
    color: colors.text.muted,
  },
  divider: {
    height: 2,
    backgroundColor: colors.border.dark,
    marginVertical: 16,
  },
  locationText: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 24,
  },
  organizerText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  interestCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  interestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  interestIcon: {
    fontSize: 32,
  },
  interestInfo: {
    flex: 1,
  },
  interestCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.yellow.primary,
  },
  interestLabel: {
    fontSize: 13,
    color: colors.text.muted,
  },
  interestButton: {
    marginBottom: 8,
  },
  interestHint: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: 8,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.sonic.blue,
    gap: 8,
  },
  websiteText: {
    flex: 1,
    fontSize: 14,
    color: colors.sonic.blue,
  },
  websiteIcon: {
    fontSize: 20,
    color: colors.sonic.blue,
  },
  contactText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  aiDiscoveredTag: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  aiDiscoveredText: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: 40,
    gap: 20,
  },
  errorIcon: {
    fontSize: 64,
  },
  errorText: {
    fontSize: 18,
    color: colors.text.primary,
  },
});
