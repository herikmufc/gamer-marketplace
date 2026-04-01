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
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  card_default: {
    borderColor: colors.border.dark,
  },
  card_highlighted: {
    borderColor: colors.yellow.primary,
    shadowColor: colors.yellow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  card_premium: {
    borderColor: colors.yellow.primary,
    borderWidth: 3,
    backgroundColor: colors.background.tertiary,
  },
});
