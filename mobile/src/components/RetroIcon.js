import React from 'react';
import { Image, StyleSheet } from 'react-native';

/**
 * 🎮 Ícones Customizados Pixel Art - RetroTrade Brasil
 *
 * 64 ícones únicos extraídos da sprite sheet completa
 */

// Mapeamento completo de todos os 64 ícones
const ICON_FILES = {
  // LINHA 1 - Navegação Principal
  'home': require('../../assets/icons/home.png'),
  'events': require('../../assets/icons/events.png'),
  'forum': require('../../assets/icons/forum.png'),
  'cheats': require('../../assets/icons/cheats.png'),
  'help': require('../../assets/icons/help.png'),
  'chat': require('../../assets/icons/chat.png'),
  'profile': require('../../assets/icons/profile.png'),
  'settings': require('../../assets/icons/settings.png'),

  // LINHA 2 - Categorias de Produtos
  'all': require('../../assets/icons/all.png'),
  'consoles': require('../../assets/icons/consoles.png'),
  'games': require('../../assets/icons/games.png'),
  'game': require('../../assets/icons/games.png'), // alias
  'hardware': require('../../assets/icons/hardware.png'),
  'peripherals': require('../../assets/icons/peripherals.png'),
  'marketplace': require('../../assets/icons/marketplace.png'),
  'cartridge': require('../../assets/icons/cartridge.png'),
  'joystick': require('../../assets/icons/joystick.png'),

  // LINHA 3 - Ações & UI
  'search': require('../../assets/icons/search.png'),
  'add': require('../../assets/icons/add.png'),
  'plus': require('../../assets/icons/add.png'), // alias
  'send': require('../../assets/icons/send.png'),
  'back': require('../../assets/icons/back.png'),
  'arrow-back': require('../../assets/icons/back.png'), // alias
  'camera': require('../../assets/icons/camera.png'),
  'image': require('../../assets/icons/image.png'),
  'gallery': require('../../assets/icons/gallery.png'),
  'bookmark': require('../../assets/icons/bookmark.png'),
  'share': require('../../assets/icons/share.png'),

  // LINHA 4 - Social & Interações
  'discussion': require('../../assets/icons/discussion.png'),
  'question': require('../../assets/icons/question.png'),
  'idea': require('../../assets/icons/idea.png'),
  'lightbulb': require('../../assets/icons/idea.png'), // alias
  'star': require('../../assets/icons/star.png'),
  'pin': require('../../assets/icons/pin.png'),
  'heart': require('../../assets/icons/heart.png'),
  'trophy': require('../../assets/icons/trophy.png'),
  'fire': require('../../assets/icons/fire.png'),

  // LINHA 5 - Tipos de Eventos
  'tent': require('../../assets/icons/tent.png'),
  'fair': require('../../assets/icons/tent.png'), // alias
  'handshake': require('../../assets/icons/handshake.png'),
  'meetup': require('../../assets/icons/handshake.png'), // alias
  'medal': require('../../assets/icons/medal.png'),
  'championship': require('../../assets/icons/medal.png'), // alias
  'calendar': require('../../assets/icons/calendar.png'),
  'location': require('../../assets/icons/location.png'),
  'map-pin': require('../../assets/icons/location.png'), // alias
  'ticket': require('../../assets/icons/ticket.png'),
  'flag': require('../../assets/icons/flag.png'),

  // LINHA 6 - Categorias de Fórum
  'circuit': require('../../assets/icons/circuit.png'),
  'console-stack': require('../../assets/icons/console-stack.png'),
  'game-stack': require('../../assets/icons/game-stack.png'),
  'tools': require('../../assets/icons/tools.png'),
  'modifications': require('../../assets/icons/tools.png'), // alias
  'tv-retro': require('../../assets/icons/tv-retro.png'),
  'emulation': require('../../assets/icons/tv-retro.png'), // alias
  'community': require('../../assets/icons/community.png'),
  'price-tag': require('../../assets/icons/price-tag.png'),
  'arcade': require('../../assets/icons/arcade.png'),

  // LINHA 7 - Consoles Específicos
  'nes': require('../../assets/icons/nes.png'),
  'snes': require('../../assets/icons/snes.png'),
  'genesis': require('../../assets/icons/genesis.png'),
  'mega-drive': require('../../assets/icons/genesis.png'), // alias
  'playstation': require('../../assets/icons/playstation.png'),
  'ps1': require('../../assets/icons/playstation.png'), // alias
  'n64': require('../../assets/icons/n64.png'),
  'nintendo-64': require('../../assets/icons/n64.png'), // alias
  'gameboy': require('../../assets/icons/gameboy.png'),
  'game-boy': require('../../assets/icons/gameboy.png'), // alias
  'atari': require('../../assets/icons/atari.png'),
  'dreamcast': require('../../assets/icons/dreamcast.png'),

  // LINHA 8 - Mascote & Extras
  'cat-robot': require('../../assets/icons/cat-robot.png'),
  'cat-gamer': require('../../assets/icons/cat-gamer.png'),
  'cat-coder': require('../../assets/icons/cat-coder.png'),
  'cat-happy': require('../../assets/icons/cat-happy.png'),
  'verified': require('../../assets/icons/verified.png'),
  'checkmark': require('../../assets/icons/verified.png'), // alias
  'warning': require('../../assets/icons/warning.png'),
  'alert': require('../../assets/icons/warning.png'), // alias
  'info': require('../../assets/icons/info.png'),
  'information': require('../../assets/icons/info.png'), // alias
  'close': require('../../assets/icons/close.png'),
  'x': require('../../assets/icons/close.png'), // alias
};

/**
 * Componente de ícone retro customizado
 *
 * @param {string} name - Nome do ícone (ver lista completa acima)
 * @param {number} size - Tamanho do ícone em pixels (default: 24)
 * @param {object} style - Estilos adicionais
 */
export default function RetroIcon({ name, size = 24, style }) {
  const iconSource = ICON_FILES[name];

  if (!iconSource) {
    console.warn(`RetroIcon: ícone "${name}" não encontrado. Ícones disponíveis:`, Object.keys(ICON_FILES).sort());
    return null;
  }

  return (
    <Image
      source={iconSource}
      style={[
        styles.icon,
        {
          width: size,
          height: size,
        },
        style,
      ]}
      resizeMode="contain"
      fadeDuration={0}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    // Mantém proporções dos ícones pixel art
  },
});
