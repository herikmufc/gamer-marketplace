import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import { payment } from '../api/client';
import { colors } from '../theme/colors';
import RetroButton from '../components/RetroButton';
import RetroCard from '../components/RetroCard';

export default function VideoVerificationScreen({ route, navigation }) {
  const { transactionId, product } = route.params;

  const [hasPermission, setHasPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  const cameraRef = useRef(null);
  const recordingInterval = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        setRecordingTime(0);

        const video = await cameraRef.current.recordAsync({
          maxDuration: 30,
          quality: Camera.Constants.VideoQuality['720p'],
        });

        setVideoUri(video.uri);
        setIsRecording(false);
      } catch (error) {
        console.error('Erro ao gravar vídeo:', error);
        Alert.alert('Erro', 'Não foi possível gravar o vídeo');
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const discardVideo = () => {
    Alert.alert(
      'Descartar vídeo?',
      'Tem certeza que deseja descartar e gravar novamente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => {
            setVideoUri(null);
            setRecordingTime(0);
          },
        },
      ]
    );
  };

  const uploadVideo = async () => {
    if (!videoUri) {
      Alert.alert('Erro', 'Nenhum vídeo gravado');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      console.log('📤 [VIDEO] Enviando vídeo para transação:', transactionId);

      // Simular progresso (em produção, usar XMLHttpRequest para progresso real)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const result = await payment.uploadVideo(transactionId, {
        uri: videoUri,
        type: 'video/mp4',
        name: `verification_${transactionId}.mp4`,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('✅ [VIDEO] Vídeo enviado com sucesso:', result);

      // Verificar se foi auto-aprovado
      if (result.auto_approved) {
        Alert.alert(
          '✅ Verificação Aprovada!',
          `A IA analisou o vídeo e confirmou que o produto está correto.\n\nConfiança: ${result.confidence_score}%\n\nO pagamento foi liberado para o vendedor!`,
          [
            {
              text: 'Ver Detalhes',
              onPress: () => navigation.replace('TransactionDetail', { transactionId }),
            },
          ]
        );
      } else {
        Alert.alert(
          '📋 Vídeo em Análise',
          'Seu vídeo foi recebido e está sendo analisado pela nossa equipe.\n\nVocê será notificado quando a análise for concluída.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ [VIDEO] Erro ao enviar vídeo:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.detail || 'Não foi possível enviar o vídeo'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.yellow.primary} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <RetroCard style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>📷 Permissão Necessária</Text>
          <Text style={styles.permissionText}>
            É necessário permitir acesso à câmera para gravar o vídeo de
            verificação do produto.
          </Text>
          <RetroButton
            title="Configurações"
            icon="⚙️"
            onPress={() => {
              // TODO: Abrir configurações do app
              Alert.alert('Info', 'Abra as configurações e permita acesso à câmera');
            }}
            variant="primary"
            size="large"
          />
        </RetroCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>VERIFICAÇÃO</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instructions */}
      {!videoUri && (
        <View style={styles.instructionsContainer}>
          <RetroCard style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>
              📹 Como gravar o vídeo:
            </Text>
            <Text style={styles.instructionItem}>
              1️⃣ Mostre o produto de todos os ângulos
            </Text>
            <Text style={styles.instructionItem}>
              2️⃣ Filme acessórios e detalhes importantes
            </Text>
            <Text style={styles.instructionItem}>
              3️⃣ Certifique-se de boa iluminação
            </Text>
            <Text style={styles.instructionItem}>
              4️⃣ Grave entre 10-30 segundos
            </Text>
            <Text style={styles.productInfo}>
              Produto: {product?.title || 'Carregando...'}
            </Text>
          </RetroCard>
        </View>
      )}

      {/* Camera Preview */}
      {!videoUri && (
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            ref={cameraRef}
          >
            {isRecording && (
              <View style={styles.recordingOverlay}>
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>
                    REC {recordingTime}s
                  </Text>
                </View>
              </View>
            )}
          </Camera>

          {/* Camera Controls */}
          <View style={styles.controls}>
            {!isRecording ? (
              <RetroButton
                title="Iniciar Gravação"
                icon="🎥"
                onPress={startRecording}
                variant="primary"
                size="large"
              />
            ) : (
              <RetroButton
                title={`Parar (${30 - recordingTime}s)`}
                icon="⏹️"
                onPress={stopRecording}
                variant="secondary"
                size="large"
              />
            )}
          </View>
        </View>
      )}

      {/* Video Preview */}
      {videoUri && !uploading && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>📹 Prévia do Vídeo</Text>
          <Video
            source={{ uri: videoUri }}
            style={styles.videoPreview}
            useNativeControls
            resizeMode="contain"
            isLooping
          />

          <View style={styles.previewControls}>
            <RetroButton
              title="Descartar"
              icon="🗑️"
              onPress={discardVideo}
              variant="secondary"
              size="medium"
              style={styles.previewButton}
            />
            <RetroButton
              title="Enviar Vídeo"
              icon="📤"
              onPress={uploadVideo}
              variant="primary"
              size="medium"
              style={styles.previewButton}
            />
          </View>
        </View>
      )}

      {/* Upload Progress */}
      {uploading && (
        <View style={styles.uploadContainer}>
          <RetroCard style={styles.uploadCard}>
            <Text style={styles.uploadTitle}>📤 Enviando Vídeo...</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${uploadProgress}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{uploadProgress}%</Text>
            <Text style={styles.uploadInfo}>
              A IA analisará seu vídeo automaticamente
            </Text>
          </RetroCard>
        </View>
      )}

      {/* Bottom Info */}
      {!videoUri && !isRecording && (
        <View style={styles.bottomInfo}>
          <RetroCard style={styles.infoCard}>
            <Text style={styles.infoText}>
              🤖 A IA analisará se o produto recebido corresponde ao anunciado
            </Text>
            <Text style={styles.infoText}>
              ✅ Aprovação automática se tudo estiver correto
            </Text>
          </RetroCard>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 3,
    borderBottomColor: colors.yellow.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.yellow.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.yellow.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    letterSpacing: 2,
  },
  instructionsContainer: {
    padding: 20,
  },
  instructionsCard: {
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  productInfo: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.yellow.primary,
  },
  camera: {
    flex: 1,
  },
  recordingOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  controls: {
    padding: 20,
    backgroundColor: colors.background.secondary,
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  videoPreview: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.yellow.primary,
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  previewButton: {
    flex: 1,
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  uploadCard: {
    padding: 24,
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    height: 20,
    backgroundColor: colors.background.tertiary,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.dark,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.yellow.primary,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  uploadInfo: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
  },
  bottomInfo: {
    padding: 20,
  },
  infoCard: {
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  permissionCard: {
    margin: 20,
    padding: 24,
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.yellow.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
});
