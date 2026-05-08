import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

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
    Sparkles: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
    )
};

const features = [
    {
        icon: <Icons.Truck className="w-6 h-6" />,
        title: 'Artisanal Delivery',
        subtitle: 'Carefully packaged and shipped with love on orders over $150.',
        accent: 'bg-[#714329] text-white',
        stat: 'Global',
        statLabel: 'Shipping',
        glowColor: 'rgba(181,161,146,0.25)',
    },
    {
        icon: <Icons.ShieldCheck className="w-6 h-6" />,
        title: 'Secure Craftsmanship',
        subtitle: 'Authenticity certificates provided for every precious metal used.',
        accent: 'bg-[#714329] text-white',
        stat: '100%',
        statLabel: 'Authentic',
        glowColor: 'rgba(185,147,123,0.25)',
    },
    {
        icon: <Icons.RotateCcw className="w-6 h-6" />,
        title: 'Lifetime Integrity',
        subtitle: '30-day exchange policy and lifetime maintenance for all pieces.',
        accent: 'bg-[#714329] text-white',
        stat: 'Forever',
        statLabel: 'Warranty',
        glowColor: 'rgba(113,67,41,0.25)',
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

interface Feature {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    accent: string;
    stat: string;
    statLabel: string;
    glowColor: string;
}

type CardMouseEvent = React.MouseEvent<HTMLDivElement>;

const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {

    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 200 + index * 180);
        return () => clearTimeout(timer);
    }, [index]);

    const handleMouseMove = (e: CardMouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
    };

    const tiltX = isHovered ? ((mousePos.y - 50) / 50) * -8 : 0;
    const tiltY = isHovered ? ((mousePos.x - 50) / 50) * 8 : 0;

    return (
        <div ref={cardRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 50, y: 50 }); }}
            onMouseMove={handleMouseMove}
            className={`flex-1 min-w-0 relative p-8 rounded-lg border border-[#E5E5E5] cursor-default overflow-hidden transition-all duration-700 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} `}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? `translateY(${isHovered ? -10 : 0}px) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)` : 'translateY(40px)',
                boxShadow: isHovered ? `0 30px 60px ${feature.glowColor}, 0 8px 20px rgba(113,67,41,0.08)` : '0 2px 12px rgba(0,0,0,0.06)',
                background: isHovered ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,1) 0%, #fff 70%)` : '#fff',
            }}
        >
            {/* Shimmer border */}
            <div className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-500 ${isHovered ? 'bg-gradient-to-br from-[rgba(176,132,99,0.2)] via-transparent to-[rgba(176,132,99,0.1)]' : 'bg-transparent'}`} />

            {/* Sparkle corner */}
            <div className={`absolute top-2.5 right-2.5 transition-all duration-500 ${isHovered ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-30 scale-50'}`}>
                <Icons.Sparkles className="w-4 h-4 text-[#B08463]" />
            </div>

            {/* Icon + stat row */}
            <div className="flex items-start justify-between mb-6">
                <div className={`${feature.accent} p-4 rounded-xl transition-all duration-500 ${isHovered ? 'scale-112 -rotate-1' : 'scale-100 rotate-0'}`}
                    style={{ animation: isHovered ? 'iconPulse 1.5s ease infinite' : 'none' }} >
                    {feature.icon}
                </div>
                <div className="text-right">
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">
                        {feature.statLabel}
                    </span>
                    <span className={`text-lg font-serif italic text-[#714329] transition-transform duration-300 inline-block ${isHovered ? 'scale-110' : 'scale-100'}`}>
                        {feature.stat}
                    </span>
                </div>
            </div>

            {/* Text */}
            <h3 className={`text-lg font-serif transition-colors duration-300 mb-2.5 ${isHovered ? 'text-[#714329]' : 'text-[#1C1C1C]'}`}>
                {feature.title}
            </h3>
            <p className="text-[#6B6B6B] text-sm leading-relaxed mb-6">
                {feature.subtitle}
            </p>

            {/* Animated underline */}
            <div className="h-0.5 bg-[#E5E5E5] w-full overflow-hidden rounded-full">
                <div className={`h-full bg-gradient-to-r from-[#B5A192] to-[#714329] rounded-full transition-all duration-800 ease-out ${isHovered ? 'w-full' : 'w-0'}`} />
            </div>
        </div>
    );
};

export default function FeatureSection() {

    const [headerVisible, setHeaderVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setHeaderVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="bg-[#FBF7F3] via-[#C8AD99] to-[#BFA08A] font-sans text-[#1C1C1C] relative overflow-hidden">
            <div className="flex flex-col items-center gap-12 px-6 py-32 mx-auto max-w-7xl">
                {/* Header */}
                <header className={`text-center max-w-3xl ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} transition-all duration-700 ease-out`}>
                    <View className="flex-row items-center justify-center gap-3 mx-auto mb-4">
                        <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                        <span className="text-[#714329] uppercase tracking-[0.3em] text-xs font-bold">
                            Timeless Elegance
                        </span>
                        <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                    </View>

                    <h1 className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4 leading-tight animate-shimmer">
                        The <em className="italic">Art</em> of Choice
                    </h1>

                    <p className="max-w-[580px] mx-auto text-[#5A4A3F] leading-[1.75]">
                        Every handcrafted piece is a story of tradition, refined skills, and
                        responsibly sourced materials, delivered with an uncompromising standard of care.
                    </p>
                </header>

                {/* 4 Cards — single row using flex */}
                <View className="flex-row items-stretch w-full gap-5">
                    {features.map((feature, idx) => (
                        <FeatureCard key={idx} feature={feature} index={idx} />
                    ))}
                </View>
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
        </div >
    );
}