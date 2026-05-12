import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SearchScreen from '../screens/SearchScreen';
import FlightResultsScreen from '../screens/FlightResultsScreen';
import SeatMapScreen from '../screens/SeatMapScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import TicketScreen from '../screens/TicketScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Search: undefined;
  FlightResults: { origin: string; destination: string; date: string };
  SeatMap: undefined;
  Checkout: undefined;
  Ticket: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: '#050918' } }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="FlightResults" component={FlightResultsScreen} />
          <Stack.Screen name="SeatMap" component={SeatMapScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Ticket" component={TicketScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
