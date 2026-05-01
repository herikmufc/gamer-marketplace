import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../api/client';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const userData = await auth.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('🔐 [AUTH] Iniciando processo de login...');
      console.log('🔐 [AUTH] Username:', username);

      await auth.login(username, password);
      console.log('✅ [AUTH] Login OK, token recebido');

      console.log('📡 [AUTH] Buscando dados do usuário...');
      const userData = await auth.getMe();
      console.log('✅ [AUTH] Dados do usuário recebidos:', userData.username);

      setUser(userData);
      console.log('✅ [AUTH] Login completo com sucesso!');

      return { success: true };
    } catch (error) {
      console.log('❌ [AUTH] ERRO NO LOGIN');
      console.log('❌ [AUTH] Error.name:', error.name);
      console.log('❌ [AUTH] Error.message:', error.message);
      console.log('❌ [AUTH] Error.code:', error.code);
      console.log('❌ [AUTH] Error.response:', JSON.stringify(error.response?.data));

      let errorMessage = 'Login falhou';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tempo de conexão esgotado. Verifique sua internet.';
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
        errorMessage = 'Erro de rede. Verifique se está na mesma WiFi.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Tentando registrar:', userData.username);
      await auth.register(userData);
      console.log('✅ Registro OK, fazendo auto-login...');
      // Auto login after register
      return await login(userData.username, userData.password);
    } catch (error) {
      console.log('❌ Erro no registro:', error);
      console.log('❌ Error.response:', error.response);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Registro falhou',
      };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 [LOGOUT] Iniciando logout...');
      await auth.logout();
      console.log('✅ [LOGOUT] Token removido');
      setUser(null);
      console.log('✅ [LOGOUT] User state limpo');

      // Force reload para garantir que o estado é limpo completamente
      if (typeof window !== 'undefined') {
        console.log('🔄 [LOGOUT] Recarregando página (web)...');
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      console.error('❌ [LOGOUT] Erro:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
