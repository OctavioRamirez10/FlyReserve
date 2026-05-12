import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, ImageBackground, StyleSheet, Dimensions,
  KeyboardAvoidingView, Platform, Animated, Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useBooking } from '../context/BookingContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;
const { width } = Dimensions.get('window');
const MAX_W = Platform.OS === 'web' ? 620 : width;

function formatCardDisplay(raw: string) {
  return raw.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
}

export default function CheckoutScreen() {
  const nav = useNavigation<Nav>();
  const { selectedFlight, selectedSeats, setPassengerDetails } = useBooking();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passport, setPassport] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const flip = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  const animateTo = (v: number) =>
    Animated.timing(flip, { toValue: v, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();

  const front = flip.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const back = flip.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });
  const progressW = progress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  const validate = () => {
    if (!firstName.trim()) return 'Ingresá tu nombre.';
    if (!lastName.trim()) return 'Ingresá tu apellido.';
    if (cardNumber.replace(/\s/g, '').length < 16) return 'El número de tarjeta debe tener 16 dígitos.';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Fecha de vencimiento inválida (MM/AA).';
    if (cvv.length < 3) return 'CVV inválido.';
    return '';
  };

  const handlePayment = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setIsProcessing(true);
    Animated.timing(progress, { toValue: 100, duration: 2800, useNativeDriver: false }).start(() => {
      setIsProcessing(false);
      setPassengerDetails({ firstName: firstName.trim(), lastName: lastName.trim(), passport: passport.trim() });
      nav.reset({ index: 0, routes: [{ name: 'Ticket' }] });
    });
  };

  const base = selectedFlight?.price ?? 0;
  const total = selectedSeats.reduce((acc, id) => {
    const row = parseInt(id.replace(/\D/g, ''), 10);
    return acc + (row <= 5 ? base + 200 : base);
  }, 0);

  return (
    <View style={s.root}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=2000&auto=format&fit=crop' }}
        style={s.bg} resizeMode="cover"
      >
        <View style={s.overlay} />
        <SafeAreaView style={s.safe}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
              <Text style={s.backText}>← Volver</Text>
            </TouchableOpacity>
            <View>
              <Text style={s.title}>Checkout</Text>
              <Text style={s.sub}>Finalizá tu reserva</Text>
            </View>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={[s.scroll, { maxWidth: MAX_W, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>

              {/* 3D Card */}
              <View style={s.cardWrap}>
                {/* Front */}
                <Animated.View style={[s.card3d, { transform: [{ rotateY: front }], backfaceVisibility: 'hidden' }]}>
                  <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1620325867502-221ddb5faa5f?q=80&w=1000&auto=format&fit=crop' }} style={s.cardBg} imageStyle={{ borderRadius: 20 }}>
                    <View style={s.cardOverlay} />
                    <Text style={s.cardType}>✈ FlyReserve Visa</Text>
                    <Text style={s.cardNum}>{cardNumber ? formatCardDisplay(cardNumber) : '**** **** **** ****'}</Text>
                    <View style={s.cardFoot}>
                      <View>
                        <Text style={s.cardLab}>Titular</Text>
                        <Text style={s.cardVal}>{firstName || lastName ? `${firstName} ${lastName}`.toUpperCase().trim() || 'JOHN DOE' : 'JOHN DOE'}</Text>
                      </View>
                      <View>
                        <Text style={s.cardLab}>Vence</Text>
                        <Text style={s.cardVal}>{expiry || 'MM/AA'}</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </Animated.View>
                {/* Back */}
                <Animated.View style={[s.card3d, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, transform: [{ rotateY: back }], backfaceVisibility: 'hidden' }]}>
                  <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1620325867502-221ddb5faa5f?q=80&w=1000&auto=format&fit=crop' }} style={s.cardBg} imageStyle={{ borderRadius: 20 }}>
                    <View style={s.cardOverlay} />
                    <View style={s.magStrip} />
                    <View style={s.cvvRow}><Text style={s.cvvTxt}>{cvv || '•••'}</Text></View>
                    <Text style={s.cvvLab}>CVV</Text>
                  </ImageBackground>
                </Animated.View>
              </View>

              {!!error && <View style={s.errBox}><Text style={s.errTxt}>⚠️ {error}</Text></View>}

              {/* Passenger */}
              <View style={s.section}>
                <Text style={s.sTitle}>👤 Datos del Pasajero</Text>
                <View style={s.row}>
                  <TextInput style={[s.input, { flex: 1, marginRight: 8 }]} placeholder="Nombre" placeholderTextColor="rgba(255,255,255,0.4)" value={firstName} onChangeText={setFirstName} />
                  <TextInput style={[s.input, { flex: 1 }]} placeholder="Apellido" placeholderTextColor="rgba(255,255,255,0.4)" value={lastName} onChangeText={setLastName} />
                </View>
                <TextInput style={s.input} placeholder="Pasaporte (opcional)" placeholderTextColor="rgba(255,255,255,0.4)" value={passport} onChangeText={setPassport} />
              </View>

              {/* Payment */}
              <View style={s.section}>
                <Text style={s.sTitle}>💳 Pago</Text>
                <TextInput
                  style={s.input} placeholder="Número de tarjeta" placeholderTextColor="rgba(255,255,255,0.4)"
                  value={cardNumber} onChangeText={t => setCardNumber(t.replace(/\D/g, '').slice(0, 16))}
                  keyboardType="number-pad" maxLength={19} onFocus={() => animateTo(0)}
                />
                <View style={s.row}>
                  <TextInput
                    style={[s.input, { flex: 1, marginRight: 8 }]} placeholder="MM/AA" placeholderTextColor="rgba(255,255,255,0.4)"
                    value={expiry} onChangeText={t => {
                      const digits = t.replace(/\D/g, '').slice(0, 4);
                      setExpiry(digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                    }}
                    keyboardType="number-pad" maxLength={5} onFocus={() => animateTo(0)}
                  />
                  <TextInput
                    style={[s.input, { flex: 1 }]} placeholder="CVV" placeholderTextColor="rgba(255,255,255,0.4)"
                    value={cvv} onChangeText={t => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                    keyboardType="number-pad" maxLength={4} secureTextEntry onFocus={() => animateTo(180)} onBlur={() => animateTo(0)}
                  />
                </View>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>

          {/* Bottom Bar */}
          <View style={[s.bottomBar, { maxWidth: MAX_W, alignSelf: 'center', width: '100%' }]}>
            <View>
              <Text style={s.totalLab}>Total a pagar</Text>
              <Text style={s.totalPrice}>${total}</Text>
            </View>
            {isProcessing ? (
              <View style={s.progressWrap}>
                <Text style={s.processingTxt}>Procesando...</Text>
                <View style={s.progressBg}><Animated.View style={[s.progressFill, { width: progressW }]} /></View>
              </View>
            ) : (
              <TouchableOpacity style={s.payBtn} onPress={handlePayment} activeOpacity={0.85}>
                <Text style={s.payTxt}>🔒 Pagar</Text>
              </TouchableOpacity>
            )}
          </View>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10, gap: 14 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  backText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  sub: { color: '#4FC3F7', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 30 },
  cardWrap: { height: 210, marginBottom: 24, marginTop: 4 },
  card3d: { width: '100%', height: 210, borderRadius: 20 },
  cardBg: { width: '100%', height: '100%', padding: 24, justifyContent: 'space-between', overflow: 'hidden' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)' },
  cardType: { color: '#fff', fontSize: 18, fontWeight: '900', alignSelf: 'flex-end' },
  cardNum: { color: '#fff', fontSize: 22, letterSpacing: 2, fontWeight: '700' },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLab: { color: 'rgba(255,255,255,0.55)', fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
  cardVal: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  magStrip: { width: '120%', height: 42, backgroundColor: '#111', marginLeft: -24, marginTop: 12 },
  cvvRow: { backgroundColor: '#fff', height: 40, marginTop: 16, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 14 },
  cvvTxt: { color: '#000', fontStyle: 'italic', fontWeight: '800', fontSize: 18 },
  cvvLab: { color: '#fff', alignSelf: 'flex-end', marginTop: 6, fontSize: 12, fontWeight: '700' },
  errBox: { backgroundColor: 'rgba(220,38,38,0.22)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.45)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errTxt: { color: '#fca5a5', fontWeight: '600', textAlign: 'center', fontSize: 13 },
  section: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', marginBottom: 16 },
  sTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 14 },
  row: { flexDirection: 'row', gap: 8 },
  input: { backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 13, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 15, marginBottom: 12 },
  bottomBar: { backgroundColor: 'rgba(5,9,24,0.97)', paddingHorizontal: 24, paddingVertical: 18, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLab: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  totalPrice: { color: '#4FC3F7', fontSize: 28, fontWeight: '900' },
  payBtn: { backgroundColor: '#00C853', paddingHorizontal: 28, paddingVertical: 15, borderRadius: 14 },
  payTxt: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  progressWrap: { flex: 1, marginLeft: 20 },
  processingTxt: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  progressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0288D1', borderRadius: 4 },
});
