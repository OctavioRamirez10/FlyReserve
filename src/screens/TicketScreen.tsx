import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView,
  ImageBackground, StyleSheet, Dimensions, Platform, Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useBooking } from '../context/BookingContext';
import QRCode from 'react-native-qrcode-svg';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Ticket'>;
const { width } = Dimensions.get('window');
const MAX_W = Platform.OS === 'web' ? 520 : width;

export default function TicketScreen() {
  const nav = useNavigation<Nav>();
  const { selectedFlight, selectedSeats, passengerDetails, resetBooking } = useBooking();

  // Play sound on native only
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Dynamic import so web doesn't crash
      const playSound = async () => {
        try {
          const { Audio } = await import('expo-av');
          const { sound } = await Audio.Sound.createAsync(
            { uri: 'https://cdn.freesound.org/previews/563/563510_7037363-lq.mp3' },
            { shouldPlay: true }
          );
          return () => { sound.unloadAsync(); };
        } catch { /* silent fail on web */ }
      };
      playSound();
    }
  }, []);

  if (!selectedFlight || !passengerDetails) {
    return (
      <View style={s.root}>
        <SafeAreaView style={s.errorCenter}>
          <Text style={s.errorTxt}>⚠️ No hay ticket disponible.</Text>
          <TouchableOpacity style={s.homeBtn} onPress={() => nav.reset({ index: 0, routes: [{ name: 'Search' }] })}>
            <Text style={s.homeBtnTxt}>Volver al inicio</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const handleFinish = () => { resetBooking(); nav.reset({ index: 0, routes: [{ name: 'Search' }] }); };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Reservé mi vuelo! ✈️\n${selectedFlight.airline} ${selectedFlight.flightNumber}\n${selectedFlight.origin} → ${selectedFlight.destination}\nFecha: ${selectedFlight.date}\nAsientos: ${selectedSeats.join(', ')}\nPasajero: ${passengerDetails.firstName} ${passengerDetails.lastName}`,
      });
    } catch { /* ignore */ }
  };

  const qrData = JSON.stringify({
    flight: selectedFlight.flightNumber,
    pax: `${passengerDetails.firstName} ${passengerDetails.lastName}`,
    seats: selectedSeats.join(','),
    date: selectedFlight.date,
  });

  return (
    <View style={s.root}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop' }}
        style={s.bg} resizeMode="cover"
      >
        <View style={s.overlay} />
        <SafeAreaView style={s.safe}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>🎫 Boarding Pass</Text>
            <TouchableOpacity style={s.doneBtn} onPress={handleFinish}>
              <Text style={s.doneTxt}>Finalizar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={[s.scroll, { maxWidth: MAX_W, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>

            {/* Ticket card */}
            <View style={s.ticket}>
              {/* Top - dark blue */}
              <View style={s.ticketTop}>
                <Text style={s.airline}>{selectedFlight.airline}</Text>
                <View style={s.routeRow}>
                  <View>
                    <Text style={s.routeLabel}>Origen</Text>
                    <Text style={s.routeCode}>{selectedFlight.origin}</Text>
                    <Text style={s.routeTime}>{selectedFlight.departureTime}</Text>
                  </View>
                  <View style={s.planeIcon}><Text style={{ fontSize: 28 }}>✈️</Text></View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.routeLabel}>Destino</Text>
                    <Text style={s.routeCode}>{selectedFlight.destination}</Text>
                    <Text style={s.routeTime}>{selectedFlight.arrivalTime}</Text>
                  </View>
                </View>
              </View>

              {/* Tear separator */}
              <View style={s.sep}>
                <View style={s.circleL} />
                <View style={s.dash} />
                <View style={s.circleR} />
              </View>

              {/* Details */}
              <View style={s.details}>
                {[
                  ['Pasajero', `${passengerDetails.firstName} ${passengerDetails.lastName}`],
                  ['Vuelo', selectedFlight.flightNumber],
                  ['Fecha', selectedFlight.date],
                  ['Asiento(s)', selectedSeats.join(', ')],
                  ['Puerta', 'B22'],
                  ['Duración', selectedFlight.duration],
                ].map(([label, value]) => (
                  <View key={label} style={s.detailItem}>
                    <Text style={s.detailLabel}>{label}</Text>
                    <Text style={s.detailValue}>{value}</Text>
                  </View>
                ))}
              </View>

              {/* Tear separator */}
              <View style={s.sep}>
                <View style={s.circleL} />
                <View style={s.dash} />
                <View style={s.circleR} />
              </View>

              {/* QR */}
              <View style={s.qrSection}>
                <View style={s.qrBox}>
                  <QRCode value={qrData} size={140} color="#0f172a" backgroundColor="#fff" />
                </View>
                <Text style={s.qrHint}>Presentá este código en el embarque</Text>
              </View>
            </View>

            {/* Share button */}
            <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.85}>
              <Text style={s.shareTxt}>📲 Compartir Ticket</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.newSearchBtn} onPress={handleFinish} activeOpacity={0.85}>
              <Text style={s.newSearchTxt}>🔍 Nueva Búsqueda</Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050918' },
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,9,24,0.85)' },
  safe: { flex: 1 },
  errorCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTxt: { color: '#fca5a5', fontSize: 18, marginBottom: 20 },
  homeBtn: { backgroundColor: '#0288D1', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  homeBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10 },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  doneBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  doneTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scroll: { paddingHorizontal: 20, paddingBottom: 50 },
  ticket: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
  ticketTop: { backgroundColor: '#1A237E', padding: 24 },
  airline: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '700', letterSpacing: 1, marginBottom: 20 },
  routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 },
  routeCode: { color: '#fff', fontSize: 38, fontWeight: '900' },
  routeTime: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginTop: 4 },
  planeIcon: { alignItems: 'center' },
  sep: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', height: 36 },
  circleL: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#050918', marginLeft: -18 },
  circleR: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#050918', marginRight: -18 },
  dash: { flex: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#e2e8f0', height: 1, marginHorizontal: 8 },
  details: { padding: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  detailItem: { width: '50%', marginBottom: 18, paddingRight: 8 },
  detailLabel: { color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  detailValue: { color: '#0f172a', fontSize: 15, fontWeight: '800' },
  qrSection: { alignItems: 'center', paddingVertical: 28, backgroundColor: '#f8fafc' },
  qrBox: { padding: 14, backgroundColor: '#fff', borderRadius: 16 },
  qrHint: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 14 },
  shareBtn: { backgroundColor: '#0288D1', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  shareTxt: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  newSearchBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  newSearchTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
