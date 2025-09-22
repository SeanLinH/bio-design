import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import TestApp from './TestApp';

export default function App() {
  console.log('🚀 Test App starting...');

  return (
    <PaperProvider>
      <TestApp />
    </PaperProvider>
  );
}