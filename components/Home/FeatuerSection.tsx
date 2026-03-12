import React, { useEffect, useRef, useState } from 'react';

const Icons = {
    Truck: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3v10a2 2 0 0 0 2 2Z" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
    ),
    ShieldCheck: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
    ),
    RotateCcw: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
    ),
    Headphones: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" /></svg>
    ),
    Star: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
    ),
    Crown: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>
    ),
    Heart: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
    ),
    Sparkles: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
    )
};


const features = [
    {
        icon: <Icons.Truck className="w-6 h-6" />,
        title: 'Artisanal Delivery',
        subtitle: 'Carefully packaged and shipped with love on orders over $150.',
        accent: 'bg-[#B5A192] text-[#1C1C1C]',
        stat: 'Global',
        statLabel: 'Shipping',
        glowColor: 'rgba(181,161,146,0.25)',
    },
    {
        icon: <Icons.ShieldCheck className="w-6 h-6" />,
        title: 'Secure Craftsmanship',
        subtitle: 'Authenticity certificates provided for every precious metal used.',
        accent: 'bg-[#B9937B] text-[#1C1C1C]',
        stat: '100%',
        statLabel: 'Authentic',
        glowColor: 'rgba(185,147,123,0.25)',
    },
    {
        icon: <Icons.RotateCcw className="w-6 h-6" />,
        title: 'Lifetime Integrity',
        subtitle: '30-day exchange policy and lifetime maintenance for all pieces.',
        accent: 'bg-[#B08463] text-white',
        stat: 'Forever',
        statLabel: 'Warranty',
        glowColor: 'rgba(176,132,99,0.25)',
    },
    {
        icon: <Icons.Headphones className="w-6 h-6" />,
        title: 'Personal Concierge',
        subtitle: 'Our jewelry experts are available 24/7 for custom consultations.',
        accent: 'bg-[#714329] text-white',
        stat: 'Direct',
        statLabel: 'Support',
        glowColor: 'rgba(113,67,41,0.25)',
    },
];

const FloatingParticle = ({ delay, x, size }: { delay: number; x: number; size: number }) => (
    <div
        style={{
            position: 'absolute',
            left: `${x}%`,
            bottom: '-10px',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: 'rgba(176,132,99,0.4)',
            animation: `floatUp 6s ease-in infinite`,
            animationDelay: `${delay}s`,
            pointerEvents: 'none',
        }}
    />
);

interface Feature {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    accent: string;
    stat: string;
    statLabel: string;
    glowColor: string;
}

const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 200 + index * 180);
        return () => clearTimeout(timer);
    }, [index]);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
    };

    const tiltX = isHovered ? ((mousePos.y - 50) / 50) * -8 : 0;
    const tiltY = isHovered ? ((mousePos.x - 50) / 50) * 8 : 0;

    return (
        <div
            ref={cardRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 50, y: 50 }); }}
            onMouseMove={handleMouseMove}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                    ? `translateY(${isHovered ? -10 : 0}px) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
                    : 'translateY(40px)',
                transition: isVisible
                    ? 'transform 0.4s cubic-bezier(0.23,1,0.32,1), opacity 0.7s ease, box-shadow 0.4s ease'
                    : 'opacity 0.7s ease',
                boxShadow: isHovered
                    ? `0 30px 60px ${feature.glowColor}, 0 8px 20px rgba(113,67,41,0.08)`
                    : '0 2px 12px rgba(0,0,0,0.06)',
                background: isHovered
                    ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,1) 0%, #fff 70%)`
                    : '#fff',
                flex: '1 1 0',
                minWidth: 0,
                position: 'relative',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #E5E5E5',
                cursor: 'default',
                overflow: 'hidden',
            }}
        >
            {/* Shimmer border on hover */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '1rem', pointerEvents: 'none',
                background: isHovered
                    ? `linear-gradient(135deg, rgba(176,132,99,0.2) 0%, transparent 50%, rgba(176,132,99,0.1) 100%)`
                    : 'transparent',
                transition: 'background 0.5s ease',
            }} />

            {/* Sparkle corner */}
            <div style={{
                position: 'absolute', top: '10px', right: '10px',
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'rotate(0deg) scale(1)' : 'rotate(-30deg) scale(0.5)',
                transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
                <Icons.Sparkles className="w-4 h-4 text-[#B08463]" />
            </div>

            {/* Icon + stat row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div
                    className={feature.accent}
                    style={{
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        transform: isHovered ? 'scale(1.12) rotate(-4deg)' : 'scale(1) rotate(0deg)',
                        transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                        animation: isHovered ? 'iconPulse 1.5s ease infinite' : 'none',
                    }}
                >
                    {feature.icon}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{
                        display: 'block', fontSize: '9px', fontWeight: 700,
                        letterSpacing: '0.2em', textTransform: 'uppercase',
                        color: '#6B6B6B', fontFamily: "'Inter', sans-serif",
                    }}>
                        {feature.statLabel}
                    </span>
                    <span style={{
                        fontSize: '1.1rem',
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: 'italic',
                        color: '#714329',
                        transition: 'transform 0.3s ease',
                        display: 'inline-block',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    }}>
                        {feature.stat}
                    </span>
                </div>
            </div>

            {/* Text */}
            <h3 style={{
                fontSize: '1.1rem',
                fontFamily: "'Playfair Display', serif",
                color: isHovered ? '#714329' : '#1C1C1C',
                marginBottom: '0.6rem',
                transition: 'color 0.3s ease',
            }}>
                {feature.title}
            </h3>
            <p style={{
                color: '#6B6B6B', fontSize: '0.83rem',
                lineHeight: 1.65, marginBottom: '1.5rem',
                fontFamily: "'Inter', sans-serif",
            }}>
                {feature.subtitle}
            </p>

            {/* Animated underline */}
            <div style={{ height: '2px', background: '#E5E5E5', width: '100%', overflow: 'hidden', borderRadius: '999px' }}>
                <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #B5A192, #714329)',
                    width: isHovered ? '100%' : '0%',
                    transition: 'width 0.8s cubic-bezier(0.23,1,0.32,1)',
                    borderRadius: '999px',
                }} />
            </div>
        </div>
    );
};

const TrustItem = ({ icon, title, sub, delay }: { icon: React.ReactNode; title: string; sub: string; delay: number }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 900 + delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.6s ease',
        }}
            className="group"
        >
            <div style={{
                padding: '0.75rem', borderRadius: '9999px',
                background: 'rgba(255,255,255,0.07)',
                transition: 'background 0.3s ease',
            }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(176,132,99,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            >
                {icon}
            </div>
            <div>
                <p style={{ color: '#fff', fontSize: '1rem', fontFamily: "'Playfair Display', serif" }}>{title}</p>
                <p style={{ color: '#B5A192', fontSize: '0.7rem', fontFamily: "'Inter', sans-serif" }}>{sub}</p>
            </div>
        </div>
    );
};

export default function App() {
    const [headerVisible, setHeaderVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setHeaderVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #D8C3B0 0%, #C8AD99 40%, #BFA08A 100%)',
            fontFamily: "'Inter', sans-serif",
            color: '#1C1C1C',
            position: 'relative',
            overflow: 'hidden',
        }}>

            {/* Floating background orbs */}
            <div style={{
                position: 'absolute', top: '-80px', right: '-80px',
                width: '320px', height: '320px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(176,132,99,0.18) 0%, transparent 70%)',
                animation: 'orb1 8s ease-in-out infinite',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '60px', left: '-60px',
                width: '240px', height: '240px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(113,67,41,0.12) 0%, transparent 70%)',
                animation: 'orb2 10s ease-in-out infinite',
                pointerEvents: 'none',
            }} />

            <div style={{ padding: '5rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header */}
                <header style={{
                    textAlign: 'center', marginBottom: '3.5rem',
                    opacity: headerVisible ? 1 : 0,
                    transform: headerVisible ? 'translateY(0)' : 'translateY(-24px)',
                    transition: 'all 0.8s cubic-bezier(0.23,1,0.32,1)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ height: '1px', width: '2rem', background: 'rgba(113,67,41,0.35)' }} />
                        <span style={{
                            color: '#714329', textTransform: 'uppercase',
                            letterSpacing: '0.3em', fontSize: '10px', fontWeight: 700,
                        }}>
                            Timeless Elegance
                        </span>
                        <div style={{ height: '1px', width: '2rem', background: 'rgba(113,67,41,0.35)' }} />
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                        fontFamily: "'Playfair Display', serif",
                        color: '#1C1C1C',
                        marginBottom: '1rem',
                        lineHeight: 1.2,
                        animation: headerVisible ? 'shimmerText 4s ease-in-out infinite' : 'none',
                    }}>
                        The <em style={{ fontStyle: 'italic' }}>Art</em> of Choice
                    </h1>

                    <p style={{
                        maxWidth: '480px', margin: '0 auto',
                        color: '#5A4A3F', lineHeight: 1.75, fontSize: '0.9rem',
                    }}>
                        Every handcrafted piece is a story of tradition, refined skills, and
                        responsibly sourced materials, delivered with an uncompromising standard of care.
                    </p>
                </header>

                {/* 4 Cards — single row using flex */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '1.25rem',
                    width: '100%',
                    alignItems: 'stretch',
                }}>
                    {features.map((feature, idx) => (
                        <FeatureCard key={idx} feature={feature} index={idx} />
                    ))}
                </div>

                {/* Trust Banner */}
                <div style={{
                    marginTop: '4rem',
                    background: 'linear-gradient(135deg, #714329 0%, #5A3420 100%)',
                    borderRadius: '1.5rem',
                    padding: '2.5rem 3rem',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: 'bannerIn 0.8s ease 1.2s both',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: '1.5rem',
                        background: 'radial-gradient(circle at 50% 0%, rgba(176,132,99,0.18) 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }} />
                    {/* Subtle grain */}
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: '1.5rem',
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
                        pointerEvents: 'none', opacity: 0.4,
                    }} />

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <TrustItem
                            icon={<Icons.Crown className="w-5 h-5 text-[#D0B9A7]" />}
                            title="Ethically Sourced"
                            sub="Conflict-free gemstones"
                            delay={0}
                        />
                        <div style={{ width: '1px', height: '3rem', background: 'rgba(255,255,255,0.1)' }} />
                        <TrustItem
                            icon={<Icons.Heart className="w-5 h-5 text-[#D0B9A7]" />}
                            title="Hand-Finished"
                            sub="In our local workshop"
                            delay={150}
                        />
                        <div style={{ width: '1px', height: '3rem', background: 'rgba(255,255,255,0.1)' }} />
                        <TrustItem
                            icon={<Icons.Star className="w-5 h-5 text-[#D0B9A7]" />}
                            title="Exquisite Reviews"
                            sub="4.9/5 from 10k+ collectors"
                            delay={300}
                        />
                    </div>
                </div>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;700&display=swap');

        @keyframes floatUp {
            0%   { transform: translateY(0) scale(1); opacity: 0.6; }
            100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
        }
        @keyframes orb1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50%       { transform: translate(-30px, 30px) scale(1.1); }
        }
        @keyframes orb2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50%       { transform: translate(20px, -20px) scale(1.08); }
        }
        @keyframes iconPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(176,132,99,0.4); }
            50%       { box-shadow: 0 0 0 8px rgba(176,132,99,0); }
        }
        @keyframes shimmerText {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.88; }
        }
        @keyframes bannerIn {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}