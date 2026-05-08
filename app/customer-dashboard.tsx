import CustomerPageFrame from '@/components/Customer/CustomerPageFrame';
import CustomerSidebar from '@/components/Customer/CustomerSidebar';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { getCustomerOverview } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

type CustomerOrder = {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  total?: number;
  createdAt: string;
  items?: { _id?: string; name?: string; quantity?: number }[];
};

type CustomerTicket = {
  _id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority?: string;
  lastMessageAt?: string;
};

type CustomerAddress = {
  _id: string;
  label?: string;
  fullName?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isDefault?: boolean;
};

type CustomerSummary = {
  orderCount: number;
  deliveredOrderCount: number;
  openTicketCount: number;
  wishlistCount: number;
  cartLineCount: number;
  cartItemCount: number;
  cartTotal: number;
};

const PALETTE = {
  dark: '#1C1917',
  darker: '#0C0A09',
  text: '#1C1917',
  muted: '#78716C',
  border: '#E7E5E4',
  paper: '#FAFAF9',
  shell: '#F5F5F4',
};

const statusTone: Record<string, string> = {
  awaiting_payment: '#2563EB',
  payment_failed: '#DC2626',
  pending: '#D97706',
  confirmed: '#059669',
  processing: '#7C3AED',
  shipped: '#D97706',
  out_for_delivery: '#EA580C',
  delivered: '#059669',
  cancelled: '#6B7280',
  returned: '#6B7280',
  open: '#D97706',
  in_progress: '#2563EB',
  pending_customer: '#D97706',
  resolved: '#059669',
  closed: '#6B7280',
};



function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(value?: string) {
  if (!value) return 'Recently';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function toneFor(status?: string) {
  return statusTone[status || ''] || '#8B7355';
}

function formatStatusLabel(value?: string) {
  return String(value || 'ready').replace(/_/g, ' ');
}

function MetricCard({ icon, label, value, accent, sub, }: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  accent: string;
  sub?: string;
}) {
  return (
    <View className="min-w-[150px] flex-1 rounded-[28px] bg-white border border-stone-100 p-6 gap-5">
      <View className="flex-row items-center justify-between">
        <View className="items-center justify-center w-11 h-11 rounded-2xl" style={{ backgroundColor: `${accent}15` }}>
          <Feather name={icon} size={19} color={accent} />
        </View>
        <Text className="text-[38px] leading-none text-stone-900" style={{ color: accent, fontWeight: '700', fontFamily: 'Playfair Display' }}>{value}</Text>
      </View>
      <View>
        <Text className="font-body text-[12px] text-stone-400 mt-1.5 uppercase tracking-widest">{label}</Text>
      </View>
    </View>
  );
}

export default function CustomerDashboardScreen() {

  const router = useRouter();
  const { scrollY, onScroll } = useHeaderScroll();
  const { width } = useWindowDimensions();
  const auth = useProtectedRoute();
  const { userToken, user, updateUser } = auth;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [profilePhone, setProfilePhone] = useState('');
  const [summary, setSummary] = useState<CustomerSummary>({
    orderCount: 0,
    deliveredOrderCount: 0,
    openTicketCount: 0,
    wishlistCount: 0,
    cartLineCount: 0,
    cartItemCount: 0,
    cartTotal: 0,
  });

  const isWide = width >= 1100;

  const loadDashboard = useCallback(async () => {
    if (!userToken) {
      return;
    }

    try {
      const { data } = await getCustomerOverview();
      const nextUser = data?.user || null;
      const nextAddresses = data?.addresses || [];

      setProfilePhone(nextUser?.phone || '');
      setOrders(data?.recentOrders || []);
      setTickets(data?.recentSupportTickets || []);
      setAddresses(nextAddresses);
      setSummary({
        orderCount: Number(data?.summary?.orderCount || 0),
        deliveredOrderCount: Number(data?.summary?.deliveredOrderCount || 0),
        openTicketCount: Number(data?.summary?.openTicketCount || 0),
        wishlistCount: Number(data?.summary?.wishlistCount || 0),
        cartLineCount: Number(data?.summary?.cartLineCount || 0),
        cartItemCount: Number(data?.summary?.cartItemCount || 0),
        cartTotal: Number(data?.summary?.cartTotal || 0),
      });

      if (nextUser) {
        updateUser({
          name: nextUser.name,
          email: nextUser.email,
          phone: nextUser.phone,
          addresses: nextAddresses,
        });
      }
    } catch {
      setOrders([]);
      setTickets([]);
      setAddresses([]);
      setProfilePhone('');
      setSummary({
        orderCount: 0,
        deliveredOrderCount: 0,
        openTicketCount: 0,
        wishlistCount: 0,
        cartLineCount: 0,
        cartItemCount: 0,
        cartTotal: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [updateUser, userToken]);

  useFocusEffect(
    useCallback(() => {
      if (!auth.isAuthorized) {
        return;
      }

      setLoading(true);
      loadDashboard();
    }, [auth.isAuthorized, loadDashboard]),
  );

  const defaultAddress = useMemo(() => addresses.find((address) => address.isDefault) || addresses[0], [addresses]);

  const metricCards = [
    { icon: 'shopping-bag' as const, label: 'Total Orders', value: String(summary.orderCount), accent: '#714329', sub: 'All time' },
    { icon: 'check-circle' as const, label: 'Delivered', value: String(summary.deliveredOrderCount), accent: '#059669', sub: 'Complete' },
    { icon: 'heart' as const, label: 'Wishlist', value: String(summary.wishlistCount), accent: '#E11D48', sub: 'Saved' },
    { icon: 'shopping-cart' as const, label: 'Bag Items', value: String(summary.cartLineCount), accent: '#4F46E5', sub: formatCurrency(summary.cartTotal) },
  ];

  if (auth.shouldBlock) {
    return (
      <View className="items-center justify-center flex-1 bg-stone-50">
        <ActivityIndicator size="large" color={PALETTE.dark} />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-stone-50">
        <ActivityIndicator size="large" color={PALETTE.dark} />
        <Text className="mt-4 font-body text-[14px] text-stone-400">Loading your dashboard…</Text>
      </View>
    );
  }

  return (
    <CustomerPageFrame
      scrollY={scrollY}
      onScroll={onScroll}
      eyebrow="HandCraft — Client Atelier"
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Collector'}.`}
      subtitle="Discover your personalized dashboard with recent orders, support tickets, and exclusive offers tailored just for you."
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadDashboard(); }}
          tintColor="#FFFFFF"
        />
      }
      sidebar={<CustomerSidebar counts={{ orderCount: summary.orderCount, openTicketCount: summary.openTicketCount, wishlistCount: summary.wishlistCount }} />}
      actions={
        <>
          <Pressable
            onPress={() => router.push('/shop' as any)}
            className="px-6 py-3 border rounded-full"
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }, { borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)' }]}
          >
            <Text className="font-body text-[14px] font-semibold text-white">Explore collection</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/orders' as any)}
            className="px-6 py-3 bg-white rounded-full"
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            <Text className="font-body text-[14px] font-bold text-stone-900">View orders</Text>
          </Pressable>
        </>
      }
      heroAside={
        <View className="rounded-[32px] p-7" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
          <View className="flex-row items-center justify-between mb-7">
            <View>
              <Text className="font-body text-[10px] text-white/40 uppercase tracking-[3px] mb-1">Member Account</Text>
              <Text className="font-heading text-[26px] text-white">My Balance</Text>
            </View>
            <View className="items-center justify-center w-11 h-11 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Feather name="credit-card" size={18} color="rgba(255,255,255,0.7)" />
            </View>
          </View>

          <View className="gap-2.5">
            {[
              { icon: 'shopping-cart' as const, label: 'Cart Total', value: formatCurrency(summary.cartTotal) },
              { icon: 'award' as const, label: 'Loyalty Points', value: '2,450 pts' },
              { icon: 'truck' as const, label: 'Active Shipments', value: String(orders.filter(o => ['processing', 'shipped', 'out_for_delivery'].includes(o.status)).length) },
            ].map((row) => (
              <View
                key={row.label}
                className="flex-row items-center justify-between px-5 py-4 rounded-2xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
              >
                <View className="flex-row items-center gap-3">
                  <Feather name={row.icon} size={15} color="rgba(255,255,255,0.35)" />
                  <Text className="font-body text-[14px] text-white/60">{row.label}</Text>
                </View>
                <Text className="font-heading text-[17px] text-white">{row.value}</Text>
              </View>
            ))}
          </View>
        </View>
      }
    >
      {/* ── Metric Cards ── */}
      <View className="grid grid-cols-1 gap-2 md:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            accent={card.accent}
            sub={card.sub}
          />
        ))}
      </View>

      {/* ── Main Content ── */}
      <View className={isWide ? 'flex-row items-start gap-6' : 'gap-6'}>

        {/* Left: Orders */}
        <View className="flex-1 rounded-[32px] bg-white border border-stone-100 overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between px-8 py-6 border-b border-stone-100">
            <View>
              <Text className="font-heading text-[22px] text-stone-900">Recent Orders</Text>
              <Text className="font-body text-[13px] text-stone-400 mt-0.5">Latest activity on your account</Text>
            </View>
            <Pressable
              onPress={() => router.push('/orders' as any)}
              className="flex-row items-center gap-2 px-5 py-2.5 rounded-full bg-stone-100"
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <Text className="font-body text-[12px] font-bold text-stone-700">See all</Text>
              <Feather name="arrow-right" size={13} color="#57534E" />
            </Pressable>
          </View>

          {/* Body */}
          {orders.length === 0 ? (
            <View className="items-center px-8 py-16">
              <View className="items-center justify-center w-20 h-20 mb-6 rounded-full bg-stone-100">
                <Feather name="shopping-bag" size={30} color="#A8A29E" />
              </View>
              <Text className="font-heading text-[24px] text-stone-900 text-center mb-3">No orders yet</Text>
              <Text className="font-body text-[14px] text-stone-400 text-center leading-7 max-w-[280px] mb-8">
                Discover our handcrafted jewellery collections and place your first order.
              </Text>
              <Pressable
                onPress={() => router.push('/shop' as any)}
                className="py-4 rounded-full px-9 bg-stone-900"
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <Text className="font-body text-[13px] font-bold text-white uppercase tracking-[2px]">Shop now</Text>
              </Pressable>
            </View>
          ) : (
            orders.map((order, i) => (
              <Pressable
                key={order._id}
                onPress={() => router.push(`/order-tracking?orderNumber=${order.orderNumber}` as any)}
                className={`flex-row items-center justify-between px-8 py-5 ${i < orders.length - 1 ? 'border-b border-stone-50' : ''}`}
                style={({ pressed }) => [{ backgroundColor: pressed ? '#FAFAF9' : 'transparent' }]}
              >
                <View className="flex-row items-center flex-1 gap-4">
                  <View className="items-center justify-center w-12 h-12 rounded-2xl bg-stone-100">
                    <Feather name="package" size={19} color="#78716C" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-body text-[11px] text-stone-400 uppercase tracking-[2px]">#{order.orderNumber}</Text>
                    <Text className="font-heading text-[19px] text-stone-900">{formatCurrency(Number(order.total || 0))}</Text>
                    <Text className="font-body text-[12px] text-stone-400">{formatDate(order.createdAt)}</Text>
                  </View>
                </View>
                <View className="items-end gap-1.5">
                  <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: `${toneFor(order.status)}15` }}>
                    <Text className="font-body text-[11px] font-semibold capitalize" style={{ color: toneFor(order.status) }}>
                      {formatStatusLabel(order.status)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Text className="font-body text-[11px] text-stone-400">Track</Text>
                    <Feather name="chevron-right" size={12} color="#A8A29E" />
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* Right Column */}
        <View className={` ${isWide ? 'w-[360px]' : ''} gap-6`}>

          {/* Support */}
          <View className="rounded-[32px] bg-white border border-stone-100 overflow-hidden">
            <View className="flex-row items-center justify-between py-6 border-b px-7 border-stone-100">
              <View>
                <Text className="font-heading text-[20px] text-stone-900">Support</Text>
                <Text className="font-body text-[12px] text-stone-400 mt-0.5">Your active tickets</Text>
              </View>
              {summary.openTicketCount > 0 && (
                <View className="px-3 py-1 rounded-full bg-amber-100">
                  <Text className="font-body text-[11px] font-bold text-amber-700">{summary.openTicketCount} open</Text>
                </View>
              )}
            </View>
            {tickets.length === 0 ? (
              <View className="items-center py-10 px-7">
                <View className="items-center justify-center mb-4 w-14 h-14 rounded-2xl bg-stone-100">
                  <Feather name="message-square" size={22} color="#A8A29E" />
                </View>
                <Text className="font-heading text-[18px] text-stone-900 text-center mb-2">All clear</Text>
                <Text className="font-body text-[13px] text-stone-400 text-center leading-6 max-w-[220px]">
                  No active support tickets. We're here if you need us.
                </Text>
                <Pressable
                  onPress={() => router.push('/support-tickets' as any)}
                  className="py-3 mt-6 border rounded-full px-7 border-stone-200"
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                  <Text className="font-body text-[13px] font-bold text-stone-700">Open a ticket</Text>
                </Pressable>
              </View>
            ) : (
              tickets.map((ticket, i) => (
                <Pressable
                  key={ticket._id}
                  onPress={() => router.push('/support-tickets' as any)}
                  className={`px-7 py-5 ${i < tickets.length - 1 ? 'border-b border-stone-50' : ''}`}
                  style={({ pressed }) => [{ backgroundColor: pressed ? '#FAFAF9' : 'transparent' }]}
                >
                  <View className="flex-row items-start justify-between gap-4">
                    <View className="flex-1">
                      <Text className="font-body text-[10px] text-stone-400 uppercase tracking-[2px]">{ticket.ticketNumber}</Text>
                      <Text className="font-heading text-[17px] text-stone-900 mt-1">{ticket.subject}</Text>
                    </View>
                    <View className="px-2.5 py-1 rounded-full mt-1" style={{ backgroundColor: `${toneFor(ticket.status)}15` }}>
                      <Text className="font-body text-[10px] font-bold capitalize" style={{ color: toneFor(ticket.status) }}>
                        {String(ticket.status).replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>

          {/* Delivery Address */}
          <View className="rounded-[32px] overflow-hidden" style={{ backgroundColor: '#0C0A09' }}>
            <View className="py-6 border-b px-7" style={{ borderBottomColor: 'rgba(255,255,255,0.07)' }}>
              <View className="flex-row items-center justify-between">
                <Text className="font-heading text-[20px] text-white">Delivery Address</Text>
                <View className="items-center justify-center w-9 h-9 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <Feather name="map-pin" size={16} color="#78716C" />
                </View>
              </View>
            </View>
            <View className="py-6 px-7">
              {defaultAddress ? (
                <View className="gap-1 mb-6">
                  <Text className="font-heading text-[18px] text-white">{defaultAddress.fullName || user?.name}</Text>
                  <Text className="font-body text-[14px] text-stone-500 leading-6">{defaultAddress.addressLine1}</Text>
                  <Text className="font-body text-[14px] text-stone-500">
                    {[defaultAddress.city, defaultAddress.state, defaultAddress.zipCode].filter(Boolean).join(', ')}
                  </Text>
                </View>
              ) : (
                <View className="mb-6">
                  <Text className="font-heading text-[18px] text-white mb-2">No address saved</Text>
                  <Text className="font-body text-[13px] text-stone-600 leading-6">
                    Add a delivery address to your profile to speed up checkout.
                  </Text>
                </View>
              )}
              <Pressable
                onPress={() => router.push('/profile' as any)}
                className="self-start py-3 bg-white rounded-full px-7"
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <Text className="font-body text-[13px] font-bold text-stone-900">
                  {defaultAddress ? 'Edit address' : 'Add address'}
                </Text>
              </Pressable>
            </View>
          </View>

        </View>
      </View>
    </CustomerPageFrame>
  );
}