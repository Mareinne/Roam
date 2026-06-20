import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E4010' }}>
      <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>🌿 Roam</Text>
      <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Loading...</Text>
    </View>
  );
}
