import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, ImageBackground, StyleSheet, Dimensions, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Search'>;

const { width } = Dimensions.get('window');
const MAX_W = Platform.OS === 'web' ? 820 : width;

const DESTINATIONS = [
  { id: '1', name: 'París', code: 'CDG', emoji: '🗼', temp: '18°C', bg: 'rgba(30,60,120,0.8)' },
  { id: '2', name: 'Tokio', code: 'NRT', emoji: '⛩️', temp: '22°C', bg: 'rgba(120,20,60,0.8)' },
  { id: '3', name: 'Nueva York', code: 'JFK', emoji: '🗽', temp: '15°C', bg: 'rgba(20,80,120,0.8)' },
  { id: '4', name: 'Dubái', code: 'DXB', emoji: '🌆', temp: '35°C', bg: 'rgba(120,80,10,0.8)' },
  { id: '5', name: 'Sydney', code: 'SYD', emoji: '🦘', temp: '24°C', bg: 'rgba(10,100,80,0.8)' },
];

export default function SearchScreen() {
  const [origin, setOrigin] = useState('EZE');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [originError, setOriginError] = useState('');
  const [destinationError, setDestinationError] = useState('');
  const [dateError, setDateError] = useState('');
  const nav = useNavigation<Nav>();
  const { user, logout } = useAuth();

  // Auto-format date as user types: inserts dashes automatically
  const handleDateChange = (raw: string) => {
    setDateError('');
    // Strip everything except digits
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length > 6) formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
    setDate(formatted);
  };

  const validateDate = (d: string): string => {
    if (!d.trim()) return 'Ingresá la fecha de vuelo.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return 'Formato incorrecto. Usá YYYY-MM-DD.';
    const [y, m, day] = d.split('-').map(Number);
    if (m < 1 || m > 12) return 'El mes debe estar entre 01 y 12.';
    const daysInMonth = new Date(y, m, 0).getDate();
    if (day < 1 || day > daysInMonth) return `El día debe estar entre 01 y ${daysInMonth} para ese mes.`;
    const selected = new Date(y, m - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) return 'La fecha no puede ser en el pasado.';
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    if (selected > maxDate) return 'La fecha no puede ser más de 2 años en el futuro.';
    return '';
  };

  const validate = () => {
    let valid = true;
    setOriginError(''); setDestinationError(''); setDateError('');
    if (!origin.trim() || origin.trim().length < 2) { setOriginError('Ingresá un código de aeropuerto (ej: EZE).'); valid = false; }
    if (!destination.trim() || destination.trim().length < 2) { setDestinationError('Ingresá un código de destino (ej: JFK).'); valid = false; }
    if (origin.trim().toUpperCase() === destination.trim().toUpperCase()) { setDestinationError('El destino debe ser distinto al origen.'); valid = false; }
    const dateErr = validateDate(date);
    if (dateErr) { setDateError(dateErr); valid = false; }
    return valid;
  };

  const handleSearch = () => {
    if (!validate()) return;
    nav.navigate('FlightResults', { origin: origin.trim().toUpperCase(), destination: destination.trim().toUpperCase(), date: date.trim() });
  };

  return (
    <View style={s.root}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=2000&auto=format&fit=crop' }}
        style={s.bg} resizeMode="cover"
      >
        <View style={s.overlay} />
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={[s.scroll, { maxWidth: MAX_W, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={s.header}>
              <View>
                <Text style={s.greeting}>Hola, {user?.name?.split(' ')[0] ?? 'Viajero'} 👋</Text>
                <Text style={s.headerTitle}>¿A dónde volás hoy?</Text>
              </View>
              <TouchableOpacity style={s.logoutBtn} onPress={logout}>
                <Text style={s.logoutText}>Salir</Text>
              </TouchableOpacity>
            </View>

            {/* Trending Destinations */}
            <Text style={s.sectionTitle}>Destinos Populares</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hScroll}>
              {DESTINATIONS.map(d => (
                <TouchableOpacity key={d.id} style={[s.destCard, { backgroundColor: d.bg }]} onPress={() => setDestination(d.code)} activeOpacity={0.8}>
                  <Text style={s.destEmoji}>{d.emoji}</Text>
                  <Text style={s.destName}>{d.name}</Text>
                  <Text style={s.destCode}>{d.code}</Text>
                  <Text style={s.destTemp}>{d.temp}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Search Form */}
            <View style={s.formCard}>
              <Text style={s.formTitle}>🔍 Buscar Vuelo</Text>

              <Text style={s.label}>Origen</Text>
              <TextInput style={[s.input, !!originError && s.inputError]} value={origin} onChangeText={t => { setOrigin(t); setOriginError(''); }} placeholder="Ej: EZE" placeholderTextColor="rgba(255,255,255,0.4)" autoCapitalize="characters" maxLength={3} />
              {!!originError && <Text style={s.fieldError}>{originError}</Text>}

              <Text style={s.label}>Destino</Text>
              <TextInput style={[s.input, !!destinationError && s.inputError]} value={destination} onChangeText={t => { setDestination(t); setDestinationError(''); }} placeholder="Ej: JFK" placeholderTextColor="rgba(255,255,255,0.4)" autoCapitalize="characters" maxLength={3} />
              {!!destinationError && <Text style={s.fieldError}>{destinationError}</Text>}

              {/* Date field – full width with inline hint */}
              <Text style={s.label}>Fecha de vuelo</Text>
              <View style={s.dateWrapper}>
                <TextInput
                  style={[s.input, s.dateInput, !!dateError && s.inputError]}
                  value={date}
                  onChangeText={handleDateChange}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="number-pad"
                  maxLength={10}
                />
                <Text style={s.dateHint}>📅 {date.length === 10 ? date : 'ej: 2025-06-15'}</Text>
              </View>
              {!!dateError && <Text style={s.fieldError}>⚠️ {dateError}</Text>}

              <View style={s.row}>
                <View style={s.half}>
                  <Text style={s.label}>Pasajeros</Text>
                  <TextInput style={s.input} value={passengers} onChangeText={t => setPassengers(t.replace(/[^1-9]/g, '').slice(0, 1) || '1')} keyboardType="number-pad" maxLength={1} placeholder="1" placeholderTextColor="rgba(255,255,255,0.4)" />
                </View>
              </View>

              <TouchableOpacity style={s.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
                <Text style={s.searchBtnText}>✈ Buscar Vuelos</Text>
              </TouchableOpacity>
            </View>

            {/* AI Tip */}
            <View style={s.aiCard}>
              <Text style={s.aiIcon}>✨</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.aiTitle}>Travel AI</Text>
                <Text style={s.aiText}>
                  {destination
                    ? `¡Llevá ropa cómoda para ${destination}! El clima puede variar.`
                    : '¡Seleccioná un destino para obtener consejos de viaje!'}
                </Text>
              </View>
            </View>

          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050918' },
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,9,24,0.6)' },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  greeting: { color: '#4FC3F7', fontSize: 14, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '900' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 14, letterSpacing: 0.5 },
  hScroll: { paddingRight: 10, marginBottom: 28 },
  destCard: { width: 120, borderRadius: 20, padding: 16, marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  destEmoji: { fontSize: 28, marginBottom: 8 },
  destName: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  destCode: { color: '#4FC3F7', fontSize: 16, fontWeight: '900', marginTop: 2 },
  destTemp: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 4 },
  formCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', marginBottom: 20 },
  formTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 18, letterSpacing: 0.5 },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 13, paddingHorizontal: 16, paddingVertical: 13, color: '#fff', fontSize: 15, marginBottom: 4 },
  inputError: { borderColor: 'rgba(255,80,80,0.7)' },
  fieldError: { color: '#fca5a5', fontSize: 12, marginBottom: 8, marginLeft: 2 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  searchBtn: { backgroundColor: '#0288D1', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 14 },
  searchBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  aiCard: { backgroundColor: 'rgba(2,136,209,0.2)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(2,136,209,0.4)', flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiIcon: { fontSize: 26 },
  aiTitle: { color: '#4FC3F7', fontSize: 13, fontWeight: '800', marginBottom: 4 },
  aiText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  dateWrapper: { position: 'relative', marginBottom: 4 },
  dateInput: { paddingRight: 110 }, // leave room for the hint text
  dateHint: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 46,   // matches input height
  },
});
