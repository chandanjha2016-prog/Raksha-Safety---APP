import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, TextInput, ScrollView, Linking } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import * as SMS from 'expo-sms';
import { Audio } from 'expo-av';
import { Accelerometer } from 'expo-sensors'; // SHAKE KE LIYE
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [contacts, setContacts] = useState(['', '', '']);
  const [showSettings, setShowSettings] = useState(false);
  const [recording, setRecording] = useState();
  const [isActive, setIsActive] = useState(true); // Sensor ON/OFF
  const lastShake = useRef(0);

  useEffect(() => { loadContacts(); setupShakeSensor(); }, []);

  const loadContacts = async () => {
    const saved = await AsyncStorage.getItem('raksha_contacts');
    if (saved) setContacts(JSON.parse(saved));
  };
  const saveContacts = async () => {
    await AsyncStorage.setItem('raksha_contacts', JSON.stringify(contacts));
    Alert.alert("Saved", "Emergency contacts saved!");
    setShowSettings(false);
  };

  // 1. SHAKE SENSOR - PHONE HILAO TO ALERT
  const setupShakeSensor = () => {
    Accelerometer.setUpdateInterval(100);
    Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      const totalForce = Math.abs(x) + Math.abs(y) + Math.abs(z);

      if (totalForce > 1.8 && Date.now() - lastShake.current > 3000) { // 3 sec gap
        lastShake.current = Date.now();
        if(isActive) handlePanic(); // Auto trigger
      }
    });
  };

  // 2. AUDIO RECORD
  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) { console.log(err); }
  }
  async function stopRecording() {
    if(recording){ await recording.stopAndUnloadAsync(); setRecording(undefined); }
  }

  // 3. MAIN PANIC FUNCTION - SAB AUTOMATIC
  const handlePanic = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // VIBRATION
    startRecording(); // AUDIO START

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status!== 'granted') return;

    let location = await Location.getCurrentPositionAsync({});
    let link = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
    let message = `🚨 RAKSHA EMERGENCY 🚨\nMujhe madad chahiye!\nLive Location: ${link}\nTime: ${new Date().toLocaleTimeString()}`;

    const validContacts = contacts.filter(c => c.length > 9);
    if (validContacts.length === 0) return Alert.alert("Error", "Pehle contacts add karo");

    // SMS SEND
    
  const sendAlert = async () => {
  contacts.forEach(contact => {
    const numberWith91 = contact.startsWith("+917739285002") ? contact : "+91" + contact;
    SMS.sendSMSAsync(numberWith91, message); // <-- contact ki jagah numberWith91
  })
}
        

    // AUTO POLICE CALL 5 SEC BAAD
    setTimeout(() => {
      Alert.alert("Auto Call", "5 sec me +917739285002 par call lagegi", [
        {text: "Cancel", onPress: () => {}},
        {text: "Call Now", onPress: () => Linking.openURL('tel:112')}
      ]);
    }, 5000);

    Alert.alert("🚨 AUTO ALERT SENT", `SMS + Audio + Location sent\nAuto Police call in 5 sec`);
    setTimeout(() => { stopRecording(); }, 10000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{alignItems: 'center'}}>
        <Text style={styles.title}>Raksha Safety App</Text>
        <Text style={styles.subtitle}>Shake phone OR Press 3 sec</Text>

        {/* SENSOR ON/OFF TOGGLE */}
        <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsActive(!isActive)}>
          <Text style={styles.toggleText}>{isActive? "🟢 Sensor ON" : "🔴 Sensor OFF"}</Text>
        </TouchableOpacity>

        {/* MANUAL PANIC BUTTON */}
        <TouchableOpacity style={styles.button} onPressIn={() => {Haptics.impactAsync();}} onPressOut={handlePanic}>
          <Text style={styles.buttonText}>🆘 PANIC</Text>
          <Text style={styles.smallText}>Hold 3 sec</Text>
        </TouchableOpacity>

        {/* MANUAL 112 CALL */}
        <TouchableOpacity style={styles.govtButton} onPress={() => Linking.openURL('tel:112')}>
          <Text style={styles.govtText}>📞 Call Police 112</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
          <Text style={styles.settingsText}>Set Emergency Contacts</Text>
        </TouchableOpacity>

        {showSettings && (
          <View style={styles.settingsBox}>
            <Text style={styles.settingsTitle}>Add 3 Emergency Contacts</Text>
            {contacts.map((c, i) => (
              <TextInput key={i} style={styles.input} placeholder={`Contact ${i+1}`} keyboardType="phone-pad"
                value={c} onChangeText={(t) => { const newC = [...contacts]; newC[i] = t; setContacts(newC); }} />
            ))}
            <TouchableOpacity style={styles.saveBtn} onPress={saveContacts}>
              <Text style={styles.saveText}>Save & Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 20 },
  toggleBtn: { backgroundColor: '#334155', padding: 10, borderRadius: 20, marginBottom: 20 },
  toggleText: { color: '#fff', fontWeight: 'bold' },
  button: { width: 240, height: 240, borderRadius: 120, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', elevation: 10 },
  buttonText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  smallText: { color: '#fff', fontSize: 12, marginTop: 5 },
  govtButton: { backgroundColor: '#2563eb', padding: 15, borderRadius: 10, marginTop: 30, width: '80%' },
  govtText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  settingsBtn: { marginTop: 20, padding: 10 },
  settingsText: { color: '#60a5fa', fontSize: 16 },
  settingsBox: { width: '90%', backgroundColor: '#1e293b', padding: 20, borderRadius: 15, marginTop: 20 },
  settingsTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#334155', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10 },
  saveBtn: { backgroundColor: '#22c55e', padding: 12, borderRadius: 8, marginTop: 10 },
  saveText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
