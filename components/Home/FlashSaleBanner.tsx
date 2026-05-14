import { useCurrency } from '@/context/CurrencyContext';
import { getAssetUrl, getProducts } from '@/services/api';
import { formatConvertedPrice } from '@/utils/currency';
import { router } from 'expo-router';
import { Check, ShoppingCart, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

const COLORS = {
    background: '#D0B9A7',
    lightBackground: '#B5A192',
    secondaryBackground: '#B9937B',
    darkColor: '#714329',
    lightColor: '#B08463',
    textPrimary: '#1C1C1C',
    textSecondary: '#6B6B6B',
    border: '#E5E5E5',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80';

const Icons = {
    ArrowRight: ({ size = 18, className = '' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
    ),
    ArrowLeft: ({ size = 18, className = '' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
    ),
    Check: ({ size = 18 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
    ),
    ChevronRight: ({ size = 18, className = '' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 18l6-6-6-6" /></svg>
    ),
    Clock: ({ size = 14 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    ),
    Package: ({ size = 10 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></svg>
    ),
    ShoppingCart: ({ size = 18 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" /></svg>
    ),
    Truck: ({ size = 14 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 00-2-2H4a2 2 0 00-2 2v11a1 1 0 001 1h2M15 18H9" /><path d="M19 18h2a1 1 0 001-1v-5l-4-4h-3v10a2 2 0 002 2z" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
    ),
    Zap: ({ size = 14, fill = 'none' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
    ),
};

type ApiProduct = {
    _id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    currency?: string;
    thumbnailImage?: string;
    images?: string[];
    quantity?: number;
    averageRating?: number;
    reviewCount?: number;
    category?: { name?: string; slug?: string } | string | null;
    isFeatured?: boolean;
    discountPercent?: number;
};

type SaleProduct = {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    stock: number;
    maxStock: number;
    discount: number;
    tag: string;
    rating: number;
    reviewCount: number;
    currency: string;
};

type DigitBlockProps = {
    value: number;
    label: string;
};

type ProductCardProps = {
    item: SaleProduct;
    index: number;
    isActive: boolean;
    cardWidth: number;
};

type SwiperProps = {
    items: SaleProduct[];
};

const getDisplayPrice = (product: ApiProduct) => (
    typeof product.salePrice === 'number' && product.salePrice > 0 && product.salePrice < product.price
        ? product.salePrice
        : product.price
);

const getDiscountPercent = (product: ApiProduct) => {
    if (typeof product.discountPercent === 'number' && product.discountPercent > 0) {
        return product.discountPercent;
    }

    const displayPrice = getDisplayPrice(product);
    if (!product.price || displayPrice >= product.price) {
        return 0;
    }

    return Math.round(((product.price - displayPrice) / product.price) * 100);
};

const getTag = (product: ApiProduct, index: number) => {
    const stock = Number(product.quantity || 0);
    if (index === 0) return 'Bestseller';
    if (stock > 0 && stock <= 5) return 'Almost Gone';
    if (product.isFeatured) return 'Limited Edition';
    if (getDiscountPercent(product) >= 40) return 'Trending';
    return 'Popular';
};

const toSaleProduct = (product: ApiProduct, index: number): SaleProduct => {
    const currentPrice = getDisplayPrice(product);
    const stock = Math.max(0, Number(product.quantity || 0));
    return {
        id: product._id,
        name: product.name,
        price: Number(currentPrice.toFixed(2)),
        originalPrice: Number(product.price.toFixed(2)),
        image: getAssetUrl(product.thumbnailImage || product.images?.[0]) || FALLBACK_IMAGE,
        stock,
        maxStock: Math.max(20, stock),
        discount: getDiscountPercent(product),
        tag: getTag(product, index),
        rating: Number(product.averageRating || 4.8),
        reviewCount: Number(product.reviewCount || 0),
        currency: product.currency || 'USD',
    };
};

// ─── Digit Block ─────────────────────────────────────────────────────────────
const DigitBlock = ({ value, label }: DigitBlockProps) => {
    const [prevVal, setPrevVal] = useState(value);
    const [flipping, setFlipping] = useState(false);

    useEffect(() => {
        if (value !== prevVal) {
            setFlipping(true);
            const t = setTimeout(() => { setFlipping(false); setPrevVal(value); }, 350);
            return () => clearTimeout(t);
        }
    }, [prevVal, value]);

    const str = String(value).padStart(2, '0');

    return (
        <div className="flex flex-col items-center">
            <div className="relative min-w-[72px] h-20 rounded-[14px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#B5A192] to-[#9e8473] border border-white/25 before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/4 before:via-transparent before:to-black/6 before:pointer-events-none after:absolute after:top-1/2 after:left-0 after:right-0 after:h-px after:bg-black/12 after:z-[2]">
                <span className={`text-4xl font-black tracking-tight text-[#714329] font-playfair relative z-[3] ${flipping ? 'animate-[digitFlip_0.35s_ease]' : ''}`} style={{ letterSpacing: '-0.03em' }}>
                    {str}
                </span>
            </div>
            <span className="mt-1.5 text-xs font-bold tracking-widest uppercase text-[#6B6B6B]">
                {label}
            </span>
        </div>
    );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ item, index, isActive, cardWidth }: ProductCardProps) => {
    const { currency } = useCurrency();
    const [inCart, setInCart] = useState(false);
    const [visible, setVisible] = useState(false);
    const stockPct = Math.max(8, (item.stock / item.maxStock) * 100);
    const isLow = item.stock <= 5;

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), index * 80 + 400);
        return () => clearTimeout(t);
    }, [index]);

    return (
        <div
            className={`flex-shrink-0 flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 transition-all duration-500 select-none ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{
                width: cardWidth,
                transform: visible
                    ? `translateY(0) scale(${isActive ? 1.02 : 1})`
                    : 'translateY(32px)',
            }}>
            <div className="relative overflow-hidden h-60 bg-slate-100">
                <img
                    src={item.image}
                    alt={item.name}
                    draggable={false}
                    className="object-cover w-full h-full transition-transform duration-700 ease-out hover:scale-105"
                />

                <div className="absolute top-3.5 left-3.5 bg-[#714329] text-white px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 transition-all duration-500"
                    style={{ transform: visible ? 'scale(1)' : 'scale(0)', opacity: visible ? 1 : 0, transitionDelay: `${index * 80 + 600}ms` }}>
                    <Zap size={10} fill="currentColor" /> -{item.discount}%
                </div>

                <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-lg text-[#714329] px-2.5 py-1 rounded-full text-[9px] font-black tracking-[0.12em] uppercase">
                    {item.tag}
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end h-24 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="flex items-end justify-between mb-2">
                        <div>
                            <p className="text-[11px] font-black text-white/90 uppercase tracking-[0.15em] mb-1">
                                Availability
                            </p>
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl font-black ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {item.stock}
                                </span>
                                <span className="text-xs font-semibold text-white/70">
                                    in stock
                                </span>
                            </div>
                        </div>
                        <div className={`text-right ${isLow ? 'animate-pulse' : ''}`}>
                            <div className="text-[10px] font-black uppercase tracking-wider mb-1 px-2.5 py-1 rounded-full"
                                style={{ background: isLow ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.2)' }}>
                                <span className={isLow ? 'text-red-300' : 'text-emerald-300'}>
                                    {isLow ? '⚡ Hurry!' : '✓ Ready'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="h-1.5 rounded-full bg-white/20 overflow-hidden backdrop-blur-sm border border-white/10">
                            <div className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-gradient-to-r from-orange-400 via-red-500 to-red-600' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                                style={{ width: `${visible ? stockPct : 0}%`, transitionDelay: `${index * 80 + 800}ms` }} />
                        </div>
                        <p className="text-[9px] text-white/60 font-semibold uppercase tracking-wider">
                            {stockPct.toFixed(0)}% stock remaining
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-1 p-5">
                <h3 className="text-lg font-bold mb-2 leading-snug min-h-[2.8rem] text-[#1C1C1C] font-playfair line-clamp-2">
                    {item.name}
                </h3>

                <div className="flex items-end gap-3 mb-6">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-[#714329] font-playfair tracking-tight leading-none">
                            {formatConvertedPrice(item.price, currency)}
                        </span>
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">
                            Best Price
                        </span>
                    </div>

                    <span className="text-sm line-through opacity-50 text-[#6B6B6B] font-playfair mb-5">
                        {formatConvertedPrice(item.originalPrice, currency)}
                    </span>

                    <div className="flex flex-col items-end ml-auto">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-black tracking-wide">
                            Save {formatConvertedPrice(item.originalPrice - item.price, currency)}
                        </div>
                        <span className="text-[10px] font-bold text-green-700 mt-1 uppercase tracking-widest opacity-70">
                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-base transition-transform hover:scale-110 ${i < Math.round(item.rating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                            ))}
                        </div>
                        <span className="text-xs text-[#6B6B6B] font-semibold">({item.reviewCount} reviews)</span>
                    </div>
                </div>

                <button onClick={() => setInCart(!inCart)}
                    className={`mt-auto w-full py-3.5 px-4 rounded-xl border-2 font-black text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${inCart ? 'bg-green-50 text-green-600 border-green-500/30' : 'bg-white text-[#714329] border-[#714329]/20 hover:border-[#714329]'}`}
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#B08463]/0 via-[#714329]/5 to-[#714329]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center justify-center gap-2">
                        {inCart ? <Check size={16} strokeWidth={3} /> : <ShoppingCart size={16} strokeWidth={2.5} />}
                        {inCart ? 'Added to Bag' : 'Reserve Deal'}
                    </span>
                </button>
            </div>
        </div>
    );
};

// ─── Swiper ───────────────────────────────────────────────────────────────────
const Swiper = ({ items }: SwiperProps) => {
    const [current, setCurrent] = useState(0);
    const [dragStart, setDragStart] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const VISIBLE_CARDS = 4;
    const GAP = 28;
    const cardWidth = containerWidth > 0
        ? (containerWidth - GAP * (VISIBLE_CARDS - 1)) / VISIBLE_CARDS
        : 0;
    const STEP = cardWidth + GAP;
    const max = Math.max(0, items.length - VISIBLE_CARDS);

    const clamp = (value: number) => Math.max(0, Math.min(value, max));
    const goTo = useCallback((idx: number) => { setCurrent(clamp(idx)); setDragOffset(0); }, [max]);

    useEffect(() => {
        if (!viewportRef.current) return;

        const updateWidth = () => {
            if (!viewportRef.current) return;
            setContainerWidth(viewportRef.current.clientWidth);
        };

        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        observer.observe(viewportRef.current);

        return () => observer.disconnect();
    }, []);

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setDragStart(e.clientX);
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || dragStart === null) return;
        setDragOffset(e.clientX - dragStart);
    };
    const onPointerUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (dragOffset < -60) goTo(current + 1);
        else if (dragOffset > 60) goTo(current - 1);
        else setDragOffset(0);
        setDragStart(null);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goTo(current + 1);
            if (e.key === 'ArrowLeft') goTo(current - 1);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [current, goTo]);

    const translateX = STEP > 0 ? -(current * STEP) + dragOffset : 0;

    return (
        <div className="relative">
            <div ref={viewportRef} className="overflow-hidden mx-[-8px] px-2 py-4 pb-6">
                <div ref={trackRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
                    className={`flex gap-6 transition-transform duration-550 will-change-transform ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={{
                        transform: `translateX(${translateX}px)`,
                        transition: isDragging ? 'none' : 'transform 0.55s cubic-bezier(0.23,1,0.32,1)',
                    }}
                >
                    {items.map((item, i) => (
                        <ProductCard key={item.id} item={item} index={i} isActive={i === current} cardWidth={cardWidth} />
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                    {Array.from({ length: max + 1 }, (_, i) => (
                        <button key={i} onClick={() => goTo(i)}
                            className={`h-2 rounded-full border-none cursor-pointer transition-all duration-400 ${i === current ? 'w-7 bg-[#714329]' : 'w-2 bg-[#B5A192]'}`}
                            style={{ transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}
                        />
                    ))}
                </div>

                <div className="flex gap-2.5">
                    <button onClick={() => goTo(current - 1)} disabled={current === 0}
                        className={`w-11 h-11 rounded-full border-[1.5px] flex items-center justify-center transition-all cubic-bezier(0.34,1.56,0.64,1) ${current === 0 ? 'border-[#E5E5E5] bg-white/30 text-[#6B6B6B] opacity-45 cursor-not-allowed' : 'border-[#714329] bg-[#714329] text-white cursor-pointer hover:scale-110'}`}
                    >
                        <Icons.ArrowLeft size={16} />
                    </button>
                    <button onClick={() => goTo(current + 1)} disabled={current === max}
                        className={`w-11 h-11 rounded-full border-[1.5px] flex items-center justify-center transition-all cubic-bezier(0.34,1.56,0.64,1) ${current === max ? 'border-[#E5E5E5] bg-white/30 text-[#6B6B6B] opacity-45 cursor-not-allowed' : 'border-[#714329] bg-[#714329] text-white cursor-pointer hover:scale-110'}`}
                    >
                        <Icons.ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function FlashSaleBanner() {

    const [timeLeft, setTimeLeft] = useState(14 * 3600 + 37 * 60 + 52);
    const [headerVisible, setHeaderVisible] = useState(false);
    const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
        const t = setTimeout(() => setHeaderVisible(true), 80);
        return () => { clearInterval(timer); clearTimeout(t); };
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadFlashSaleProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getProducts({
                    onSale: 'true',
                    inStock: 'true',
                    sort: 'discount_desc',
                    page: 1,
                    limit: 6,
                });

                const list = Array.isArray(response.data?.products)
                    ? response.data.products
                    : Array.isArray(response.data)
                        ? response.data
                        : [];

                if (!mounted) {
                    return;
                }

                const connectedProducts = list
                    .filter((product: ApiProduct) => product && product._id && Number(product.price || 0) > 0 && getDiscountPercent(product) > 0)
                    .map((product: ApiProduct, index: number) => toSaleProduct(product, index));

                setSaleProducts(connectedProducts);
            } catch (fetchError: any) {
                if (!mounted) {
                    return;
                }

                setSaleProducts([]);
                setError(fetchError?.response?.data?.message || fetchError?.message || 'Failed to load flash sale products');
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadFlashSaleProducts();

        return () => {
            mounted = false;
        };
    }, []);

    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;

    const headlineImage = useMemo(() => saleProducts[0]?.image || FALLBACK_IMAGE, [saleProducts]);

    return (
        <div className="relative bg-[#fbf7f3] rounded-[32px] overflow-hidden">
            <div className="max-w-[1300px] mx-auto px-8 relative z-[1] pb-10">
                <header className={`pt-16 pb-10 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '3rem' }}>
                        <div className="flex flex-col flex-1 py-10">
                            <h1 className="text-5xl font-black tracking-tight text-[#1C1C1C] mb-6 font-serif leading-snug animate-[fadeUp_0.6s_ease_0.3s_both]">
                                Weekend{' '} <em style={{ color: COLORS.darkColor, fontStyle: 'italic' }}>Craft</em> <br />Curated Flash Sale
                            </h1>

                            <p className="text-base leading-7 text-[#1C1C1C] opacity-72 mb-6 font-serif font-medium max-w-xl">
                                Handpicked artisanal jewelry pieces from your live catalog, available at special prices for a short time only.
                            </p>

                            <View className="flex-row flex-wrap gap-5">
                                {[
                                    { icon: <Icons.Clock size={13} />, label: '24 Hours Only' },
                                    { icon: <Icons.Truck size={13} />, label: 'Live Discounted Products' },
                                ].map((chip) => (
                                    <View key={chip.label} className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/30 border border-[#E5E5E5]">
                                        {chip.icon}
                                        <Text className="text-xs font-bold text-[#714329]">
                                            {chip.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </div>

                        <div className="flex flex-col items-center rounded-[28px] bg-white/18 backdrop-blur-[16px] border p-10 border-white/45 animate-[timerIn_0.8s_cubic-bezier(0.23,1,0.32,1)_0.3s_both]">
                            <span className="text-xs font-black tracking-widest uppercase text-[#6B6B6B] mb-6">
                                Sale Event Concludes In
                            </span>
                            <div className="flex items-center gap-3">
                                <DigitBlock value={h} label="Hours" />
                                <span className="text-4xl font-black text-[#714329] mb-6 animate-[blink_1s_step-end_infinite] font-serif">:</span>
                                <DigitBlock value={m} label="Minutes" />
                                <span className="text-4xl font-black text-[#714329] mb-6 animate-[blink_1s_step-end_infinite] font-serif">:</span>
                                <DigitBlock value={s} label="Seconds" />
                            </div>

                            <Pressable onPress={() => router.push('/deals')} className="flex-row items-center gap-1.5 mt-16">
                                {({ hovered }) => (
                                    <>
                                        <Text className={`text-sm font-bold font-serif ${hovered ? 'text-black' : 'text-[#714329]'}`}>
                                            View Full Collection
                                        </Text>
                                        <div style={{ color: hovered ? '#000' : '#714329' }}>
                                            <Icons.ChevronRight size={16} />
                                        </div>
                                    </>
                                )}
                            </Pressable>
                        </div>
                    </div>
                </header>

                <div style={{ animation: 'fadeUp 0.7s ease 0.9s both' }}>
                    {loading ? (
                        <div className="flex items-center justify-center rounded-[28px] bg-white/25 border border-white/45 py-20">
                            <ActivityIndicator size="small" color={COLORS.darkColor} />
                            <Text className="ml-3 text-sm font-bold text-[#714329]">Loading live flash sale products...</Text>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center rounded-[28px] bg-white/25 border border-white/45 py-20 px-8">
                            <Text className="text-sm font-bold text-[#714329] text-center">{error}</Text>
                        </div>
                    ) : saleProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[28px] bg-white/25 border border-white/45 py-20 px-8">
                            <Text className="text-sm font-bold text-[#714329] text-center">No discounted products are active right now.</Text>
                        </div>
                    ) : (
                        <Swiper items={saleProducts} />
                    )}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');

                @keyframes blob1 {
                    0%,100% { transform: translate(0,0) scale(1); }
                    50%      { transform: translate(-30px,25px) scale(1.08); }
                }
                @keyframes blob2 {
                    0%,100% { transform: translate(0,0) scale(1); }
                    50%      { transform: translate(20px,-20px) scale(1.06); }
                }
                @keyframes blink {
                    0%,100% { opacity: 1; }
                    50%      { opacity: 0.2; }
                }
                @keyframes pulse {
                    0%,100% { box-shadow: 0 0 0 0 rgba(113,67,41,0.25); }
                    50%      { box-shadow: 0 0 0 6px rgba(113,67,41,0); }
                }
                @keyframes digitFlip {
                    0%   { transform: rotateX(0deg); }
                    50%  { transform: rotateX(-90deg); }
                    100% { transform: rotateX(0deg); }
                }
                @keyframes badgePop {
                    from { transform: scale(0) rotate(-8deg); opacity: 0; }
                    to   { transform: scale(1) rotate(0deg);  opacity: 1; }
                }
                @keyframes timerIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                * { box-sizing: border-box; }
            `}</style>
        </div>
    );
}