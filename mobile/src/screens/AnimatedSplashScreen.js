import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export default function AnimatedSplashScreen({ onFinish }) {
  // Animações
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;
  const particlesOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequência de animações estilo OLX/Mercado Livre
    Animated.sequence([
      // 1. Logo aparece com bounce
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 2. Pequena rotação para dar vida
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),

      // 3. Particulas aparecem
      Animated.timing(particlesOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // 4. Espera um pouco
      Animated.delay(800),

      // 5. Fade out tudo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(particlesOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onFinish();
    });

    // Animação de pulso contínua do brilho
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background gradient simulado */}
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />

      {/* Partículas decorativas */}
      <Animated.View
        style={[
          styles.particlesContainer,
          { opacity: particlesOpacity },
        ]}
      >
        <View style={[styles.particle, styles.particle1]}>✨</View>
        <View style={[styles.particle, styles.particle2]}>🎮</View>
        <View style={[styles.particle, styles.particle3]}>👾</View>
        <View style={[styles.particle, styles.particle4]}>🕹️</View>
        <View style={[styles.particle, styles.particle5]}>⭐</View>
        <View style={[styles.particle, styles.particle6]}>🎯</View>
      </Animated.View>

      {/* Glow effect (brilho por trás) */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: glowPulse }],
          },
        ]}
      >
        <View style={styles.glow} />
      </Animated.View>

      {/* Logo principal */}
      <Animated.Image
        source={require('../../assets/logo.png')}
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [
              { scale: logoScale },
              { rotate: rotate },
            ],
          },
        ]}
        resizeMode="contain"
      />

      {/* Texto opcional (pode remover se preferir) */}
      <Animated.View style={[styles.textContainer, { opacity: logoOpacity }]}>
        <Animated.Text style={styles.title}>RETROTRADE</Animated.Text>
        <Animated.Text style={styles.subtitle}>BRASIL</Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: '#1a1a2e',
    opacity: 0.5,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: '#0f0f1e',
    opacity: 0.5,
  },
  glowContainer: {
    position: 'absolute',
  },
  glow: {
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: colors.yellow.primary,
    opacity: 0.2,
    shadowColor: colors.yellow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
    elevation: 20,
  },
  logo: {
    width: 280,
    height: 280,
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 6,
    textShadowColor: colors.yellow.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.muted,
    letterSpacing: 4,
    marginTop: 4,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    fontSize: 32,
  },
  particle1: {
    top: '15%',
    left: '10%',
  },
  particle2: {
    top: '25%',
    right: '15%',
  },
  particle3: {
    top: '60%',
    left: '12%',
  },
  particle4: {
    top: '70%',
    right: '18%',
  },
  particle5: {
    top: '40%',
    left: '8%',
  },
  particle6: {
    top: '50%',
    right: '10%',
  },
});
