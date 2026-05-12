import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

export default function ARSuitcaseScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View style={styles.container}><Text style={styles.text}>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text style={styles.text}>No access to camera</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera style={styles.camera} type={CameraType.back}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.titleText}>Suitcase Measure AR</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* AR Overlay (Simulated bounding box) */}
        <View style={styles.overlayContainer}>
          <Text style={styles.instructionText}>Fit your suitcase inside the box</Text>
          <View style={styles.arBox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            <View style={styles.scanLine} />
          </View>
          <Text style={styles.dimensionsText}>Max: 55 x 40 x 20 cm</Text>
        </View>

      </Camera>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  text: { color: 'white', textAlign: 'center', marginTop: 50 },
  camera: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { backgroundColor: 'rgba(0,0,0,0.5)', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  titleText: { color: 'white', fontSize: 18, fontWeight: 'bold', textShadowColor: 'black', textShadowRadius: 5 },
  
  overlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instructionText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 30, textShadowColor: 'black', textShadowRadius: 10 },
  arBox: { width: 250, height: 400, borderWidth: 2, borderColor: 'rgba(0, 230, 118, 0.3)', position: 'relative', overflow: 'hidden' },
  
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#00E676' },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  
  scanLine: { width: '100%', height: 2, backgroundColor: 'rgba(0, 230, 118, 0.8)', position: 'absolute', top: '50%', shadowColor: '#00E676', shadowOpacity: 1, shadowRadius: 10 },
  
  dimensionsText: { color: '#00E676', fontSize: 16, fontWeight: 'bold', marginTop: 30, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10 },
});
