import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

/**
 * 🎮 Botão Estilo Retro Gaming
 */
export default function RetroButton({
  title,
  onPress,
  variant = 'primary', // primary, secondary, ghost, danger
  size = 'medium', // small, medium, large
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
}) {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];

    if (disabled || loading) {
      baseStyle.push(styles.button_disabled);
    } else {
      baseStyle.push(styles[`button_${variant}`]);
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${size}`]];
    baseStyle.push(styles[`text_${variant}`]);

    if (textStyle) {
      baseStyle.push(textStyle);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.background.primary} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Base Button
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 3,
    gap: 6,
  },

  // Sizes
  button_small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  button_medium: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  button_large: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },

  // Variants
  button_primary: {
    backgroundColor: colors.yellow.primary,
    borderColor: colors.yellow.dark,
    shadowColor: colors.yellow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button_secondary: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.yellow.primary,
  },
  button_ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.yellow.primary,
  },
  button_danger: {
    backgroundColor: colors.error,
    borderColor: '#c41c2e',
  },
  button_disabled: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.dark,
    opacity: 0.5,
  },

  // Text Styles
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  text_small: {
    fontSize: 11,
  },
  text_medium: {
    fontSize: 12,
  },
  text_large: {
    fontSize: 13,
  },
  text_primary: {
    color: colors.background.primary,
  },
  text_secondary: {
    color: colors.yellow.primary,
  },
  text_ghost: {
    color: colors.yellow.primary,
  },
  text_danger: {
    color: colors.text.primary,
  },

  icon: {
    fontSize: 16,
  },
});
