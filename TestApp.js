import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Button, Card } from 'react-native-paper';

const TestApp = () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');

  const handleButtonClick = () => {
    console.log('🔥 Button clicked!');
    setCount(count + 1);
    setMessage(`Button clicked ${count + 1} times`);
  };

  const testApiCall = async () => {
    console.log('🌐 Testing API call...');
    try {
      const response = await fetch('https://entirely-ideal-sunfish.ngrok-free.app/api/v1/spaces/11/apps/10', {
        headers: {
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`API Success: Found ${data.apps?.agents?.length || 0} agents`);
        console.log('✅ API call successful');
      } else {
        setMessage(`API Error: ${response.status}`);
        console.log('❌ API call failed:', response.status);
      }
    } catch (error) {
      setMessage(`Network Error: ${error.message}`);
      console.log('❌ Network error:', error);
    }
  };

  return (
    <View style={{ padding: 20, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Card style={{ marginBottom: 16, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          React Test App
        </Text>

        <Text style={{ marginBottom: 16 }}>
          Count: {count}
        </Text>

        <Text style={{ marginBottom: 16, color: 'blue' }}>
          {message || 'No messages yet'}
        </Text>

        <Button
          mode="contained"
          onPress={handleButtonClick}
          style={{ marginBottom: 12 }}
        >
          Test React Button ({count})
        </Button>

        <Button
          mode="outlined"
          onPress={testApiCall}
          style={{ marginBottom: 12 }}
        >
          Test API Call
        </Button>

        <Button
          mode="text"
          onPress={() => {
            console.log('🔄 Console test');
            alert('Alert test works!');
          }}
        >
          Test Console & Alert
        </Button>
      </Card>
    </View>
  );
};

export default TestApp;