import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌿 Roam</Text>
      <Text style={styles.sub}>Works!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E4010', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 40, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.6)', fontSize: 16, marginTop: 8 },
});
