import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Banner customizado para cada página
 * @param {string} source - Nome do arquivo do banner (ex: 'inicio', 'eventos')
 */
export default function PageBanner({ source }) {
  const banners = {
    inicio: require('../../assets/banners/banner_inicio.png'),
    eventos: require('../../assets/banners/banner_eventos.png'),
    forum: require('../../assets/banners/banner_forum.png'),
    cheats: require('../../assets/banners/banner_cheats_v2.png'),
    manutencao: require('../../assets/banners/banner_manutencao.png'),
    chat: require('../../assets/banners/banner_chat.png'),
    perfil: require('../../assets/banners/banner_perfil.png'),
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
    height: 200,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
});
