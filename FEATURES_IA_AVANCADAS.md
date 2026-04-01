# 🤖 Features Avançadas de IA - RetroTrade Brasil

## 📋 Visão Geral

Duas novas funcionalidades de IA que diferenciam completamente o RetroTrade Brasil da concorrência:

1. **🛡️ Moderação Inteligente de Chat** - Anti-Fraude
2. **📅 Descoberta Automática de Eventos** - Feed de Eventos Retro

---

## 🛡️ Feature 1: Moderação Inteligente de Chat

### Problema que Resolve

Marketplaces P2P sofrem com:
- ❌ Tentativas de fraude
- ❌ Pedidos de pagamento fora da plataforma
- ❌ Compartilhamento de dados pessoais
- ❌ Linguagem abusiva
- ❌ Golpes e phishing

### Solução

IA monitora conversas em **tempo real** e detecta comportamentos suspeitos ANTES de causarem dano.

### Como Funciona

#### 1. Análise em Tempo Real

```python
@app.post("/chat/moderate-message")
```

Antes de enviar uma mensagem, a IA analisa:

**Score de Risco (0-100):**
- 🟢 0-30: Mensagem segura
- 🟡 31-60: Atenção (avisar usuário)
- 🟠 61-80: Suspeita (bloquear + alerta admin)
- 🔴 81-100: Fraude clara (bloquear + banir usuário)

**Padrões Detectados:**

1. **Fraude (+40 pontos)**
   ```
   "precisa pagar urgente"
   "preço especial só hoje"
   "meu primo tem esse jogo mais barato"
   ```

2. **Pagamento Fora (+50 pontos)**
   ```
   "manda PIX direto"
   "evita a taxa da plataforma"
   "ag 1234 conta 5678-9"
   "CPF: 123.456.789-01"
   ```

3. **Contato Externo (+30 pontos)**
   ```
   "(11) 98765-4321"
   "me adiciona no WhatsApp"
   "meu Instagram: @..."
   ```

4. **Linguagem Abusiva (+60 pontos)**
   ```
   Xingamentos
   Ameaças
   Discriminação
   ```

5. **Phishing (+80 pontos)**
   ```
   "clica nesse link"
   "verifica tua conta aqui"
   "manda foto do teu cartão"
   ```

#### 2. Alertas Automáticos

Quando detecta algo suspeito:

```javascript
{
  "is_suspicious": true,
  "risk_score": 75,
  "alert_type": "payment_outside",
  "description": "Tentativa de solicitar pagamento via PIX fora da plataforma",
  "detected_patterns": ["PIX", "dados bancários"],
  "should_block": true,
  "recommendation": "Bloquear mensagem e alertar usuário"
}
```

#### 3. Banco de Dados de Alertas

Tabela `chat_alerts`:
- ID do alerta
- Sala de chat
- Mensagem flagrada
- Usuário infrator
- Tipo de alerta
- Score de risco
- Padrões detectados
- Status (resolvido/pendente)
- Quem resolveu
- Data de criação

#### 4. Dashboard de Moderação

```python
GET /chat/alerts?unresolved_only=true
```

Admins veem:
- Alertas pendentes
- Score de risco
- Usuários com múltiplas infrações
- Histórico completo

---

### Implementação no Mobile

**1. Antes de Enviar Mensagem:**

```javascript
// Usuário digita mensagem
const message = "Oi, faz PIX direto?";

// App envia para moderação ANTES de enviar
const moderation = await api.post('/chat/moderate-message', {
  room_id: chatRoom.id,
  message_content: message
});

if (moderation.should_block) {
  // Bloquear e mostrar aviso
  Alert.alert(
    '⚠️ Mensagem Bloqueada',
    moderation.description + '\n\n' +
    'Para sua segurança, mantenha negociações na plataforma.',
    [{ text: 'Entendi' }]
  );
  return; // NÃO envia mensagem
}

// Se passou na moderação, envia normalmente
await api.post(`/chat/rooms/${chatRoom.id}/messages`, {
  content: message
});
```

**2. Avisos Visuais:**

```jsx
{/* Banner de segurança no chat */}
<View style={styles.securityBanner}>
  <Text>🛡️ Chat monitorado por IA para sua segurança</Text>
  <Text>Mantenha transações na plataforma</Text>
</View>
```

---

## 📅 Feature 2: Feed de Eventos de Jogos Retro

### Problema que Resolve

Colecionadores de jogos retro no Brasil sofrem com:
- ❌ Falta de informação sobre eventos
- ❌ Feiras do rolo divulgadas só no boca a boca
- ❌ Eventos espalhados em grupos do Facebook
- ❌ Difícil encontrar eventos por região

### Solução

**IA descobre e centraliza TODOS os eventos de jogos retro do Brasil**, organizados por estado.

### Tipos de Eventos

1. **📦 Feiras do Rolo**
   - Compra, venda e troca
   - Maior oportunidade de encontrar raridades

2. **🤝 Encontros de Colecionadores**
   - Networking
   - Troca de experiências

3. **🏆 Campeonatos**
   - Speedruns
   - High scores
   - Torneios de jogos clássicos

4. **🎨 Exposições**
   - Museus de videogames
   - Mostras de consoles raros

### Como Funciona

#### 1. Descoberta Automática com IA

```python
POST /events/discover
{
  "state": "SP"
}
```

IA pesquisa:
- Sites de eventos
- Grupos de colecionadores
- Redes sociais
- Lojas especializadas
- Histórico de feiras regulares

Retorna eventos estruturados:
```json
{
  "title": "Feira Retro Games SP 2026",
  "description": "Maior feira de jogos retro de São Paulo",
  "event_type": "feira",
  "state": "SP",
  "city": "São Paulo",
  "start_date": "2026-05-10",
  "address": "Rua Augusta, 1000 - Centro",
  "organizer": "RetroGamers SP",
  "website": "https://...",
  "source_info": "Encontrado via site oficial"
}
```

#### 2. Calendário Visual

```python
GET /events?state=SP&upcoming_only=true
```

Filtros:
- Por estado (SP, RJ, MG, etc)
- Por tipo (feira, encontro, campeonato, exposicao)
- Apenas futuros ou incluir passados
- Ordenado por data

#### 3. Sistema de Interesse

```python
POST /events/{event_id}/interest
```

Usuário marca "Tenho Interesse":
- ✅ Recebe notificação 1 semana antes
- ✅ Recebe notificação 1 dia antes
- ✅ Vê quantas pessoas vão
- ✅ Pode conhecer outros interessados

#### 4. Criação Manual

Usuários podem adicionar eventos:
```python
POST /events
{
  "title": "Encontro Retro Gamers RJ",
  "description": "...",
  "event_type": "encontro",
  "state": "RJ",
  "city": "Rio de Janeiro",
  "start_date": "2026-06-15",
  ...
}
```

Status:
- 🟡 Criado por usuário → Precisa verificação
- 🟢 Criado por IA → Automaticamente confiável
- ✅ Verificado por admin → Badge especial

---

### Implementação no Mobile

#### 1. Tela de Eventos

```jsx
function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [selectedState, setSelectedState] = useState('SP');

  const loadEvents = async () => {
    const data = await api.get('/events', {
      params: {
        state: selectedState,
        upcoming_only: true
      }
    });
    setEvents(data);
  };

  return (
    <View>
      {/* Filtro por Estado */}
      <StatePicker
        value={selectedState}
        onChange={setSelectedState}
      />

      {/* Botão de Descoberta IA */}
      <TouchableOpacity onPress={discoverEvents}>
        <Text>🤖 Descobrir Eventos com IA</Text>
      </TouchableOpacity>

      {/* Lista de Eventos */}
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <EventCard event={item} />
        )}
      />
    </View>
  );
}
```

#### 2. Card de Evento

```jsx
function EventCard({ event }) {
  const [interested, setInterested] = useState(false);

  return (
    <View style={styles.eventCard}>
      <View style={styles.dateTag}>
        <Text>{formatDate(event.start_date)}</Text>
      </View>

      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.type}>{getEventIcon(event.event_type)} {event.event_type}</Text>
      <Text style={styles.location}>📍 {event.city}/{event.state}</Text>

      {event.is_verified && (
        <View style={styles.verifiedBadge}>
          <Text>✅ Verificado</Text>
        </View>
      )}

      <Text style={styles.interest}>
        {event.interest_count} pessoas interessadas
      </Text>

      <TouchableOpacity
        style={interested ? styles.interestedButton : styles.interestButton}
        onPress={toggleInterest}
      >
        <Text>
          {interested ? '✅ Interessado' : '⭐ Marcar Interesse'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

#### 3. Notificações

```javascript
// Agendar notificações para eventos interessados
async function scheduleEventNotifications(event) {
  // 7 dias antes
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `📅 Evento em 1 semana!`,
      body: `${event.title} acontece em ${event.city}/${event.state}`,
    },
    trigger: {
      date: new Date(event.start_date - 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 1 dia antes
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🚨 Evento AMANHÃ!`,
      body: `${event.title} é amanhã! Não perca!`,
    },
    trigger: {
      date: new Date(event.start_date - 1 * 24 * 60 * 60 * 1000),
    },
  });
}
```

---

## 🎯 Diferenciais Competitivos

### Vs Mercado Livre / OLX

| RetroTrade | Concorrentes |
|------------|--------------|
| ✅ IA detecta fraudes em tempo real | ❌ Sem proteção |
| ✅ Chat monitorado | ❌ Chat sem moderação |
| ✅ Feed de eventos retro | ❌ Inexistente |
| ✅ Comunidade especializada | ❌ Genérico |

### Vs Grupos do Facebook

| RetroTrade | Grupos FB |
|------------|-----------|
| ✅ IA anti-golpe | ❌ Cheio de golpistas |
| ✅ Eventos centralizados | ❌ Espalhados |
| ✅ Notificações inteligentes | ❌ Nada |
| ✅ Sistema de reputação | ❌ Sem verificação |

---

## 💰 Monetização

### Plano Gratuito
- ✅ Chat monitorado (segurança básica)
- ✅ Ver eventos
- ✅ Marcar 3 interesses/mês

### Plano Pro (R$ 19,90/mês)
- ✅ Alertas prioritários
- ✅ Interesses ilimitados
- ✅ Notificações personalizadas
- ✅ Descoberta IA ilimitada
- ✅ Ver quem vai nos eventos

### Plano Vendedor (R$ 49,90/mês)
- ✅ Tudo do Pro
- ✅ Badge "Vendedor Confiável"
- ✅ Histórico zero de fraudes
- ✅ Destaque nos eventos
- ✅ Criar eventos próprios

---

## 📊 Métricas de Sucesso

### Moderação de Chat
- Tentativas de fraude bloqueadas
- Usuários protegidos
- Taxa de falsos positivos (< 5%)
- Redução de reclamações

### Eventos
- Eventos descobertos por estado
- Usuários interessados
- Taxa de comparecimento
- Eventos criados por usuários
- Engajamento (comentários, compartilhamentos)

---

## 🔐 Privacidade e Ética

### Moderação de Chat

**O que a IA FAZ:**
- ✅ Analisa padrões de fraude conhecidos
- ✅ Detecta comportamentos suspeitos
- ✅ Protege usuários de golpes

**O que a IA NÃO FAZ:**
- ❌ Ler conversas privadas para outros fins
- ❌ Compartilhar conteúdo com terceiros
- ❌ Armazenar mensagens além do necessário

**Transparência:**
- Usuários são avisados que chat é moderado por IA
- Alertas explicam por que mensagem foi bloqueada
- Direito de recurso para falsos positivos

### Descoberta de Eventos

**Fontes Públicas:**
- ✅ Sites públicos de eventos
- ✅ Informações já divulgadas
- ✅ Redes sociais públicas

**Não Faz:**
- ❌ Invadir grupos privados
- ❌ Coletar dados pessoais
- ❌ Spam em comunidades

---

## 🚀 Próximos Passos

### Fase 1 - Implementar no Mobile
1. Tela de Eventos
2. Integração de Moderação no Chat
3. Sistema de Notificações

### Fase 2 - Melhorias
4. Machine Learning para melhorar detecção
5. Busca automática semanal de eventos
6. Integração com Google Maps
7. Compartilhamento social

### Fase 3 - Expansão
8. API pública para organizadores de eventos
9. Parcerias com lojas físicas
10. Sistema de check-in em eventos
11. Matchmaking de colecionadores

---

## 🆘 Suporte

**Backend configurado e funcionando!**

Para testar:
```bash
curl -X POST http://192.168.1.11:8000/chat/moderate-message \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"room_id": 1, "message_content": "Manda PIX direto?"}'
```

**Próximo passo:** Implementar no app mobile!
