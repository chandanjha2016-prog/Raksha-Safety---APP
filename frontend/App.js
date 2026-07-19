import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Button, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Audio } from 'expo-av';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [contacts, setContacts] = useState(['', '', '']);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef(null);

  // 1. CONTACT SAVE SCREEN
  if(screen === 'contacts'){
    return(
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>3 Numbers daalo</Text>
        {contacts.map((c, i) => (
          <TextInput key={i} style={styles.input} placeholder={`Contact ${i+1} Number`}
            keyboardType="phone-pad" maxLength={10} value={c}
            onChangeText={(text) => {let newC = [...contacts]; newC[i]=text; setContacts(newC)}} />
        ))}
        <TouchableOpacity style={styles.smallButton} onPress={() => setScreen('home')}>
          <Text style={styles.smallButtonText}>Save & Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // 2. PANIC FUNCTION
  const handlePanic = async () => {
    if(contacts.filter(c=>c).length === 0){
      Alert.alert("Pehle Contact Add Karo");
      return;
    }

    // Location
    let { status } = await Location.requestForegroundPermissionsAsync();
    let location = await Location.getCurrentPositionAsync({});
    let link = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
    let message = `🚨 RAKSHA ALERT! Mujhe help chahiye.\nLocation: ${link}`;

    // SMS
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      await SMS.sendSMSAsync(contacts.filter(c=>c), message);
    }
    
    // Siren Sound
    const { sound } = await Audio.Sound.createAsync(require('./assets/siren.mp3'));
    await sound.playAsync();
    setTimeout(() => sound.unloadAsync(), 5000);

    Alert.alert("Help Bhej Di Gayi!", "Family aur Police ko alert mil gaya");
  };

  // 3. HOLD LOGIC
  const startHold = () => {
    setIsHolding(true);
    holdTimer.current = setTimeout(() => {
      handlePanic();
      setIsHolding(false);
    }, 3000);
  };
  const cancelHold = () => {
    clearTimeout(holdTimer.current);
    setIsHolding(false);
  };

  // 4. HOME SCREEN
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>RAKSHA</Text>
      <Text style={styles.subtitle}>Your Safety Partner</Text>
      
      <TouchableOpacity style={styles.smallButton} onPress={() => setScreen('contacts')}>
        <Text style={styles.smallButtonText}>Set Emergency Contacts</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, isHolding && styles.buttonActive]}
        onPressIn={startHold}
        onPressOut={cancelHold}
      >
        <Text style={styles.buttonText}>🆘</Text>
        <Text style={styles.buttonLabel}>{isHolding ? "Hold..." : "HOLD 3 SEC"}</Text>
      </TouchableOpacity>
      
      <Text style={styles.footer}>Press and hold for 3 seconds</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1e', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#e94560', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 30 },
  input: { backgroundColor: '#2a2a4e', color: '#fff', width: '90%', padding: 15, margin: 10, borderRadius: 12, fontSize: 16 },
  button: { width: 220, height: 220, borderRadius: 110, backgroundColor: '#e94560', alignItems: 'center', justifyContent: 'center', marginTop: 40, elevation: 15 },
  buttonActive: { backgroundColor: '#ff2d55', transform: [{ scale: 1.08 }] },
  buttonText: { color: '#fff', fontSize: 60 },
  buttonLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  smallButton: { backgroundColor: '#2a2a4e', padding: 15, borderRadius: 12, margin: 10, width: '80%' },
  smallButtonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  footer: { color: '#666', marginTop: 30, fontSize: 14 }
});
