import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ActivityIndicator, View, Text, StyleSheet, Linking, Alert, Image } from 'react-native';
import AnimatedSplashScreen from './src/screens/AnimatedSplashScreen';

// Screens
import LegalTermsScreen from './src/screens/LegalTermsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateProductScreen from './src/screens/CreateProductScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatScreen from './src/screens/ChatScreen';
import ForumCategoriesScreen from './src/screens/ForumCategoriesScreen';
import ForumTopicsScreen from './src/screens/ForumTopicsScreen';
import CreateForumTopicScreen from './src/screens/CreateForumTopicScreen';
import IdentifyGameScreen from './src/screens/IdentifyGameScreen';
import EventsScreen from './src/screens/EventsScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import VideoVerificationScreen from './src/screens/VideoVerificationScreen';
import MyTransactionsScreen from './src/screens/MyTransactionsScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';
import MaintenanceScreen from './src/screens/MaintenanceScreen';
import CheatsScreen from './src/screens/CheatsScreen';

// Theme
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LegalTerms" component={LegalTermsScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Home Tab Icon
function TabIcon({ label, iconImage, focused }) {
  return (
    <View style={styles.tabIcon}>
      <Image
        source={iconImage}
        style={[
          styles.tabIconImage,
          { opacity: focused ? 1 : 0.5 }
        ]}
        resizeMode="contain"
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// Main Tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Início" iconImage={require('./assets/brand/inicio.png')} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Eventos" iconImage={require('./assets/brand/eventos.png')} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ForumTab"
        component={ForumCategoriesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Fórum" iconImage={require('./assets/brand/forum.png')} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CheatsTab"
        component={CheatsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Cheats" iconImage={require('./assets/brand/cheats.png')} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MaintenanceTab"
        component={MaintenanceScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Ajuda" iconImage={require('./assets/brand/manutencao.png')} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatListScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Chat" iconImage={require('./assets/brand/chat.png')} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Perfil" iconImage={require('./assets/brand/perfil.png')} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// App Stack (authenticated)
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="IdentifyGame" component={IdentifyGameScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="ForumTopics" component={ForumTopicsScreen} />
      <Stack.Screen name="CreateForumTopic" component={CreateForumTopicScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="VideoVerification" component={VideoVerificationScreen} />
      <Stack.Screen name="MyTransactions" component={MyTransactionsScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
    </Stack.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Handle deep linking when app is opened via OAuth callback
    const handleDeepLink = (event) => {
      const url = event.url;
      console.log('🔗 Deep link recebido:', url);

      if (url.includes('oauth/callback')) {
        if (url.includes('success=true')) {
          Alert.alert(
            '✅ Sucesso!',
            'Sua conta do Mercado Pago foi conectada com sucesso!',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            '❌ Erro',
            'Não foi possível conectar sua conta do Mercado Pago.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    // Listen for deep links when app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle deep link when app opens from closed state
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>🎮</Text>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>RetroTrade Brasil</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

// Main App Component
export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <>
        <StatusBar style="light" />
        <AnimatedSplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    fontSize: 64,
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 20,
    color: colors.yellow.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  tabBar: {
    backgroundColor: colors.background.secondary,
    borderTopWidth: 3,
    borderTopColor: colors.yellow.primary,
    height: 90,
    paddingTop: 8,
    paddingBottom: 20,
    shadowColor: colors.yellow.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconImage: {
    width: 28,
    height: 28,
  },
  tabLabel: {
    fontSize: 8,
    color: colors.text.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.yellow.primary,
    fontWeight: 'bold',
  },
});
