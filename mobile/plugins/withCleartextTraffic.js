const { withAndroidManifest } = require('@expo/config-plugins');

const withCleartextTraffic = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;

    // Adicionar usesCleartextTraffic e networkSecurityConfig
    if (!androidManifest.application) {
      androidManifest.application = [{}];
    }

    const application = androidManifest.application[0];

    // Forçar cleartext traffic
    application.$['android:usesCleartextTraffic'] = 'true';

    // Adicionar network security config
    application.$['android:networkSecurityConfig'] = '@xml/network_security_config';

    console.log('✅ Cleartext traffic configurado no AndroidManifest');

    return config;
  });
};

module.exports = withCleartextTraffic;
