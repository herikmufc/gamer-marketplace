import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

/**
 * 🎮 Card Estilo Retro Gaming
 */
export default function RetroCard({ children, style, variant = 'default' }) {
  return (
    <View style={[styles.card, styles[`card_${variant}`], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
    padding: 16,
    borderWidth: 3,
    borderColor: colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  card_default: {
    borderColor: colors.text.primary,
  },
  card_highlighted: {
    borderColor: colors.text.primary,
    borderWidth: 4,
    backgroundColor: colors.yellow.primary,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
  },
  card_premium: {
    borderColor: colors.text.primary,
    borderWidth: 4,
    backgroundColor: colors.background.tertiary,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
  },
});
