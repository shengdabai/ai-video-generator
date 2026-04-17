import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { HomeScreen } from '@/screens/HomeScreen';
import { CreateScreen } from '@/screens/CreateScreen';
import { ProgressScreen } from '@/screens/ProgressScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { EnhanceConfirmScreen } from '@/screens/EnhanceConfirmScreen';
import { StoryboardScreen } from '@/screens/StoryboardScreen';
import { StyleSelectScreen } from '@/screens/StyleSelectScreen';
import { AudioConfigScreen } from '@/screens/AudioConfigScreen';
import { PreviewScreen } from '@/screens/PreviewScreen';
import { WorksScreen } from '@/screens/WorksScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { DiscoverScreen } from '@/screens/DiscoverScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: '发现',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>🎬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreateScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={styles.createTabButton}>
              <Text style={styles.createTabIcon}>➕</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Works"
        component={WorksScreen}
        options={{
          tabBarLabel: '作品',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>📁</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const LoadingScreen: React.FC = () => (
  <View style={styles.loading}>
    <Text style={styles.loadingLogo}>🎬</Text>
    <Text style={styles.loadingTitle}>VidCraft AI</Text>
    <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 24 }} />
  </View>
);

const AppContent: React.FC = () => {
  const { isLoading, isLoggedIn, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerBackTitleVisible: false,
        }}
      >
        {!isLoggedIn ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Create"
              component={CreateScreen}
              options={{ title: '新建视频' }}
            />
            <Stack.Screen
              name="EnhanceConfirm"
              component={EnhanceConfirmScreen}
              options={{ title: 'AI 智能增强' }}
            />
            <Stack.Screen
              name="Storyboard"
              component={StoryboardScreen}
              options={{ title: '分镜脚本' }}
            />
            <Stack.Screen
              name="StyleSelect"
              component={StyleSelectScreen}
              options={{ title: '选择风格' }}
            />
            <Stack.Screen
              name="AudioConfig"
              component={AudioConfigScreen}
              options={{ title: '配音配乐' }}
            />
            <Stack.Screen
              name="Progress"
              component={ProgressScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Preview"
              component={PreviewScreen}
              options={{ title: '视频预览' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <AppContent />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingLogo: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  createTabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createTabIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});
