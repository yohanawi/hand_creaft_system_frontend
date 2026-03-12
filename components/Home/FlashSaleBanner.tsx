import React, { useEffect, useState, useRef, useCallback } from 'react';

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

const saleProducts = [
    {
        id: 1,
        name: 'Hand-Poured Soy Candles',
        price: 24.99,
        originalPrice: 39.99,
        image: 'https://images.unsplash.com/photo-1602178506049-3650c8d54985?w=600&q=80',
        stock: 8,
        maxStock: 20,
        discount: 38,
        tag: 'Bestseller',
    },
    {
        id: 2,
        name: 'Woven Basket Set',
        price: 44.99,
        originalPrice: 74.99,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        stock: 5,
        maxStock: 20,
        discount: 40,
        tag: 'Almost Gone',
    },
    {
        id: 3,
        name: 'Ceramic Plant Pots',
        price: 29.99,
        originalPrice: 49.99,
        image: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=600&q=80',
        stock: 12,
        maxStock: 20,
        discount: 40,
        tag: 'Popular',
    },
    {
        id: 4,
        name: 'Leather Card Wallet',
        price: 19.99,
        originalPrice: 34.99,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
        stock: 3,
        maxStock: 20,
        discount: 43,
        tag: 'Limited Edition',
    },
    {
        id: 5,
        name: 'Macramé Wall Hanging',
        price: 34.99,
        originalPrice: 59.99,
        image: 'https://images.unsplash.com/photo-1558618047-f4e80c5d22b5?w=600&q=80',
        stock: 6,
        maxStock: 20,
        discount: 42,
        tag: 'Trending',
    },
    {
        id: 6,
        name: 'Hand-thrown Mug Set',
        price: 38.99,
        originalPrice: 64.99,
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
        stock: 9,
        maxStock: 20,
        discount: 40,
        tag: 'New Arrival',
    },
];

// ─── Digit Block ─────────────────────────────────────────────────────────────
const DigitBlock = ({ value, label }) => {
    const [prevVal, setPrevVal] = useState(value);
    const [flipping, setFlipping] = useState(false);

    useEffect(() => {
        if (value !== prevVal) {
            setFlipping(true);
            const t = setTimeout(() => { setFlipping(false); setPrevVal(value); }, 350);
            return () => clearTimeout(t);
        }
    }, [value]);

    const str = String(value).padStart(2, '0');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
                position: 'relative',
                minWidth: '72px',
                height: '80px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: `linear-gradient(160deg, ${COLORS.lightBackground} 0%, #9e8473 100%)`,
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: '0 8px 24px rgba(113,67,41,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, transparent 50%, rgba(0,0,0,0.06) 100%)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', top: '50%', left: 0, right: 0,
                    height: '1px', background: 'rgba(0,0,0,0.12)', zIndex: 2,
                }} />
                <span style={{
                    fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em',
                    color: COLORS.darkColor, fontFamily: "'Playfair Display', serif",
                    position: 'relative', zIndex: 3,
                    animation: flipping ? 'digitFlip 0.35s ease' : 'none',
                }}>
                    {str}
                </span>
            </div>
            <span style={{
                marginTop: '6px', fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: COLORS.textSecondary, fontFamily: "'Cormorant Garamond', serif",
            }}>
                {label}
            </span>
        </div>
    );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ item, index, isActive }) => {
    const [inCart, setInCart] = useState(false);
    const [visible, setVisible] = useState(false);
    const stockPct = Math.max(8, (item.stock / item.maxStock) * 100);
    const isLow = item.stock <= 5;

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), index * 80 + 400);
        return () => clearTimeout(t);
    }, [index]);

    return (
        <div style={{
            flex: '0 0 320px',
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.52)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: isActive
                ? `0 32px 64px rgba(113,67,41,0.22), 0 0 0 2px ${COLORS.darkColor}22`
                : '0 8px 24px rgba(113,67,41,0.1)',
            transform: visible
                ? `translateY(0) scale(${isActive ? 1.02 : 1})`
                : 'translateY(32px)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.5s ease, box-shadow 0.4s ease',
            cursor: 'grab',
            userSelect: 'none',
        }}>
            {/* Image */}
            <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img
                    src={item.image}
                    alt={item.name}
                    draggable={false}
                    style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transition: 'transform 0.7s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                {/* Discount badge */}
                <div style={{
                    position: 'absolute', top: '14px', left: '14px',
                    background: COLORS.darkColor, color: '#fff',
                    padding: '4px 10px', borderRadius: '999px',
                    fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    boxShadow: '0 4px 12px rgba(113,67,41,0.4)',
                    animation: 'badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
                    animationDelay: `${index * 80 + 600}ms`,
                }}>
                    <Icons.Zap size={9} fill="currentColor" /> -{item.discount}%
                </div>
                {/* Tag */}
                <div style={{
                    position: 'absolute', top: '14px', right: '14px',
                    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                    color: COLORS.darkColor, padding: '4px 10px', borderRadius: '999px',
                    fontSize: '9px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                    {item.tag}
                </div>
                {/* Stock overlay */}
                <div style={{
                    position: 'absolute', bottom: '12px', left: '12px', right: '12px',
                    background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(10px)',
                    borderRadius: '12px', padding: '8px 12px',
                    border: '1px solid rgba(255,255,255,0.12)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icons.Package size={9} /> {isLow ? 'Almost gone!' : 'In Stock'}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#fff' }}>{item.stock} left</span>
                    </div>
                    <div style={{ height: '3px', borderRadius: '999px', background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: '999px',
                            width: `${stockPct}%`,
                            background: isLow
                                ? 'linear-gradient(90deg,#f87171,#ef4444)'
                                : `linear-gradient(90deg,${COLORS.lightColor},${COLORS.darkColor})`,
                            transition: 'width 1s cubic-bezier(0.23,1,0.32,1)',
                        }} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.4rem 1.5rem' }}>
                <h3 style={{
                    fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem',
                    lineHeight: 1.3, minHeight: '2.8rem', color: COLORS.textPrimary,
                    fontFamily: "'Playfair Display', serif",
                }}>
                    {item.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '1.2rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: COLORS.darkColor, fontFamily: "'Playfair Display', serif" }}>
                        ${item.price}
                    </span>
                    <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', opacity: 0.45, color: COLORS.textSecondary }}>
                        ${item.originalPrice}
                    </span>
                    <span style={{
                        marginLeft: 'auto', fontSize: '11px', fontWeight: 700,
                        color: '#15803D', background: '#dcfce7', padding: '2px 8px',
                        borderRadius: '999px',
                    }}>
                        Save ${(item.originalPrice - item.price).toFixed(2)}
                    </span>
                </div>
                <button
                    onClick={() => setInCart(!inCart)}
                    style={{
                        marginTop: 'auto',
                        width: '100%', padding: '13px 0',
                        borderRadius: '14px',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.04em',
                        color: '#fff',
                        background: inCart
                            ? 'linear-gradient(135deg, #16a34a, #15803d)'
                            : `linear-gradient(135deg, ${COLORS.lightColor}, ${COLORS.darkColor})`,
                        boxShadow: inCart
                            ? '0 6px 20px rgba(21,128,61,0.35)'
                            : `0 6px 20px rgba(113,67,41,0.4)`,
                        transform: 'scale(1)',
                        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = inCart ? '0 10px 28px rgba(21,128,61,0.45)' : '0 10px 28px rgba(113,67,41,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = inCart ? '0 6px 20px rgba(21,128,61,0.35)' : '0 6px 20px rgba(113,67,41,0.4)'; }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1.03)'}
                >
                    {inCart ? <Icons.Check size={16} /> : <Icons.ShoppingCart size={16} />}
                    {inCart ? 'Added to Bag ✓' : 'Reserve Deal'}
                </button>
            </div>
        </div>
    );
};

// ─── Swiper ───────────────────────────────────────────────────────────────────
const Swiper = ({ items }) => {
    const [current, setCurrent] = useState(0);
    const [dragStart, setDragStart] = useState(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef(null);
    const CARD_WIDTH = 320;
    const GAP = 24;
    const STEP = CARD_WIDTH + GAP;
    const max = items.length - 1;

    const clamp = (v) => Math.max(0, Math.min(v, max));
    const goTo = useCallback((idx) => { setCurrent(clamp(idx)); setDragOffset(0); }, [max]);

    const onPointerDown = (e) => {
        setDragStart(e.clientX);
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e) => {
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

    // Arrow key support
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowRight') goTo(current + 1);
            if (e.key === 'ArrowLeft') goTo(current - 1);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [current, goTo]);

    const translateX = -(current * STEP) + dragOffset;

    return (
        <div style={{ position: 'relative' }}>
            {/* Overflow container */}
            <div style={{ overflow: 'hidden', margin: '0 -8px', padding: '16px 8px 24px' }}>
                <div
                    ref={trackRef}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                    style={{
                        display: 'flex', gap: `${GAP}px`,
                        transform: `translateX(${translateX}px)`,
                        transition: isDragging ? 'none' : 'transform 0.55s cubic-bezier(0.23,1,0.32,1)',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        willChange: 'transform',
                    }}
                >
                    {items.map((item, i) => (
                        <ProductCard key={item.id} item={item} index={i} isActive={i === current} />
                    ))}
                </div>
            </div>

            {/* Controls row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                {/* Dots */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            style={{
                                width: i === current ? '28px' : '8px',
                                height: '8px',
                                borderRadius: '999px',
                                border: 'none',
                                background: i === current ? COLORS.darkColor : COLORS.lightBackground,
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                                padding: 0,
                            }}
                        />
                    ))}
                </div>

                {/* Counter */}
                <span style={{
                    fontSize: '12px', fontWeight: 700, color: COLORS.textSecondary,
                    fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.12em',
                }}>
                    {String(current + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </span>

                {/* Arrow buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => goTo(current - 1)}
                        disabled={current === 0}
                        style={{
                            width: '44px', height: '44px', borderRadius: '50%',
                            border: `1.5px solid ${current === 0 ? COLORS.border : COLORS.darkColor}`,
                            background: current === 0 ? 'rgba(255,255,255,0.3)' : COLORS.darkColor,
                            color: current === 0 ? COLORS.textSecondary : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: current === 0 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                            opacity: current === 0 ? 0.45 : 1,
                            transform: 'scale(1)',
                        }}
                        onMouseEnter={e => { if (current !== 0) { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 6px 18px rgba(113,67,41,0.35)`; } }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <Icons.ArrowLeft size={16} />
                    </button>
                    <button
                        onClick={() => goTo(current + 1)}
                        disabled={current === max}
                        style={{
                            width: '44px', height: '44px', borderRadius: '50%',
                            border: `1.5px solid ${current === max ? COLORS.border : COLORS.darkColor}`,
                            background: current === max ? 'rgba(255,255,255,0.3)' : COLORS.darkColor,
                            color: current === max ? COLORS.textSecondary : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: current === max ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                            opacity: current === max ? 0.45 : 1,
                            transform: 'scale(1)',
                        }}
                        onMouseEnter={e => { if (current !== max) { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 6px 18px rgba(113,67,41,0.35)`; } }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <Icons.ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
    const [timeLeft, setTimeLeft] = useState(14 * 3600 + 37 * 60 + 52);
    const [headerVisible, setHeaderVisible] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
        const t = setTimeout(() => setHeaderVisible(true), 80);
        return () => { clearInterval(timer); clearTimeout(t); };
    }, []);

    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;

    return (
        <div style={{
            minHeight: '100vh',
            background: `linear-gradient(148deg, #dbc6b6 0%, ${COLORS.background} 45%, #c4a48f 100%)`,
            fontFamily: "'Cormorant Garamond', serif",
            color: COLORS.textPrimary,
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Ambient blobs */}
            <div style={{
                position: 'fixed', top: '-120px', right: '-120px',
                width: '500px', height: '500px', borderRadius: '50%',
                background: `radial-gradient(circle, rgba(176,132,99,0.22) 0%, transparent 70%)`,
                animation: 'blob1 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 0,
            }} />
            <div style={{
                position: 'fixed', bottom: '-100px', left: '-100px',
                width: '420px', height: '420px', borderRadius: '50%',
                background: `radial-gradient(circle, rgba(113,67,41,0.13) 0%, transparent 70%)`,
                animation: 'blob2 11s ease-in-out infinite', pointerEvents: 'none', zIndex: 0,
            }} />

            <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>

                {/* ── Header ─────────────────────────────────────── */}
                <header style={{
                    padding: '4rem 0 3.5rem',
                    opacity: headerVisible ? 1 : 0,
                    transform: headerVisible ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'all 0.9s cubic-bezier(0.23,1,0.32,1)',
                }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '3rem' }}>

                        {/* Left */}
                        <div style={{ flex: '1 1 400px' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '6px 14px', borderRadius: '999px', marginBottom: '1.5rem',
                                border: `1px solid ${COLORS.darkColor}50`,
                                color: COLORS.darkColor,
                                background: 'rgba(255,255,255,0.18)',
                                fontSize: '10px', fontWeight: 900, letterSpacing: '0.28em', textTransform: 'uppercase',
                                fontFamily: "'Cormorant Garamond', serif",
                                animation: 'pulse 2.5s ease-in-out infinite',
                            }}>
                                <Icons.Zap size={12} fill="currentColor" /> Limited Release
                            </div>

                            <h1 style={{
                                fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 700, lineHeight: 1.12,
                                color: COLORS.textPrimary, marginBottom: '1rem',
                                letterSpacing: '-0.02em',
                            }}>
                                Weekend{' '}
                                <em style={{ color: COLORS.darkColor, fontStyle: 'italic' }}>Craft</em>
                                <br />Curated Flash Sale
                            </h1>

                            <p style={{
                                maxWidth: '440px', fontSize: '1rem', lineHeight: 1.75,
                                color: COLORS.textPrimary, opacity: 0.72, marginBottom: '1.5rem',
                                fontFamily: "'Cormorant Garamond', serif", fontWeight: 500,
                            }}>
                                Handpicked artisanal pieces, sustainably sourced and uniquely crafted.
                                Available at special prices for a short time only.
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {[
                                    { icon: <Icons.Clock size={13} />, label: '24 Hours Only' },
                                    { icon: <Icons.Truck size={13} />, label: 'Free Shipping' },
                                ].map((chip) => (
                                    <div key={chip.label} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '7px 14px', borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.28)',
                                        border: '1px solid rgba(255,255,255,0.4)',
                                        fontSize: '12px', fontWeight: 700, color: COLORS.darkColor,
                                        backdropFilter: 'blur(8px)',
                                    }}>
                                        {chip.icon} {chip.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timer */}
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            padding: '2.5rem 3rem', borderRadius: '28px',
                            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255,255,255,0.45)',
                            boxShadow: '0 20px 60px rgba(113,67,41,0.18)',
                            animation: 'timerIn 0.8s cubic-bezier(0.23,1,0.32,1) 0.3s both',
                        }}>
                            <span style={{
                                fontSize: '9px', fontWeight: 900, letterSpacing: '0.25em',
                                textTransform: 'uppercase', color: COLORS.textSecondary,
                                marginBottom: '1.5rem', fontFamily: "'Cormorant Garamond', serif",
                            }}>
                                Sale Event Concludes In
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <DigitBlock value={h} label="Hours" />
                                <span style={{
                                    fontSize: '2.5rem', fontWeight: 900, color: COLORS.darkColor,
                                    marginBottom: '18px', animation: 'blink 1s step-end infinite',
                                    fontFamily: "'Playfair Display', serif",
                                }}>:</span>
                                <DigitBlock value={m} label="Minutes" />
                                <span style={{
                                    fontSize: '2.5rem', fontWeight: 900, color: COLORS.darkColor,
                                    marginBottom: '18px', animation: 'blink 1s step-end infinite',
                                    fontFamily: "'Playfair Display', serif",
                                }}>:</span>
                                <DigitBlock value={s} label="Seconds" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Section heading ─────────────────────────────── */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    animation: 'fadeUp 0.6s ease 0.7s both',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '5px', height: '44px', borderRadius: '999px', background: `linear-gradient(180deg, ${COLORS.lightColor}, ${COLORS.darkColor})` }} />
                        <div>
                            <h2 style={{
                                fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em',
                                color: COLORS.textPrimary, fontFamily: "'Playfair Display', serif",
                            }}>Exclusive Offers</h2>
                            <p style={{ fontSize: '12px', opacity: 0.55, color: COLORS.textSecondary, fontFamily: "'Cormorant Garamond', serif" }}>
                                Drag or use arrows · Limited quantity per customer
                            </p>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '13px', fontWeight: 700, color: COLORS.darkColor,
                        cursor: 'pointer', opacity: 0.65, transition: 'opacity 0.2s',
                        fontFamily: "'Cormorant Garamond', serif",
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.65'}
                    >
                        View Full Collection <Icons.ChevronRight size={16} />
                    </div>
                </div>

                {/* ── Swiper ─────────────────────────────────────── */}
                <div style={{ animation: 'fadeUp 0.7s ease 0.9s both' }}>
                    <Swiper items={saleProducts} />
                </div>

                {/* ── CTA ────────────────────────────────────────── */}
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '4rem 0 5rem',
                    animation: 'fadeUp 0.6s ease 1.1s both',
                }}>
                    <button
                        style={{
                            padding: '16px 40px', borderRadius: '999px',
                            border: 'none', cursor: 'pointer',
                            background: `linear-gradient(135deg, ${COLORS.lightColor} 0%, ${COLORS.darkColor} 100%)`,
                            color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                            letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif",
                            display: 'flex', alignItems: 'center', gap: '10px',
                            boxShadow: `0 10px 32px rgba(113,67,41,0.4)`,
                            transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                            transform: 'scale(1)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 18px 44px rgba(113,67,41,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(113,67,41,0.4)'; }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    >
                        Explore All Flash Deals
                        <Icons.ArrowRight size={17} className="transition-transform" />
                    </button>
                    <p style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        marginTop: '1.25rem', fontSize: '12px', opacity: 0.5,
                        color: COLORS.textSecondary, fontFamily: "'Cormorant Garamond', serif",
                    }}>
                        <Icons.Clock size={12} /> New deals drop every weekend at 12:00 PM EST
                    </p>
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