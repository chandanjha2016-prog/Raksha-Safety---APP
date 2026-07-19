import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [contacts, setContacts] = useState(['', '', '']);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef(null);
  const recording = useRef(null);

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
    if(recording.current){
      await recording.current.stopAndUnloadAsync();
      return recording.current.getURI();
    }
    return null;
  }

  // MAIN PANIC
  const handlePanic = async () => {
    if(contacts.filter(c=>c).length === 0){ Alert.alert("Pehle Contact Add Karo"); return; }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await startRecording();

    let location = await Location.getCurrentPositionAsync({});
    let link = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
    let message = `🚨 RAKSHA ALERT! Help chahiye.\nLive Location: ${link}`;

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) { await SMS.sendSMSAsync(contacts.filter(c=>c), message); }

    setTimeout(async () => {
      await stopRecording();
      Alert.alert("🚨 RAKSHA ALERT", `Emergency SMS + Location sent\nAudio Recorded\nPolice 112 call hoga APK me`);
    }, 10000);
  };

  // HOLD LOGIC
  const startHold = () => { setIsHolding(true); holdTimer.current = setTimeout(handlePanic, 3000); };
  const cancelHold = () => { clearTimeout(holdTimer.current); setIsHolding(false); };

  // HOME SCREEN
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Raksha Safety App</Text>
      <Text style={styles.subtitle}>Press 3 seconds for help</Text>

      <TouchableOpacity style={styles.smallButton} onPress={() => setScreen('contacts')}>
        <Text style={styles.smallButtonText}>Set Emergency Contacts</Text>
      </TouchableOpacity>

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
  subtitle: { fontSize: 14, color: '#9ca3af', marginBottom: 30 },
  input: { backgroundColor: '#1f2937', color: '#fff', width: '90%', padding: 15, margin: 10, borderRadius: 12, fontSize: 16 },
  button: { width: 230, height: 230, borderRadius: 115, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  buttonActive: { backgroundColor: '#dc2626', transform: [{ scale: 1.1 }] },
  buttonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  smallButton: { backgroundColor: '#1f2937', padding: 15, borderRadius: 12, marginBottom: 20, width: '80%' },
  smallButtonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
});
