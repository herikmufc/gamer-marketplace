import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Banner customizado para cada página
 * @param {string} source - Nome do arquivo do banner (ex: 'inicio', 'eventos')
 */
export default function PageBanner({ source }) {
  const banners = {
    inicio: require('../../assets/banners/inicio.png'),
    eventos: require('../../assets/banners/eventos.png'),
    forum: require('../../assets/banners/forum.png'),
    cheats: require('../../assets/banners/cheats.png'),
    manutencao: require('../../assets/banners/manutencao.png'),
    chat: require('../../assets/banners/chat.png'),
    perfil: require('../../assets/banners/perfil.png'),
  };

  const bannerSource = banners[source];

  if (!bannerSource) {
    console.warn(`PageBanner: banner "${source}" não encontrado`);
    return null;
  }

  return (
    <View style={styles.container}>
      <Image
        source={bannerSource}
        style={styles.banner}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: width * 0.29, // Proporção 1400x400 = ~28.6%
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
});
