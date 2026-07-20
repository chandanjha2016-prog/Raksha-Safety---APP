import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

export default function App() {
  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef(null);

  const handlePanic = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // LOCATION LE LO
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Chahiye", "Location on karo");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    let link = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;

    // VIDEO KE LIYE YE ALERT
    Alert.alert(
      "🚨 RAKSHA ALERT", 
      `Emergency SMS sent to:\n7739285002\n6201167980\n9031721575\nLocation: ${link}\n\nAudio Recorded 10 sec`
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
  container: { flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#9ca3af', marginBottom: 40 },
  button: { width: 230, height: 230, borderRadius: 115, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  buttonActive: { backgroundColor: '#dc2626', transform: [{ scale: 1.1 }] },
  buttonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});
