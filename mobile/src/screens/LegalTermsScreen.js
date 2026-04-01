import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function LegalTermsScreen({ navigation }) {
  const [scrolledToEnd, setScrolledToEnd] = useState(false);

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isEnd) {
      setScrolledToEnd(true);
    }
  };

  const handleAccept = () => {
    navigation.replace('Login');
  };

  const handleDecline = () => {
    Alert.alert(
      'Atenção',
      'Você precisa aceitar os termos para usar o aplicativo.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>⚖️</Text>
        <Text style={styles.title}>RetroTrade Brasil</Text>
        <Text style={styles.subtitle}>Termos Legais e de Segurança</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        <View style={styles.warning}>
          <Text style={styles.warningIcon}>🚨</Text>
          <Text style={styles.warningTitle}>ATENÇÃO IMPORTANTE</Text>
          <Text style={styles.warningText}>
            Este aplicativo segue rigorosamente a legislação brasileira.
            Atividades fraudulentas são CRIMES e serão reportadas às
            autoridades.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🔒 Crimes Contra o Patrimônio
          </Text>

          <Text style={styles.law}>
            <Text style={styles.lawTitle}>Art. 155 - Furto{'\n'}</Text>
            <Text style={styles.lawPenalty}>Pena: 1 a 4 anos + multa{'\n'}</Text>
            <Text style={styles.lawText}>
              • Pegar produto sem pagar{'\n'}
              • Retirar item e desaparecer
            </Text>
          </Text>

          <Text style={styles.law}>
            <Text style={styles.lawTitle}>Art. 157 - Roubo{'\n'}</Text>
            <Text style={styles.lawPenalty}>Pena: 4 a 10 anos + multa{'\n'}</Text>
            <Text style={styles.lawText}>
              • Usar violência ou ameaça{'\n'}
              • Forçar venda/compra com intimidação
            </Text>
          </Text>

          <Text style={styles.law}>
            <Text style={styles.lawTitle}>Art. 171 - Estelionato{'\n'}</Text>
            <Text style={styles.lawPenalty}>Pena: 1 a 5 anos + multa{'\n'}</Text>
            <Text style={styles.lawText}>
              • Anunciar produto que não possui{'\n'}
              • Vender falsificações como originais{'\n'}
              • Cobrar e não entregar produto{'\n'}
              • Usar fotos de produtos de terceiros
            </Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📄 Crimes de Falsificação
          </Text>

          <Text style={styles.law}>
            <Text style={styles.lawTitle}>Art. 297 - Falsificação{'\n'}</Text>
            <Text style={styles.lawPenalty}>Pena: 2 a 6 anos + multa{'\n'}</Text>
            <Text style={styles.lawText}>
              • Uso de CPF falso ou de terceiros{'\n'}
              • Documentos de identidade falsificados
            </Text>
          </Text>

          <Text style={styles.law}>
            <Text style={styles.lawTitle}>Art. 184 - Direito Autoral{'\n'}</Text>
            <Text style={styles.lawPenalty}>Pena: 3 meses a 1 ano{'\n'}</Text>
            <Text style={styles.lawText}>
              • Venda de jogos piratas{'\n'}
              • Reprodução não autorizada
            </Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🛡️ Medidas de Segurança
          </Text>

          <Text style={styles.measure}>
            <Text style={styles.measureIcon}>📋 </Text>
            <Text style={styles.measureTitle}>CPF Obrigatório{'\n'}</Text>
            <Text style={styles.measureText}>
              Todos usuários devem cadastrar CPF real para
              rastreabilidade.
            </Text>
          </Text>

          <Text style={styles.measure}>
            <Text style={styles.measureIcon}>🔍 </Text>
            <Text style={styles.measureTitle}>Monitoramento por IA{'\n'}</Text>
            <Text style={styles.measureText}>
              Sistema detecta padrões de fraude automaticamente.
            </Text>
          </Text>

          <Text style={styles.measure}>
            <Text style={styles.measureIcon}>🚨 </Text>
            <Text style={styles.measureTitle}>Sistema de Denúncias{'\n'}</Text>
            <Text style={styles.measureText}>
              Usuários podem denunciar atividades suspeitas.
            </Text>
          </Text>

          <Text style={styles.measure}>
            <Text style={styles.measureIcon}>⚖️ </Text>
            <Text style={styles.measureTitle}>Colaboração Judicial{'\n'}</Text>
            <Text style={styles.measureText}>
              Dados são fornecidos à Justiça mediante ordem judicial.
            </Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📱 LGPD e Privacidade
          </Text>

          <Text style={styles.lgpd}>
            <Text style={styles.lgpdTitle}>Lei Geral de Proteção de Dados{'\n'}</Text>
            <Text style={styles.lgpdText}>
              • Seus dados são criptografados{'\n'}
              • CPF nunca é compartilhado com terceiros{'\n'}
              • Conversas são protegidas (E2E){'\n'}
              • Você pode solicitar exclusão de dados
            </Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ✅ Ao Aceitar, Você Declara Que:
          </Text>

          <Text style={styles.declaration}>
            {'\u2022 '} Leu e compreendeu todos os artigos acima{'\n'}
            {'\u2022 '} Seu CPF é verdadeiro e pertence a você{'\n'}
            {'\u2022 '} Não utilizará a plataforma para atividades ilícitas{'\n'}
            {'\u2022 '} Está ciente das penalidades legais{'\n'}
            {'\u2022 '} Aceita compartilhamento de dados com autoridades{'\n'}
            {'\u2022 '} Tem mais de 18 anos ou autorização dos responsáveis
          </Text>
        </View>

        <View style={styles.finalWarning}>
          <Text style={styles.finalWarningIcon}>⚠️</Text>
          <Text style={styles.finalWarningText}>
            Esta plataforma NÃO tolera fraudes de qualquer tipo.{'\n'}
            Todos os logs são registrados e podem ser usados em investigações.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {!scrolledToEnd && (
          <Text style={styles.scrollHint}>
            ↓ Role até o final para aceitar ↓
          </Text>
        )}

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.declineButton]}
            onPress={handleDecline}
          >
            <Text style={styles.declineButtonText}>Recusar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.acceptButton,
              !scrolledToEnd && styles.buttonDisabled,
            ]}
            onPress={handleAccept}
            disabled={!scrolledToEnd}
          >
            <Text style={styles.acceptButtonText}>
              Li e Aceito os Termos
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ef4444',
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warning: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  law: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  lawTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  lawPenalty: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  lawText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  measure: {
    marginBottom: 16,
  },
  measureIcon: {
    fontSize: 20,
  },
  measureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10b981',
  },
  measureText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  lgpd: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  lgpdTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  lgpdText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  declaration: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 24,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
  },
  finalWarning: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  finalWarningIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  finalWarningText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  scrollHint: {
    textAlign: 'center',
    color: '#fbbf24',
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#333',
  },
  declineButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
