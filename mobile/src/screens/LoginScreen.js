import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
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
      <View style={styles.content}>
        {/* Personagens Retro Decorativos */}
        <View style={styles.decorativeHeader}>
          <Text style={styles.decorativeChar}>👾</Text>
          <Text style={styles.decorativeChar}>🎮</Text>
          <Text style={styles.decorativeChar}>👾</Text>
        </View>

        <Text style={styles.logo}>🕹️</Text>
        <Text style={styles.title}>RETROTRADE</Text>
        <Text style={styles.subtitle}>BRASIL</Text>

        <View style={styles.tagline}>
          <Text style={styles.taglineText}>
            🎯 Marketplace de Games Retro
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Usuário"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor={colors.text.muted}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.text.muted}
            />
          </View>

          <RetroButton
            title="🎮 Entrar"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            size="large"
            style={styles.loginButton}
          />

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pac-Man Decorativo */}
        <View style={styles.pacmanContainer}>
          <Text style={styles.pacman}>●●●</Text>
          <Text style={styles.pacmanGhost}>ᗧ</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  decorativeHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 20,
  },
  decorativeChar: {
    fontSize: 32,
    opacity: 0.6,
  },
  logo: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    backgroundColor: colors.background.secondary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.yellow.primary,
    alignSelf: 'center',
    marginBottom: 40,
  },
  taglineText: {
    fontSize: 13,
    color: colors.yellow.primary,
    fontWeight: 'bold',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.dark,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
  },
  loginButton: {
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
  pacmanContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    gap: 8,
  },
  pacman: {
    fontSize: 20,
    color: colors.yellow.primary,
  },
  pacmanGhost: {
    fontSize: 24,
    color: colors.pacman.ghost.red,
  },
});
