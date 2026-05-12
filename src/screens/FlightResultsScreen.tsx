import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView,
  ImageBackground, StyleSheet, Dimensions, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useBooking, Flight } from '../context/BookingContext';

type Route = RouteProp<RootStackParamList, 'FlightResults'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'FlightResults'>;

const { width } = Dimensions.get('window');
const MAX_W = Platform.OS === 'web' ? 820 : width;

const AIRLINES = [
  { logo: '🔵', name: 'FlyAir', code: 'FA', color: '#0288D1' },
  { logo: '🟠', name: 'Oceanic', code: 'OA', color: '#E65100' },
  { logo: '🟢', name: 'Global Jet', code: 'GJ', color: '#2E7D32' },
];

function generateFlights(origin: string, destination: string, date: string): Flight[] {
  return [
    { id: '1', airline: 'FlyAir', flightNumber: 'FA101', origin, destination, date, departureTime: '06:30', arrivalTime: '14:45', price: 420, duration: '8h 15m' },
    { id: '2', airline: 'Oceanic', flightNumber: 'OA815', origin, destination, date, departureTime: '11:00', arrivalTime: '19:20', price: 580, duration: '8h 20m' },
    { id: '3', airline: 'Global Jet', flightNumber: 'GJ303', origin, destination, date, departureTime: '16:45', arrivalTime: '01:05', price: 340, duration: '8h 20m' },
    { id: '4', airline: 'FlyAir', flightNumber: 'FA205', origin, destination, date, departureTime: '22:15', arrivalTime: '06:30', price: 290, duration: '8h 15m' },
  ];
}

const FILTERS = ['Precio ↑', 'Precio ↓', 'Duración', 'Aerolínea'];

export default function FlightResultsScreen() {
  const route = useRoute<Route>();
  const nav = useNavigation<Nav>();
  const { setSelectedFlight } = useBooking();
  const { origin, destination, date } = route.params;
  const [filter, setFilter] = useState('Precio ↑');

  const flights = generateFlights(origin, destination, date);

  const sorted = [...flights].sort((a, b) => {
    if (filter === 'Precio ↑') return a.price - b.price;
    if (filter === 'Precio ↓') return b.price - a.price;
    if (filter === 'Aerolínea') return a.airline.localeCompare(b.airline);
    return 0;
  });

  const handleSelect = (f: Flight) => {
    setSelectedFlight(f);
    nav.navigate('SeatMap');
  };

  const airlineColor = (name: string) => AIRLINES.find(a => a.name === name)?.color ?? '#00BCD4';
  const airlineLogo = (name: string) => AIRLINES.find(a => a.name === name)?.logo ?? '✈️';

  return (
    <View style={s.root}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=2000&auto=format&fit=crop' }}
        style={s.bg} resizeMode="cover"
      >
        <View style={s.overlay} />
        <SafeAreaView style={s.safe}>
          <View style={[s.content, { maxWidth: MAX_W, alignSelf: 'center', width: '100%' }]}>

            {/* Header */}
            <View style={s.header}>
              <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
                <Text style={s.backText}>← Volver</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={s.route}>{origin} → {destination}</Text>
                <Text style={s.sub}>{date} · {sorted.length} vuelos</Text>
              </View>
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
              {FILTERS.map(f => (
                <TouchableOpacity key={f} style={[s.filterPill, filter === f && s.filterActive]} onPress={() => setFilter(f)}>
                  <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Flight list */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
              {sorted.map(f => (
                <TouchableOpacity key={f.id} style={s.card} onPress={() => handleSelect(f)} activeOpacity={0.88}>
                  {/* Airline row */}
                  <View style={s.cardTop}>
                    <View style={s.airlineRow}>
                      <Text style={s.airlineLogo}>{airlineLogo(f.airline)}</Text>
                      <View>
                        <Text style={s.airlineName}>{f.airline}</Text>
                        <Text style={s.flightNum}>{f.flightNumber}</Text>
                      </View>
                    </View>
                    <View style={[s.priceBadge, { backgroundColor: airlineColor(f.airline) + '22', borderColor: airlineColor(f.airline) + '55' }]}>
                      <Text style={[s.price, { color: airlineColor(f.airline) }]}>${f.price}</Text>
                      <Text style={s.perPax}>/ pax</Text>
                    </View>
                  </View>

                  {/* Route times */}
                  <View style={s.routeRow}>
                    <View style={s.timeBlock}>
                      <Text style={s.time}>{f.departureTime}</Text>
                      <Text style={s.city}>{f.origin}</Text>
                    </View>
                    <View style={s.lineBlock}>
                      <Text style={s.duration}>{f.duration}</Text>
                      <View style={s.line}>
                        <View style={[s.dot, { backgroundColor: airlineColor(f.airline) }]} />
                        <View style={[s.bar, { backgroundColor: airlineColor(f.airline) + '44' }]} />
                        <View style={[s.dot, { backgroundColor: airlineColor(f.airline) }]} />
                      </View>
                      <Text style={s.direct}>Directo</Text>
                    </View>
                    <View style={[s.timeBlock, { alignItems: 'flex-end' }]}>
                      <Text style={s.time}>{f.arrivalTime}</Text>
                      <Text style={s.city}>{f.destination}</Text>
                    </View>
                  </View>

                  <View style={s.selectRow}>
                    <Text style={s.selectHint}>Toca para seleccionar asiento →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050918' },
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,9,24,0.72)' },
  safe: { flex: 1 },
  content: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12, gap: 14 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  backText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  route: { color: '#fff', fontSize: 22, fontWeight: '900' },
  sub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 },
  filters: { paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  filterActive: { backgroundColor: '#0288D1', borderColor: '#0288D1' },
  filterText: { color: 'rgba(255,255,255,0.65)', fontWeight: '700', fontSize: 13 },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 22, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  airlineRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  airlineLogo: { fontSize: 22 },
  airlineName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  flightNum: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 1 },
  priceBadge: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, alignItems: 'center' },
  price: { fontSize: 22, fontWeight: '900' },
  perPax: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 1 },
  routeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeBlock: { flex: 1 },
  time: { color: '#fff', fontSize: 24, fontWeight: '900' },
  city: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600', marginTop: 3 },
  lineBlock: { flex: 1.4, alignItems: 'center' },
  duration: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  line: { flexDirection: 'row', alignItems: 'center', width: '90%', marginBottom: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  bar: { flex: 1, height: 2, marginHorizontal: 4 },
  direct: { color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: '600' },
  selectRow: { borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 14, paddingTop: 10 },
  selectHint: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'right' },
});
