import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    cpf: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const formatCPF = (text) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');

    // Aplica máscara: 000.000.000-00
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatPhone = (text) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');

    // Aplica máscara: (00) 00000-0000
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.username || !formData.password || !formData.full_name || !formData.cpf) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    // Validar CPF (11 dígitos)
    const cpfNumbers = formData.cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      Alert.alert('Erro', 'CPF inválido. Digite 11 dígitos.');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>
          🔒 Seus dados são protegidos por lei (LGPD)
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nome completo *"
            value={formData.full_name}
            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="CPF * (obrigatório para segurança)"
            value={formData.cpf}
            onChangeText={(text) => setFormData({ ...formData, cpf: formatCPF(text) })}
            keyboardType="numeric"
            maxLength={14}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone (opcional)"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: formatPhone(text) })}
            keyboardType="phone-pad"
            maxLength={15}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="E-mail *"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Usuário *"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Senha *"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🛡️</Text>
            <Text style={styles.securityText}>
              Seu CPF é usado apenas para segurança e identificação.
              Nunca será compartilhado publicamente.
            </Text>
          </View>

          <RetroButton
            title="Cadastrar"
            icon="🎮"
            onPress={handleRegister}
            loading={loading}
            variant="primary"
            size="large"
            style={styles.registerButton}
          />

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkText}>
              Já tem conta? <Text style={styles.linkBold}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.dark,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: colors.text.muted,
    fontSize: 14,
  },
  linkBold: {
    color: colors.yellow.primary,
    fontWeight: 'bold',
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.success,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
