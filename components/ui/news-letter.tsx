import { useState } from "react";

function HandcraftNewsletter() {
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const handleSubscribe = (e: React.MouseEvent<HTMLButtonElement>) => {
        const btn = e.currentTarget;

        // Ripple Effect
        const circle = document.createElement("span");
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const rect = btn.getBoundingClientRect();

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - diameter / 2}px`;
        circle.style.top = `${e.clientY - rect.top - diameter / 2}px`;
        circle.classList.add(
            "absolute",
            "bg-white/40",
            "rounded-full",
            "animate-ping"
        );

        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 500);

        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!valid) {
            setError(true);
            setTimeout(() => setError(false), 1200);
            return;
        }

        setSuccess(true);
        setEmail("");
    };

    return (
        <section className="relative bg-[#5C3A1E] text-[#F5ECD7] rounded-3xl overflow-hidden max-w-6xl mx-auto my-20">

            {/* Decorative floating circles */}
            <div className="absolute -top-28 -right-28 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(196,154,108,0.25)_0%,transparent_70%)] animate-pulse"></div>

            <div className="absolute bottom-10 left-14 w-20 h-20 border border-[#C49A6C]/40 rounded-full animate-bounce"></div>
            <div className="absolute top-0 left-1/3 w-36 h-36 border border-[#C49A6C]/30 rounded-full animate-bounce delay-200"></div>

            <div className="relative z-10 grid gap-10 px-8 py-16 md:grid-cols-2 md:px-16">

                {/* LEFT CONTENT */}
                <div className="space-y-6">
                    <div className="uppercase tracking-[0.2em] text-xs text-[#C49A6C] font-medium flex items-center gap-3">
                        <span className="w-3 h-3 border border-[#C49A6C] rounded-full"></span>
                        Handcrafted with love
                    </div>

                    <h2 className="font-serif text-3xl font-bold leading-tight md:text-5xl">
                        Stories from the <br />
                        <em className="text-[#C49A6C] not-italic">Maker's Studio</em>
                    </h2>

                    <p className="text-[#F5ECD7]/70 max-w-md leading-relaxed">
                        Join our community and receive curated dispatches — new arrivals,
                        artisan spotlights, seasonal collections and insider offers delivered
                        to your door.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-4">
                        {["New arrivals first", "Members-only deals", "Behind the craft"].map((item) => (
                            <span
                                key={item}
                                className="px-4 py-1 rounded-full border border-[#C49A6C]/40 text-sm text-[#F5ECD7]/70 hover:text-white hover:border-[#C49A6C] transition"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                {/* RIGHT FORM */}
                <div className="bg-[#F5ECD7]/5 backdrop-blur-md border border-[#C49A6C]/20 rounded-2xl p-8 relative">

                    <div className="mb-1 font-serif text-xl">Stay in the loop</div>
                    <div className="text-sm text-[#F5ECD7]/50 mb-6">
                        No noise, just craft. Unsubscribe anytime.
                    </div>

                    {!success ? (
                        <>
                            <div
                                className={`flex rounded-xl overflow-hidden bg-[#F5ECD7] transition ${error ? "ring-2 ring-[#C1674A]" : "focus-within:ring-2 focus-within:ring-[#C49A6C]"
                                    }`}
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="flex-1 px-4 py-3 text-[#2C1810] outline-none text-sm"
                                />

                                <button
                                    onClick={handleSubscribe}
                                    className="relative overflow-hidden bg-gradient-to-br from-[#C1674A] to-[#8B5E3C] px-6 text-white text-sm font-medium hover:brightness-110 active:scale-95 transition flex items-center gap-2"
                                >
                                    Subscribe
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className="transition-transform group-hover:translate-x-1"
                                    >
                                        <path
                                            d="M3 8H13M9 4L13 8L9 12"
                                            stroke="white"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#C49A6C]/20">
                                <div className="flex -space-x-2">
                                    {["M", "S", "R", "+"].map((a) => (
                                        <div
                                            key={a}
                                            className="w-7 h-7 bg-[#C49A6C] text-[#5C3A1E] flex items-center justify-center text-xs font-bold rounded-full border-2 border-[#5C3A1E]"
                                        >
                                            {a}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-[#F5ECD7]/60">
                                    Join <span className="text-[#C49A6C] font-semibold">4,800+ makers</span>
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 text-sm text-green-400 animate-fadeIn">
                            ✓ You're in! Welcome to the studio.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default HandcraftNewsletter;
export { HandcraftNewsletter };
