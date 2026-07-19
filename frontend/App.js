import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, SafeAreaView, Linking } from 'react-native';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [contacts, setContacts] = useState(['', '', '']);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef(null);
  const recording = useRef(null);
  const [shakeEnabled, setShakeEnabled] = useState(true);

  // SHAKE TO ALERT
  useEffect(() => {
    Accelerometer.setUpdateInterval(500);
    const subscription = Accelerometer.addListener(accelData => {
      let total = Math.abs(accelData.x) + Math.abs(accelData.y) + Math.abs(accelData.z);
      if (total > 3 && shakeEnabled) { // Jor se hilao
        handlePanic();
        setShakeEnabled(false);
        setTimeout(() => setShakeEnabled(true), 10000); // 10 sec baad dubara
      }
    });
    return () => subscription.remove();
  }, [shakeEnabled]);

  // CONTACT SAVE SCREEN
  if(screen === 'contacts'){
    return(
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Emergency Contacts</Text>
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

  // AUDIO RECORD
  async function startRecording() {
    await Audio.requestPermissionsAsync();
    const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recording.current = rec;
  }
  async function stopRecording() {
    await recording.current.stopAndUnloadAsync();
    return recording.current.getURI();
  }

  
    
  

  // MAIN PANIC
  const handlePanic = async () => {
    if(contacts.filter(c=>c).length === 0){ Alert.alert("Pehle Contact Add Karo"); return; }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await startRecording();
    sosLight();

    let location = await Location.getCurrentPositionAsync({});
    let link = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
    let message = `🚨 RAKSHA ALERT! Help chahiye.\nLive Location: ${link}`;

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) { await SMS.sendSMSAsync(contacts.filter(c=>c), message); }

    setTimeout(async () => {
      let audioUri = await stopRecording();
      Linking.openURL(`tel:112`); // Police Call
      Alert.alert("HELP SENT", `1. Family ko SMS\n2. Audio Recorded\n3. Police 112 Call\n4. Flashlight SOS`);
    }, 10000);
  };

  // HOLD LOGIC
  const startHold = () => { setIsHolding(true); holdTimer.current = setTimeout(handlePanic, 3000); };
  const cancelHold = () => { clearTimeout(holdTimer.current); setIsHolding(false); };

  // HOME SCREEN
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>RAKSHA 2.0</Text>
      <Text style={styles.subtitle}>National Safety App</Text>

      <TouchableOpacity style={styles.smallButton} onPress={() => setScreen('contacts')}>
        <Text style={styles.smallButtonText}>Set Emergency Contacts</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isHolding && styles.buttonActive]}
        onPressIn={startHold} onPressOut={cancelHold}
      >
        <Text style={styles.buttonText}>🆘</Text>
        <Text style={styles.buttonLabel}>{isHolding? "SENDING HELP..." : "HOLD 3 SEC"}</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>Tip: Phone ko jor se hilao = Auto Alert</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#ff2d55', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 30 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', width: '90%', padding: 15, margin: 10, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#ff2d55' },
  button: { width: 230, height: 230, borderRadius: 115, backgroundColor: '#ff2d55', alignItems: 'center', justifyContent: 'center', marginTop: 40, elevation: 20 },
  buttonActive: { backgroundColor: '#ff0000', transform: [{ scale: 1.1 }] },
  buttonText: { color: '#fff', fontSize: 70 },
  buttonLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  smallButton: { backgroundColor: '#1a1a1a', padding: 15, borderRadius: 12, margin: 10, width: '80%', borderWidth: 1, borderColor: '#ff2d55' },
  smallButtonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  footer: { color: '#666', marginTop: 20, fontSize: 12 }
});
