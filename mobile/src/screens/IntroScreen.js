import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { Video } from 'expo-av';
import { colors } from '../theme/colors';

/**
 * 🎬 Tela de Intro com vídeo do mascote
 *
 * Coloque seu vídeo em: /assets/intro-video.mp4
 * Se não houver vídeo, pula automaticamente
 */
export default function IntroScreen({ onFinish }) {
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);

  // Checar se o vídeo existe
  const videoSource = null; // Será: require('../../assets/intro-video.mp4')
  const hasVideo = false; // Mudar para true quando adicionar o vídeo

  useEffect(() => {
    if (!hasVideo) {
      // Se não tem vídeo, pula direto após 1 segundo
      const timer = setTimeout(onFinish, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasVideo, onFinish]);

  const handleVideoEnd = () => {
    onFinish();
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.stopAsync();
    }
    onFinish();
  };

  if (!hasVideo) {
    // Mostrar logo estática enquanto não tem vídeo
    return (
      <View style={styles.container}>
        <Image
          source={require('../../assets/Logo.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Vídeo do Mascote */}
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        resizeMode="contain"
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            handleVideoEnd();
          }
        }}
        onLoad={() => setVideoReady(true)}
      />

      {/* Botão Pular */}
      {videoReady && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>PULAR →</Text>
        </TouchableOpacity>
      )}
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
  video: {
    width: '100%',
    height: '100%',
  },
  logo: {
    width: '80%',
    height: '80%',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: colors.text.primary,
  },
  skipText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
