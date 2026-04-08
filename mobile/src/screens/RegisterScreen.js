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
    address_zipcode: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
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

  const formatZipcode = (text) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');

    // Aplica máscara: 00000-000
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
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

    // Validar endereço
    if (!formData.address_zipcode || !formData.address_street || !formData.address_number ||
        !formData.address_neighborhood || !formData.address_city || !formData.address_state) {
      Alert.alert('Erro', 'Preencha todos os campos de endereço obrigatórios');
      return;
    }

    // Validar CEP (8 dígitos)
    const zipNumbers = formData.address_zipcode.replace(/\D/g, '');
    if (zipNumbers.length !== 8) {
      Alert.alert('Erro', 'CEP inválido. Digite 8 dígitos.');
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

          {/* Seção de Endereço */}
          <Text style={styles.sectionTitle}>📍 Endereço de Envio/Entrega</Text>
          <Text style={styles.sectionSubtitle}>
            Usado para calcular frete em suas compras e vendas
          </Text>

          <TextInput
            style={styles.input}
            placeholder="CEP * (somente números)"
            value={formData.address_zipcode}
            onChangeText={(text) => setFormData({ ...formData, address_zipcode: formatZipcode(text) })}
            keyboardType="numeric"
            maxLength={9}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Rua/Avenida *"
            value={formData.address_street}
            onChangeText={(text) => setFormData({ ...formData, address_street: text })}
            placeholderTextColor="#999"
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              placeholder="Número *"
              value={formData.address_number}
              onChangeText={(text) => setFormData({ ...formData, address_number: text })}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder="Complemento"
              value={formData.address_complement}
              onChangeText={(text) => setFormData({ ...formData, address_complement: text })}
              placeholderTextColor="#999"
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Bairro *"
            value={formData.address_neighborhood}
            onChangeText={(text) => setFormData({ ...formData, address_neighborhood: text })}
            placeholderTextColor="#999"
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder="Cidade *"
              value={formData.address_city}
              onChangeText={(text) => setFormData({ ...formData, address_city: text })}
              placeholderTextColor="#999"
            />

            <TextInput
              style={[styles.input, styles.inputSmall]}
              placeholder="UF *"
              value={formData.address_state}
              onChangeText={(text) => setFormData({ ...formData, address_state: text.toUpperCase() })}
              maxLength={2}
              autoCapitalize="characters"
              placeholderTextColor="#999"
            />
          </View>

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 1,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 16,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputSmall: {
    flex: 1,
  },
  inputLarge: {
    flex: 2,
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
