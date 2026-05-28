import React, { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Inter_400Regular } from '@expo-google-fonts/inter';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider, useCart } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ToastProvider } from '@/context/ToastContext';
import { WishlistProvider, useWishlist } from '@/context/WishlistContext';

function SyncManager() {
  const { userToken } = useAuth();
  const { loadFromServer: loadCart, clearLocalCart } = useCart();
  const { loadFromServer: loadWishlist, clearLocalWishlist } = useWishlist();

  useEffect(() => {
    if (userToken) {
      loadCart();
      loadWishlist();
      return;
    }

    clearLocalCart();
    clearLocalWishlist();
  }, [clearLocalCart, clearLocalWishlist, loadCart, loadWishlist, userToken]);

  return null;
}

export default function NativeRootLayout() {
  const colorScheme = useColorScheme();
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
                <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
                <StatusBar style="dark" />
              </ThemeProvider>
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </CurrencyProvider>
  );
}