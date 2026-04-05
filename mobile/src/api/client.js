import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL - Render Production
// Local development: http://10.0.2.2:8000 (Android emulator)
// Production: Render + Supabase PostgreSQL
const API_URL = 'https://gamer-marketplace.onrender.com';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 segundos (cold start do Render pode demorar ~30s)
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 500, // Aceitar respostas 4xx também
});

// Add token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.log('❌ Response error:', error.message);
    console.log('❌ Error config:', error.config);
    console.log('❌ Error response:', error.response);
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  register: async (userData) => {
    try {
      console.log('📝 [REGISTER] Iniciando registro...', {
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
      });

      const response = await apiClient.post('/register', userData);

      console.log('✅ [REGISTER] Registro bem-sucedido:', response.status);
      console.log('✅ [REGISTER] Usuário criado:', response.data?.username);

      return response.data;
    } catch (error) {
      console.error('❌ [REGISTER] Erro ao registrar:', error.message);
      console.error('❌ [REGISTER] Status:', error.response?.status);
      console.error('❌ [REGISTER] Data:', error.response?.data);
      throw error;
    }
  },

  login: async (username, password) => {
    try {
      console.log('📡 [LOGIN] Iniciando login para:', username);

      // Criar FormData para enviar como application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      console.log('📡 [LOGIN] Enviando requisição para /token');

      // Usar apiClient ao invés de axios direto
      const response = await apiClient.post('/token', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 60000,
      });

      console.log('✅ [LOGIN] Resposta recebida:', response.status);
      console.log('✅ [LOGIN] Token:', response.data?.access_token ? 'OK' : 'FALTANDO');

      if (response.data && response.data.access_token) {
        await AsyncStorage.setItem('token', response.data.access_token);
        console.log('✅ [LOGIN] Token salvo no AsyncStorage');
        return response.data;
      } else {
        throw new Error('Token não retornado pelo servidor');
      }
    } catch (error) {
      console.log('❌ [LOGIN] Erro completo:', error);
      console.log('❌ [LOGIN] Error.message:', error.message);
      console.log('❌ [LOGIN] Error.response:', error.response?.data);
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
  },

  getMe: async () => {
    try {
      console.log('📡 [GET_ME] Buscando dados do usuário...');
      const response = await apiClient.get('/me', {
        timeout: 60000,
      });
      console.log('✅ [GET_ME] Dados recebidos:', response.data?.username);
      return response.data;
    } catch (error) {
      console.log('❌ [GET_ME] Erro:', error.message);
      console.log('❌ [GET_ME] Response:', error.response?.data);
      throw error;
    }
  },
};

// Products API
export const products = {
  list: async (params = {}) => {
    try {
      console.log('📡 [LIST] Buscando produtos...', params);
      const response = await apiClient.get('/products', { params });
      console.log('✅ [LIST] Produtos retornados:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('❌ [LIST] Erro:', error.message);
      throw error;
    }
  },

  get: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await apiClient.get('/search', { params: { q: query } });
    return response.data;
  },

  analyze: async (formData) => {
    try {
      console.log('📊 [ANALYZE] Iniciando análise de preço...');

      const response = await apiClient.post('/products/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      console.log('✅ [ANALYZE] Resposta recebida:', response.status);
      console.log('✅ [ANALYZE] Data:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        return response.data;
      } else {
        console.error('❌ [ANALYZE] Status não-200:', response.status);
        throw new Error(response.data?.detail || 'Erro ao analisar produto');
      }
    } catch (error) {
      console.error('❌ [ANALYZE] Erro completo:', error);
      console.error('❌ [ANALYZE] Response:', error.response?.data);
      console.error('❌ [ANALYZE] Status:', error.response?.status);
      throw error;
    }
  },

  create: async (formData) => {
    try {
      console.log('📤 [CREATE] Criando produto...');
      const response = await apiClient.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      console.log('✅ [CREATE] Produto criado:', response.status);
      console.log('✅ [CREATE] Produto ID:', response.data?.id);
      return response.data;
    } catch (error) {
      console.error('❌ [CREATE] Erro ao criar produto:', error);
      console.error('❌ [CREATE] Response:', error.response?.data);
      throw error;
    }
  },

  identifyGame: async (imageUri) => {
    try {
      console.log('🔍 [IDENTIFY] Enviando imagem para identificação:', imageUri);

      // Criar FormData
      const formData = new FormData();

      // Extrair nome do arquivo e tipo
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Adicionar arquivo
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      });

      console.log('📤 [IDENTIFY] Enviando para /products/identify');

      const response = await apiClient.post('/products/identify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 segundos (Claude Vision pode demorar)
      });

      console.log('✅ [IDENTIFY] Resposta recebida:', response.status);

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(response.data?.detail || 'Erro ao identificar jogo');
      }
    } catch (error) {
      console.error('❌ [IDENTIFY] Erro:', error.message);
      console.error('❌ [IDENTIFY] Response:', error.response?.data);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log('🗑️ [DELETE] Excluindo produto:', id);
      const response = await apiClient.delete(`/products/${id}`);
      console.log('✅ [DELETE] Produto excluído:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [DELETE] Erro ao excluir produto:', error);
      console.error('❌ [DELETE] Response:', error.response?.data);
      throw error;
    }
  },
};

// Events API
export const events = {
  list: async (params = {}) => {
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  get: async (id) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  discover: async (state) => {
    const response = await apiClient.post('/events/discover', { state });
    return response.data;
  },

  markInterest: async (eventId) => {
    const response = await apiClient.post(`/events/${eventId}/interest`);
    return response.data;
  },

  removeInterest: async (eventId) => {
    const response = await apiClient.delete(`/events/${eventId}/interest`);
    return response.data;
  },
};

// Chat Moderation API
export const moderation = {
  moderateMessage: async (roomId, messageContent) => {
    const response = await apiClient.post('/chat/moderate-message', {
      room_id: roomId,
      message_content: messageContent,
    });
    return response.data;
  },

  getAlerts: async (unresolvedOnly = true) => {
    const response = await apiClient.get('/chat/alerts', {
      params: { unresolved_only: unresolvedOnly },
    });
    return response.data;
  },
};

// Payment API
export const payment = {
  // Criar novo pagamento
  create: async (productId, paymentMethodId = 'pix', installments = 1) => {
    try {
      console.log('💳 [PAYMENT CREATE] Iniciando...', {
        productId,
        paymentMethodId,
        installments
      });

      const response = await apiClient.post('/payment/create', {
        product_id: productId,
        payment_method_id: paymentMethodId,
        installments: installments,
      });

      console.log('✅ [PAYMENT CREATE] Sucesso:', response.status);
      console.log('✅ [PAYMENT CREATE] Data:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ [PAYMENT CREATE] Erro:', error.message);
      console.error('❌ [PAYMENT CREATE] Status:', error.response?.status);
      console.error('❌ [PAYMENT CREATE] Data:', error.response?.data);
      throw error;
    }
  },

  // Consultar transação
  get: async (transactionId) => {
    const response = await apiClient.get(`/payment/${transactionId}`);
    return response.data;
  },

  // Vendedor marca como enviado
  markAsShipped: async (transactionId, trackingCode) => {
    const response = await apiClient.post(`/payment/${transactionId}/ship`, {
      tracking_code: trackingCode,
    });
    return response.data;
  },

  // Comprador envia vídeo de verificação
  uploadVideo: async (transactionId, videoFile) => {
    const formData = new FormData();
    formData.append('video_file', {
      uri: videoFile.uri,
      type: videoFile.type || 'video/mp4',
      name: videoFile.name || 'verification.mp4',
    });

    const response = await apiClient.post(
      `/payment/${transactionId}/verify-video`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Liberar pagamento
  release: async (transactionId) => {
    const response = await apiClient.post(`/payment/${transactionId}/release`);
    return response.data;
  },

  // Abrir reclamação
  dispute: async (transactionId, reason) => {
    const response = await apiClient.post(`/payment/${transactionId}/dispute`, {
      reason: reason,
    });
    return response.data;
  },

  // Listar minhas transações
  listMyTransactions: async (asBuyer = true) => {
    const response = await apiClient.get('/my-transactions', {
      params: { as_buyer: asBuyer },
    });
    return response.data;
  },
};

// Maintenance Assistant API
export const maintenance = {
  start: async (console = null) => {
    try {
      console.log('🛠️ [MAINTENANCE] Iniciando sessão...', console);
      const response = await apiClient.post('/maintenance/start',
        console ? { console } : {},
        { timeout: 30000 }
      );
      console.log('✅ [MAINTENANCE] Sessão iniciada:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [MAINTENANCE START] Erro:', error.message);
      console.error('❌ [MAINTENANCE START] Response:', error.response?.data);
      throw error;
    }
  },

  chat: async (message, images = []) => {
    try {
      console.log('💬 [MAINTENANCE CHAT] Enviando:', message, `${images.length} imagens`);

      const formData = new FormData();
      formData.append('message', message);

      // Add images if provided
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const uri = images[i];
          const filename = uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          formData.append('images', {
            uri,
            name: filename,
            type,
          });
        }
      }

      const response = await apiClient.post('/maintenance/chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      console.log('✅ [MAINTENANCE CHAT] Resposta:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [MAINTENANCE CHAT] Erro:', error.message);
      console.error('❌ [MAINTENANCE CHAT] Status:', error.response?.status);
      console.error('❌ [MAINTENANCE CHAT] Data:', error.response?.data);
      throw error;
    }
  },

  tips: async (console) => {
    try {
      console.log('💡 [MAINTENANCE TIPS] Buscando dicas para:', console);
      const response = await apiClient.get(`/maintenance/tips/${encodeURIComponent(console)}`, {
        timeout: 30000,
      });
      console.log('✅ [MAINTENANCE TIPS] Dicas recebidas:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [MAINTENANCE TIPS] Erro:', error.message);
      console.error('❌ [MAINTENANCE TIPS] Response:', error.response?.data);
      throw error;
    }
  },
};

// Mercado Pago API
export const mercadopago = {
  getConnectUrl: async () => {
    try {
      console.log('🔗 [MP] Obtendo URL de conexão...');
      const response = await apiClient.get('/auth/mercadopago/connect');
      console.log('✅ [MP] URL obtida:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [MP] Erro ao obter URL:', error.message);
      throw error;
    }
  },

  getStatus: async () => {
    try {
      console.log('🔍 [MP] Verificando status da conexão...');
      const response = await apiClient.get('/auth/mercadopago/status');
      console.log('✅ [MP] Status obtido:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [MP] Erro ao obter status:', error.message);
      throw error;
    }
  },

  disconnect: async () => {
    try {
      console.log('🔌 [MP] Desconectando conta...');
      const response = await apiClient.post('/auth/mercadopago/disconnect');
      console.log('✅ [MP] Conta desconectada:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [MP] Erro ao desconectar:', error.message);
      throw error;
    }
  },
};

// Chat API
export const chat = {
  createRoom: async (productId) => {
    try {
      console.log('💬 [CHAT] Criando sala para produto:', productId);
      const response = await apiClient.post(`/chat/rooms/${productId}`);
      console.log('✅ [CHAT] Sala criada:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [CHAT] Erro ao criar sala:', error.message);
      throw error;
    }
  },

  getRooms: async () => {
    try {
      console.log('💬 [CHAT] Buscando salas...');
      const response = await apiClient.get('/chat/rooms');
      console.log('✅ [CHAT] Salas obtidas:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [CHAT] Erro ao buscar salas:', error.message);
      throw error;
    }
  },

  getMessages: async (roomId) => {
    try {
      console.log('💬 [CHAT] Buscando mensagens da sala:', roomId);
      const response = await apiClient.get(`/chat/rooms/${roomId}/messages`);
      console.log('✅ [CHAT] Mensagens obtidas:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [CHAT] Erro ao buscar mensagens:', error.message);
      throw error;
    }
  },

  sendMessage: async (roomId, content, messageType = 'text') => {
    try {
      console.log('💬 [CHAT] Enviando mensagem para sala:', roomId);
      const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, {
        content,
        message_type: messageType,
      });
      console.log('✅ [CHAT] Mensagem enviada:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [CHAT] Erro ao enviar mensagem:', error.message);
      throw error;
    }
  },
};

// Shipping API
export const shipping = {
  getAddress: async () => {
    try {
      console.log('📍 [SHIPPING] Buscando endereço...');
      const response = await apiClient.get('/user/address');
      console.log('✅ [SHIPPING] Endereço obtido:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [SHIPPING] Erro ao buscar endereço:', error.message);
      throw error;
    }
  },

  updateAddress: async (addressData) => {
    try {
      console.log('📍 [SHIPPING] Atualizando endereço...', addressData);
      const response = await apiClient.put('/user/address', addressData);
      console.log('✅ [SHIPPING] Endereço atualizado:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [SHIPPING] Erro ao atualizar endereço:', error.message);
      throw error;
    }
  },

  calculateShipping: async (productId, zipcode) => {
    try {
      console.log('📦 [SHIPPING] Calculando frete...', { productId, zipcode });
      const response = await apiClient.post('/shipping/calculate', {
        product_id: productId,
        zipcode: zipcode,
      });
      console.log('✅ [SHIPPING] Frete calculado:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ [SHIPPING] Erro ao calcular frete:', error.message);
      throw error;
    }
  },
};

export const api = apiClient;
export default apiClient;
