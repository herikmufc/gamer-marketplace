/**
 * 🎮 RetroTrade Brasil - Design System
 * Inspirado em jogos retro clássicos
 */

export const colors = {
  // Background
  background: {
    primary: '#0a0a0a',      // Preto profundo
    secondary: '#1a1a1a',    // Preto suave
    tertiary: '#2a2a2a',     // Cinza escuro
  },

  // Amarelo Retro (Pac-Man vibes)
  yellow: {
    primary: '#FFD700',      // Amarelo ouro
    secondary: '#FFC107',    // Amarelo mostarda
    dark: '#FFA000',         // Amarelo escuro
    light: '#FFECB3',        // Amarelo claro
  },

  // Personagens Clássicos
  mario: {
    red: '#FF1744',          // Vermelho Mario
    blue: '#2196F3',         // Azul Mario
  },

  sonic: {
    blue: '#4A9EFF',         // Azul Sonic
    yellow: '#FFD700',       // Anéis dourados
  },

  pacman: {
    yellow: '#FFFF00',       // Pac-Man
    ghost: {
      red: '#FF0000',        // Blinky
      pink: '#FFB8FF',       // Pinky
      cyan: '#00FFFF',       // Inky
      orange: '#FFB852',     // Clyde
    }
  },

  // Status
  success: '#4CAF50',        // Verde Luigi
  warning: '#FF9100',        // Laranja
  error: '#FF1744',          // Vermelho
  info: '#4A9EFF',           // Azul

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    muted: '#999999',
    yellow: '#FFD700',
  },

  // Border
  border: {
    dark: '#333333',
    light: '#444444',
    yellow: '#FFD700',
  },

  // Transparências
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
};

export const gradients = {
  yellow: ['#FFD700', '#FFA000'],
  retro: ['#FF1744', '#FFD700'],
  pacman: ['#FFFF00', '#FFA000'],
  sonic: ['#4A9EFF', '#1976D2'],
  dark: ['#1a1a1a', '#0a0a0a'],
};

export default colors;
