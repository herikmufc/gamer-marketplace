// Configuração de ambiente
// Mude para 'local' para desenvolvimento ou 'production' para produção

const ENV = 'local'; // 'local' ou 'production'

const environments = {
  local: {
    API_URL: 'http://192.168.1.13:8000',
    ENV_NAME: 'Development',
  },
  production: {
    API_URL: 'https://gamer-marketplace.onrender.com',
    ENV_NAME: 'Production',
  },
};

const currentEnv = environments[ENV];

export const API_URL = currentEnv.API_URL;
export const ENV_NAME = currentEnv.ENV_NAME;

console.log(`🌍 Ambiente ativo: ${ENV_NAME} (${API_URL})`);
