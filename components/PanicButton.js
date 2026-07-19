
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const PanicButton = () => {
  const [loading, setLoading] = useState(false);

  const sendSOS = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const sosData = { userId: "user123", name: "Test User", lat: latitude, lng: longitude };

        try {
          // YAHAN APNA TERMUX WALA IP DAALNA
          const response = await fetch('http://192.168.1.8:5000/api/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sosData)
          });
          Alert.alert("✅", "SOS Bhej Diya");
        } catch (e) {
          Alert.alert("❌", "Server connect nahi hua");
        }
        setLoading(false);
      },
      () => { Alert.alert("❌", "Location nahi mili"); setLoading(false); }
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={sendSOS} disabled={loading} style={styles.button}>
        {loading ? <ActivityIndicator color="white" size="large"/> : <Text style={styles.text}>SOS</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#000'},
  button: {backgroundColor:'red', width:160, height:160, borderRadius:80, justifyContent:'center', alignItems:'center'},
  text: {color:'white', fontSize:36, fontWeight:'bold'}
});
export default PanicButton;
