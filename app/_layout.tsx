import { useColorScheme } from '@/hooks/use-color-scheme';
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from "expo-font";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox, Platform } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider, useCart } from '../context/CartContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { ToastProvider } from '../context/ToastContext';
import { WishlistProvider, useWishlist } from '../context/WishlistContext';
import '../global.css';
/** Syncs cart + wishlist with server on login, clears on logout */
function SyncManager() {
  const { userToken } = useAuth();
  const { loadFromServer: loadCart, clearLocalCart } = useCart();
  const { loadFromServer: loadWishlist, clearLocalWishlist } = useWishlist();

  useEffect(() => {
    if (userToken) {
      loadCart();
      loadWishlist();
    } else {
      clearLocalCart();
      clearLocalWishlist();
    }
  }, [clearLocalCart, clearLocalWishlist, loadCart, loadWishlist, userToken]);

  return null;
}

function TawkChat() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (document.getElementById('tawk-chat-script')) return;

    const script = document.createElement('script');
    script.id = 'tawk-chat-script';
    script.async = true;
    script.src = 'https://embed.tawk.to/6a062f3471b8c51c34c0cba6/1jok2gps6';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    document.body.appendChild(script);

    return () => {
      // Do not remove script on route changes
    };
  }, []);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'web') {
      LogBox.ignoreLogs(['"shadow*" style props are deprecated. Use "boxShadow".']);
    }
  }, []);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay: PlayfairDisplay_700Bold,
    Inter: Inter_400Regular,
  });
  if (!fontsLoaded) {
    return null;
  }
  return (
    <CurrencyProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <SyncManager />
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="register" />
                  <Stack.Screen name="customer-dashboard" options={{ animation: 'fade_from_bottom' }} />
                  <Stack.Screen name="profile" />
                  <Stack.Screen name="support-tickets" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="ai-search" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="orders" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="order-tracking" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="payment-success" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="payment-failure" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="seller" />
                  <Stack.Screen name="admin" />
                </Stack>
                <StatusBar style="auto" />
              <TawkChat />
              </ThemeProvider>
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </CurrencyProvider>
  );
}

