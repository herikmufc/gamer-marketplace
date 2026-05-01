import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Banner customizado para cada página
 * @param {string} source - Nome do arquivo do banner (ex: 'inicio', 'eventos')
 */
export default function PageBanner({ source }) {
  console.log('🎨 PageBanner rendering:', source);

  const banners = {
    inicio: require('../../assets/banners/inicio_v2.png'),
    eventos: require('../../assets/banners/eventos_v2.png'),
    forum: require('../../assets/banners/forum_v2.png'),
    cheats: require('../../assets/banners/cheats_v2.png'),
    manutencao: require('../../assets/banners/manutencao_v2.png'),
    chat: require('../../assets/banners/chat_v2.png'),
    perfil: require('../../assets/banners/perfil_v2.png'),
  };

  const bannerSource = banners[source];
  console.log('🖼️ Banner source:', bannerSource);

  if (!bannerSource) {
    console.error(`❌ PageBanner: banner "${source}" não encontrado`);
    return null;
  }

  return (
    <View style={styles.container}>
      <Image
        key={`banner-${source}-v2`}
        source={bannerSource}
        style={styles.banner}
        resizeMode="cover"
        onError={(error) => console.error('❌ Erro ao carregar banner:', error)}
        onLoad={() => console.log('✅ Banner carregado:', source)}
      />
      {/* Debug overlay */}
      <View style={styles.debugOverlay}>
        {/* <Text style={styles.debugText}>{source}</Text> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: width * 0.29, // Proporção 1400x400 = ~28.6%
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  debugOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
  debugText: {
    color: 'white',
    fontSize: 10,
  },
});
