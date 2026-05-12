import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView,
  ImageBackground, StyleSheet, Dimensions, Platform, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useBooking } from '../context/BookingContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SeatMap'>;

const { width } = Dimensions.get('window');
const MAX_W = Platform.OS === 'web' ? 620 : width;

const ROWS = 25;
const LEFT = ['A', 'B', 'C'];
const RIGHT = ['D', 'E', 'F'];
const OCCUPIED = ['1A', '1B', '2C', '3F', '5A', '7D', '10B', '10C', '14E', '14F', '20A', '22B'];
const FC_ROWS = 5;
const FC_PRICE = 200;

type SeatStatus = 'available' | 'first' | 'selected' | 'occupied';

export default function SeatMapScreen() {
  const nav = useNavigation<Nav>();
  const { selectedFlight, selectedSeats, setSelectedSeats } = useBooking();

  const getSeatStatus = (id: string, row: number): SeatStatus => {
    if (OCCUPIED.includes(id)) return 'occupied';
    if (selectedSeats.includes(id)) return 'selected';
    if (row <= FC_ROWS) return 'first';
    return 'available';
  };

  const toggle = (id: string) => {
    if (OCCUPIED.includes(id)) return;
    if (selectedSeats.includes(id)) {
      setSelectedSeats(selectedSeats.filter(s => s !== id));
    } else {
      if (selectedSeats.length >= 4) {
        Alert.alert('Límite', 'Podés elegir hasta 4 asientos.');
        return;
      }
      setSelectedSeats([...selectedSeats, id]);
    }
  };

  const base = selectedFlight?.price ?? 0;
  const total = selectedSeats.reduce((acc, id) => {
    const row = parseInt(id.replace(/\D/g, ''), 10);
    return acc + (row <= FC_ROWS ? base + FC_PRICE : base);
  }, 0);

  const seatStyle = (st: SeatStatus) => {
    if (st === 'occupied') return s.occupied;
    if (st === 'selected') return s.selected;
    if (st === 'first') return s.firstClass;
    return s.available;
  };

  const textStyle = (st: SeatStatus) => {
    if (st === 'occupied') return s.textOccupied;
    if (st === 'selected') return s.textSelected;
    if (st === 'first') return s.textFirst;
    return s.textAvailable;
  };

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
              <Text style={s.title}>Boeing 787</Text>
              <Text style={s.sub}>Elegí tus asientos</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={s.legend}>
            {([['primera', 'PRIMERA (+$200)', s.firstClass], ['disponible', 'ECONÓMICO', s.available], ['seleccionado', 'SELECCIONADO', s.selected], ['ocupado', 'OCUPADO', s.occupied]] as [string, string, any][]).map(([key, label, style]) => (
              <View key={key} style={s.legendItem}>
                <View style={[s.legendBox, style]} />
                <Text style={s.legendText}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Cabin */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.cabin, { width: Math.min(MAX_W * 0.88, 340) }]}>
              <View style={s.nose} />
              {Array.from({ length: ROWS }).map((_, i) => {
                const row = i + 1;
                return (
                  <React.Fragment key={row}>
                    {row === FC_ROWS + 1 && (
                      <View style={s.divider}>
                        <View style={s.divLine} />
                        <Text style={s.divText}>CLASE ECONÓMICA</Text>
                        <View style={s.divLine} />
                      </View>
                    )}
                    <View style={s.rowWrap}>
                      <View style={s.group}>
                        {LEFT.map(col => {
                          const id = `${row}${col}`;
                          const st = getSeatStatus(id, row);
                          return (
                            <TouchableOpacity key={id} style={[s.seat, seatStyle(st)]} onPress={() => toggle(id)} disabled={st === 'occupied'} activeOpacity={0.75}>
                              <Text style={[s.seatTxt, textStyle(st)]}>{col}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      <Text style={s.rowNum}>{row}</Text>
                      <View style={s.group}>
                        {RIGHT.map(col => {
                          const id = `${row}${col}`;
                          const st = getSeatStatus(id, row);
                          return (
                            <TouchableOpacity key={id} style={[s.seat, seatStyle(st)]} onPress={() => toggle(id)} disabled={st === 'occupied'} activeOpacity={0.75}>
                              <Text style={[s.seatTxt, textStyle(st)]}>{col}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </React.Fragment>
                );
              })}
              <View style={s.tail} />
            </ScrollView>
          </View>

          {/* Bottom bar */}
          <View style={s.bar}>
            <View>
              <Text style={s.barLabel}>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Ningún asiento elegido'}</Text>
              <Text style={s.barPrice}>${total}</Text>
            </View>
            <TouchableOpacity
              style={[s.continueBtn, selectedSeats.length === 0 && s.continueDis]}
              onPress={() => { if (selectedSeats.length > 0) nav.navigate('Checkout'); else Alert.alert('Sin asiento', 'Elegí al menos un asiento.'); }}
              activeOpacity={0.85}
            >
              <Text style={s.continueTxt}>Continuar →</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050918' },
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,9,24,0.8)' },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10, gap: 14 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  backText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  sub: { color: '#4FC3F7', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 10, paddingHorizontal: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1 },
  legendText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700' },
  cabin: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 40, paddingVertical: 20, paddingHorizontal: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignSelf: 'center', marginBottom: 10 },
  nose: { height: 35, borderTopLeftRadius: 80, borderTopRightRadius: 80, borderWidth: 1.5, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 20, marginHorizontal: 30 },
  tail: { height: 25, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, borderWidth: 1.5, borderTopWidth: 0, borderColor: 'rgba(255,255,255,0.2)', marginTop: 16, marginHorizontal: 20 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  divText: { color: 'rgba(255,255,255,0.4)', paddingHorizontal: 10, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  rowWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  group: { flexDirection: 'row', gap: 6 },
  rowNum: { color: 'rgba(255,255,255,0.25)', fontSize: 13, fontWeight: '700', width: 24, textAlign: 'center' },
  seat: { width: 33, height: 38, borderRadius: 7, borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  seatTxt: { fontSize: 12, fontWeight: '800' },
  available: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.25)' },
  textAvailable: { color: 'rgba(255,255,255,0.75)' },
  firstClass: { backgroundColor: 'rgba(255,215,0,0.12)', borderColor: 'rgba(255,215,0,0.45)' },
  textFirst: { color: '#FFD700' },
  selected: { backgroundColor: '#00E676', borderColor: '#00C853' },
  textSelected: { color: '#000' },
  occupied: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' },
  textOccupied: { color: 'rgba(255,255,255,0.15)' },
  bar: { backgroundColor: 'rgba(5,9,24,0.97)', paddingHorizontal: 24, paddingVertical: 18, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  barPrice: { color: '#fff', fontSize: 26, fontWeight: '900' },
  continueBtn: { backgroundColor: '#0288D1', paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14 },
  continueDis: { backgroundColor: 'rgba(255,255,255,0.1)' },
  continueTxt: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});
