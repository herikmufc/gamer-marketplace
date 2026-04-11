/**
 * 🎮 RetroTrade Brasil - Design System
 * Tema Bege/Laranja - Estilo Retro
 */

export const colors = {
  // Background - Tons Bege/Creme
  background: {
    primary: '#f5f1e8',      // Bege claro (fundo principal)
    secondary: '#ffffff',    // Branco (cards)
    tertiary: '#ffe8cc',     // Bege mais claro
  },

  // Laranja Principal
  yellow: {
    primary: '#ff6b35',      // Laranja vibrante
    secondary: '#ff8c42',    // Laranja médio
    dark: '#e55a2b',         // Laranja escuro
    light: '#ffb088',        // Laranja claro
  },

  // Personagens Clássicos (para compatibilidade)
  mario: {
    red: '#FF1744',
    blue: '#2196F3',
  },

  sonic: {
    blue: '#4A9EFF',
    yellow: '#ff6b35',
  },

  pacman: {
    yellow: '#ff6b35',
    ghost: {
      red: '#FF1744',
      pink: '#FFB8FF',
      cyan: '#00FFFF',
      orange: '#ff6b35',
    }
  },

  // Status
  success: '#4CAF50',        // Verde
  warning: '#FF9100',        // Laranja
  error: '#FF1744',          // Vermelho
  info: '#2196F3',           // Azul

  // Text
  text: {
    primary: '#2d2d2d',      // Preto suave
    secondary: '#666666',    // Cinza médio
    muted: '#999999',        // Cinza claro
    yellow: '#ff6b35',       // Laranja
  },

  // Border
  border: {
    dark: '#e0d5c7',         // Bege escuro
    light: '#f0e6d8',        // Bege claro
    yellow: '#ff6b35',       // Laranja
  },

  // Transparências
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const gradients = {
  orange: ['#ff6b35', '#e55a2b'],
  beige: ['#f5f1e8', '#ffe8cc'],
  yellow: ['#ff6b35', '#e55a2b'],
  retro: ['#FF1744', '#ff6b35'],
  pacman: ['#ff6b35', '#e55a2b'],
  sonic: ['#4A9EFF', '#1976D2'],
  dark: ['#2d2d2d', '#1a1a1a'],
};

export default colors;
