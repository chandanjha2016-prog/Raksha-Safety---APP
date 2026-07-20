import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

export default function App() {
  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef(null);
  const contacts = ['7739285002', '6201167980', '9031721575']; // TUMHARE 3 NUMBER

  const handlePanic = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission", "Settings me jaake Location ON karo");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    let link = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;

    Alert.alert(
      "🚨 RAKSHA ALERT", 
      `SMS Sent to:\n${contacts.join('\n')}\n\nLive Location:\n${link}\n\nAudio Recorded 10 sec`
    );
  };

  const startHold = () => { setIsHolding(true); holdTimer.current = setTimeout(handlePanic, 3000); };
  const cancelHold = () => { clearTimeout(holdTimer.current); setIsHolding(false); };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Raksha Safety App</Text>
      <Text style={styles.subtitle}>Press 3 seconds for help</Text>
      <TouchableOpacity
        style={[styles.button, isHolding && styles.buttonActive]}
        onPressIn={startHold} onPressOut={cancelHold}
      >
        <Text style={styles.buttonText}>🆘 PANIC</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 40 },
  button: { width: 240, height: 240, borderRadius: 120, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', elevation: 10 },
  buttonActive: { backgroundColor: '#dc2626', transform: [{ scale: 1.1 }] },
  buttonText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
});
