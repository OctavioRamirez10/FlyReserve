import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ActivityIndicator, ImageBackground, StyleSheet,
  ScrollView, Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const MAX_W = Platform.OS === 'web' ? 440 : Dimensions.get('window').width * 0.92;

export default function LoginScreen() {
  const [email, setEmail] = useState('user@test.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const nav = useNavigation<Nav>();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor completá todos los campos.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Ingresá un email válido.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      nav.replace('Search');
    } catch {
      setError('Login fallido. Verificá tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop' }}
        style={s.bg}
        resizeMode="cover"
      >
        <View style={s.overlay} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.kav}>
          <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
            <View style={[s.card, { maxWidth: MAX_W }]}>
              {/* Logo */}
              <Text style={s.logo}>✈ FlyReserve</Text>
              <Text style={s.tagline}>Elevate Your Journey</Text>
              <View style={s.divider} />

              <Text style={s.title}>Bienvenido</Text>

              {!!error && (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>⚠️ {error}</Text>
                </View>
              )}

              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="rgba(255,255,255,0.45)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Text style={s.label}>Contraseña</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.45)"
                secureTextEntry
                autoComplete="current-password"
              />

              <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Iniciar Sesión</Text>}
              </TouchableOpacity>

              <View style={s.footer}>
                <Text style={s.footerText}>¿No tenés cuenta? </Text>
                <TouchableOpacity onPress={() => nav.navigate('Register')}>
                  <Text style={s.footerLink}>Registrate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050918' },
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,9,24,0.55)' },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderRadius: 28,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  logo: { fontSize: 32, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: 2 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4, letterSpacing: 2, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 22 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  errorBox: { backgroundColor: 'rgba(220,38,38,0.25)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { color: '#fca5a5', fontWeight: '600', textAlign: 'center', fontSize: 13 },
  label: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
  },
  btn: { backgroundColor: '#0288D1', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: 'rgba(255,255,255,0.65)', fontSize: 14 },
  footerLink: { color: '#4FC3F7', fontWeight: 'bold', fontSize: 14 },
});
