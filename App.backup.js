import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { DebateProvider } from './src/context/DebateContext';

// Web 配置導入
import './src/config/webSetup';

// Screens
import DebateSetupScreen from './src/screens/DebateSetupScreen';
import DebateMonitorScreen from './src/screens/DebateMonitorScreen';
import DebateResultScreen from './src/screens/DebateResultScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <DebateProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="DebateSetup"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#2196F3',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="DebateSetup"
              component={DebateSetupScreen}
              options={{ title: '辯論配置' }}
            />
            <Stack.Screen
              name="DebateMonitor"
              component={DebateMonitorScreen}
              options={{ title: '實時監控' }}
            />
            <Stack.Screen
              name="DebateResult"
              component={DebateResultScreen}
              options={{ title: '辯論結果' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </DebateProvider>
    </PaperProvider>
  );
}