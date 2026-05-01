import CustomerPageFrame from '@/components/Customer/CustomerPageFrame';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { getCustomerOverview } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
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
  dark: '#714329',
  light: '#B08463',
  secondary: '#B9937B',
  text: '#1C1C1C',
  muted: '#6B6B6B',
  border: '#E5E5E5',
  paper: '#FFFAF5',
  shell: '#F7EFE7',
  chip: '#F4E8DA',
  deep: '#3C2417',
};

const statusTone: Record<string, string> = {
  awaiting_payment: '#2563EB',
  payment_failed: '#DC2626',
  pending: '#D97706',
  confirmed: '#2563EB',
  processing: '#7C3AED',
  shipped: '#C1622F',
  out_for_delivery: '#EA580C',
  delivered: '#15803D',
  cancelled: '#B91C1C',
  returned: '#6B7280',
  open: '#D97706',
  in_progress: '#2563EB',
  pending_customer: '#C1622F',
  resolved: '#15803D',
  closed: '#6B7280',
};

const customerCapabilities = [
  {
    icon: 'shopping-bag' as const,
    title: 'Order visibility',
    description: 'Track purchases, payment state, shipping progress, and delivery confirmation from one place.',
  },
  {
    icon: 'heart' as const,
    title: 'Wishlist memory',
    description: 'Keep a personal list of saved pieces and move them back into your bag when the time feels right.',
  },
  {
    icon: 'map-pin' as const,
    title: 'Address control',
    description: 'Maintain delivery addresses and keep one default destination ready for quick checkout.',
  },
  {
    icon: 'message-circle' as const,
    title: 'Support continuity',
    description: 'Open tickets, monitor replies, and keep every order-related conversation attached to your account.',
  },
];

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

function MetricCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View className="min-w-[160px] flex-1 rounded-[28px] border bg-white/85 p-5" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="font-body text-[11px] font-semibold uppercase tracking-[1.8px]" style={{ color: PALETTE.light }}>{label}</Text>
          <Text className="mt-4 font-heading text-[30px]" style={{ color: PALETTE.text }}>{value}</Text>
        </View>
        <View className="items-center justify-center h-11 w-11 rounded-2xl" style={{ backgroundColor: `${accent}18` }}>
          <Feather name={icon} size={18} color={accent} />
        </View>
      </View>
    </View>
  );
}

function ActionTile({
  icon,
  title,
  description,
  onPress,
  compact,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  compact: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`${compact ? 'w-full' : 'min-w-[220px] flex-1'} rounded-[26px] border p-5`}
      style={({ pressed }) => [
        { opacity: pressed ? 0.9 : 1 },
        { transform: [{ scale: pressed ? 0.985 : 1 }] },
        { borderColor: '#EAD7C3', backgroundColor: PALETTE.paper },
      ]}
    >
      <View className="items-center justify-center w-12 h-12 rounded-2xl" style={{ backgroundColor: PALETTE.chip }}>
        <Feather name={icon} size={20} color={PALETTE.dark} />
      </View>
      <Text className="mt-4 font-heading text-[21px]" style={{ color: PALETTE.text }}>{title}</Text>
      <Text className="mt-2 font-body text-[13px] leading-6" style={{ color: PALETTE.muted }}>{description}</Text>
    </Pressable>
  );
}

function SectionShell({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  return (
    <View className="rounded-[32px] border bg-white p-6" style={{ borderColor: '#EAD7C3' }}>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="font-heading text-[28px]" style={{ color: PALETTE.text }}>{title}</Text>
          <Text className="mt-2 max-w-[640px] font-body text-[13px] leading-6" style={{ color: PALETTE.muted }}>{subtitle}</Text>
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} className="px-4 py-2 rounded-full" style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }, { backgroundColor: '#F6ECDF' }]}>
            <Text className="font-body text-[12px] font-semibold" style={{ color: PALETTE.dark }}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <View className="mt-5">{children}</View>
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

  const isCompact = width < 860;
  const isWide = width >= 1180;

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
    { icon: 'shopping-bag' as const, label: 'Orders', value: String(summary.orderCount), accent: '#714329' },
    { icon: 'check-circle' as const, label: 'Delivered', value: String(summary.deliveredOrderCount), accent: '#15803D' },
    { icon: 'heart' as const, label: 'Wishlist', value: String(summary.wishlistCount), accent: '#C1622F' },
    { icon: 'shopping-cart' as const, label: 'Bag', value: String(summary.cartLineCount), accent: '#2563EB' },
  ];

  const quickActions = [
    {
      icon: 'package' as const,
      title: 'Track orders',
      description: 'Open your recent orders, follow delivery progress, and revisit payment details.',
      onPress: () => router.push('/orders' as any),
    },
    {
      icon: 'user' as const,
      title: 'Profile and addresses',
      description: 'Update your profile, phone number, saved addresses, and checkout defaults.',
      onPress: () => router.push('/profile' as any),
    },
    {
      icon: 'heart' as const,
      title: 'Wishlist',
      description: 'Return to favorite pieces and move them into your bag when you are ready.',
      onPress: () => router.push('/wishlist' as any),
    },
    {
      icon: 'message-circle' as const,
      title: 'Support center',
      description: 'Continue existing tickets or start a new conversation with the support team.',
      onPress: () => router.push('/support-tickets' as any),
    },
  ];

  if (auth.shouldBlock) {
    return (
      <View className="items-center justify-center flex-1" style={{ backgroundColor: PALETTE.shell }}>
        <ActivityIndicator size="large" color={PALETTE.dark} />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="items-center justify-center flex-1" style={{ backgroundColor: PALETTE.shell }}>
        <ActivityIndicator size="large" color={PALETTE.dark} />
        <Text className="mt-4 font-body text-[14px]" style={{ color: PALETTE.muted }}>Preparing your customer dashboard...</Text>
      </View>
    );
  }

  return (
    <CustomerPageFrame
      scrollY={scrollY}
      onScroll={onScroll}
      eyebrow="HandCraft Client Atelier"
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Collector'}.`}
      subtitle="Your customer dashboard acts like a private showroom: orders, support, saved pieces, addresses, and checkout progress are all gathered into one warm, responsive workspace."
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadDashboard();
          }}
          tintColor={PALETTE.dark}
        />
      }
      actions={
        <>
          <Pressable onPress={() => router.push('/shop' as any)} className="px-5 py-3 rounded-full" style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, { backgroundColor: '#FFFFFF' }]}>
            <Text className="font-body text-[14px] font-semibold" style={{ color: PALETTE.text }}>Browse new pieces</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/orders' as any)} className="px-5 py-3 border rounded-full" style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, { borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Text className="font-body text-[14px] font-semibold text-white">Review my orders</Text>
          </Pressable>
        </>
      }
      heroAside={
        <View className="rounded-[30px] border p-5" style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <Text className="font-body text-[11px] uppercase tracking-[1.8px]" style={{ color: '#F1DAC5' }}>Profile snapshot</Text>
          <Text className="mt-3 font-heading text-[24px] text-white">{user?.email || 'Customer account'}</Text>
          <View className="gap-3 mt-5">
            <View className="flex-row items-center justify-between px-4 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>Phone</Text>
              <Text className="font-body text-[13px] font-semibold text-white">{profilePhone || 'Add to profile'}</Text>
            </View>
            <View className="flex-row items-center justify-between px-4 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>Default address</Text>
              <Text className="max-w-[180px] text-right font-body text-[13px] font-semibold text-white">
                {defaultAddress?.city ? `${defaultAddress.city}${defaultAddress.state ? `, ${defaultAddress.state}` : ''}` : 'Set delivery address'}
              </Text>
            </View>
            <View className="flex-row items-center justify-between px-4 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>Bag total</Text>
              <Text className="font-body text-[13px] font-semibold text-white">{formatCurrency(summary.cartTotal)}</Text>
            </View>
          </View>
        </View>
      }
    >
      <View className="flex-row flex-wrap gap-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} icon={card.icon} label={card.label} value={card.value} accent={card.accent} />
        ))}
      </View>

      <View className="gap-6">
        <SectionShell
          title="Customer command center"
          subtitle="Everything after login should feel immediate: account controls, saved products, order updates, support, and a direct path back into shopping or checkout."
          actionLabel="Manage account"
          onAction={() => router.push('/profile' as any)}
        >
          <View className="flex-row flex-wrap gap-4">
            {quickActions.map((action) => (
              <ActionTile
                key={action.title}
                icon={action.icon}
                title={action.title}
                description={action.description}
                onPress={action.onPress}
                compact={isCompact}
              />
            ))}
          </View>
        </SectionShell>

        <View className={`${isWide ? 'flex-row items-start gap-6' : 'gap-6'}`}>
          <SectionShell
            title="Recent orders"
            subtitle="Your latest jewellery purchases, payment state, and shipment status stay visible here for quick follow-up."
            actionLabel="See all"
            onAction={() => router.push('/orders' as any)}
          >
            <View className="gap-4">
              {orders.length === 0 ? (
                <View className="rounded-[24px] p-5" style={{ backgroundColor: '#F8EFE6' }}>
                  <Text className="font-heading text-[21px]" style={{ color: PALETTE.text }}>No orders yet</Text>
                  <Text className="mt-2 font-body text-[14px] leading-6" style={{ color: PALETTE.muted }}>
                    Explore handcrafted collections, then return here for payment updates, shipping milestones, and delivery confirmation.
                  </Text>
                </View>
              ) : (
                orders.map((order) => (
                  <Pressable
                    key={order._id}
                    onPress={() => router.push(`/order-tracking?orderNumber=${order.orderNumber}` as any)}
                    className="rounded-[26px] border p-5"
                    style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, { borderColor: '#F0DFCE', backgroundColor: PALETTE.paper }]}
                  >
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1">
                        <Text className="font-body text-[12px] uppercase tracking-[1.2px]" style={{ color: '#A16D52' }}>{order.orderNumber}</Text>
                        <Text className="mt-2 font-heading text-[24px]" style={{ color: PALETTE.text }}>{formatCurrency(Number(order.total || 0))}</Text>
                        <Text className="mt-1 font-body text-[13px]" style={{ color: PALETTE.muted }}>Placed {formatDate(order.createdAt)}</Text>
                        <Text className="mt-3 font-body text-[13px] leading-6" style={{ color: '#6F5A4F' }}>
                          {(order.items || []).slice(0, 2).map((item) => `${item.name || 'Item'} x${item.quantity || 1}`).join(' • ') || 'Jewellery order'}
                        </Text>
                      </View>
                      <View className="px-3 py-2 rounded-full" style={{ backgroundColor: `${toneFor(order.status)}15` }}>
                        <Text className="font-body text-[12px] font-semibold capitalize" style={{ color: toneFor(order.status) }}>
                          {String(order.status).replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </SectionShell>

          <View className={`${isWide ? 'w-[390px]' : ''} gap-6`}>
            <SectionShell
              title="Support pulse"
              subtitle="Stay on top of active tickets and keep service conversations close to your purchases."
              actionLabel={`${summary.openTicketCount} open`}
              onAction={() => router.push('/support-tickets' as any)}
            >
              <View className="gap-3">
                {tickets.length === 0 ? (
                  <View className="rounded-[24px] p-5" style={{ backgroundColor: '#F8EFE6' }}>
                    <Text className="font-heading text-[20px]" style={{ color: PALETTE.text }}>No active tickets</Text>
                    <Text className="mt-2 font-body text-[13px] leading-6" style={{ color: PALETTE.muted }}>
                      If you need help with sizing, delivery, payments, or returns, your support history will appear here.
                    </Text>
                  </View>
                ) : (
                  tickets.map((ticket) => (
                    <Pressable
                      key={ticket._id}
                      onPress={() => router.push('/support-tickets' as any)}
                      className="rounded-[22px] border p-4"
                      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, { borderColor: '#F0DFCE', backgroundColor: PALETTE.paper }]}
                    >
                      <Text className="font-body text-[12px] uppercase tracking-[1.2px]" style={{ color: '#A16D52' }}>{ticket.ticketNumber}</Text>
                      <Text className="mt-2 font-heading text-[19px]" style={{ color: PALETTE.text }}>{ticket.subject}</Text>
                      <View className="flex-row items-center justify-between mt-3">
                        <Text className="font-body text-[12px] capitalize" style={{ color: PALETTE.muted }}>{String(ticket.priority || 'normal')}</Text>
                        <View className="px-3 py-2 rounded-full" style={{ backgroundColor: `${toneFor(ticket.status)}15` }}>
                          <Text className="font-body text-[12px] font-semibold capitalize" style={{ color: toneFor(ticket.status) }}>
                            {String(ticket.status).replace(/_/g, ' ')}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  ))
                )}
              </View>
            </SectionShell>

            <LinearGradient colors={[PALETTE.deep, PALETTE.dark, PALETTE.light]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 32, padding: 24 }}>
              <Text className="font-heading text-[25px] text-white">Primary delivery address</Text>
              <Text className="mt-2 font-body text-[13px] leading-6" style={{ color: '#F3E3D5' }}>
                Keep one trusted address ready so checkout remains fast on mobile, tablet, and desktop.
              </Text>

              <View className="mt-5 rounded-[24px] p-5" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                {defaultAddress ? (
                  <>
                    <Text className="font-heading text-[18px] text-white">{defaultAddress.label || 'Saved Address'}</Text>
                    <Text className="mt-3 font-body text-[14px] leading-6" style={{ color: '#F5E9DC' }}>{defaultAddress.fullName || user?.name || 'Customer'}</Text>
                    <Text className="font-body text-[14px] leading-6" style={{ color: '#F5E9DC' }}>{defaultAddress.addressLine1 || 'Add a street address in profile'}</Text>
                    <Text className="font-body text-[14px] leading-6" style={{ color: '#F5E9DC' }}>
                      {[defaultAddress.city, defaultAddress.state, defaultAddress.zipCode].filter(Boolean).join(', ') || 'Set your city, state, and ZIP code'}
                    </Text>
                  </>
                ) : (
                  <Text className="font-body text-[14px] leading-6" style={{ color: '#F5E9DC' }}>
                    No address saved yet. Add one from your profile to streamline delivery and checkout.
                  </Text>
                )}
              </View>

              <Pressable onPress={() => router.push('/profile' as any)} className="self-start px-5 py-3 mt-4 rounded-full" style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }, { backgroundColor: '#FFFFFF' }]}>
                <Text className="font-body text-[14px] font-semibold" style={{ color: PALETTE.text }}>Edit addresses</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </View>

        <SectionShell
          title="Why this customer page matters"
          subtitle="A handcrafted jewellery storefront should not drop customers into a generic account view. This dashboard keeps the emotional and practical parts of shopping connected after sign-in."
        >
          <View className="flex-row flex-wrap gap-4">
            {customerCapabilities.map((feature) => (
              <View key={feature.title} className={`${isCompact ? 'w-full' : 'min-w-[260px] flex-1'} rounded-[24px] p-5`} style={{ backgroundColor: PALETTE.paper }}>
                <View className="items-center justify-center w-12 h-12 rounded-2xl" style={{ backgroundColor: PALETTE.chip }}>
                  <Feather name={feature.icon} size={20} color={PALETTE.dark} />
                </View>
                <Text className="mt-4 font-heading text-[21px]" style={{ color: PALETTE.text }}>{feature.title}</Text>
                <Text className="mt-2 font-body text-[13px] leading-6" style={{ color: PALETTE.muted }}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </SectionShell>
      </View>
    </CustomerPageFrame>
  );
}