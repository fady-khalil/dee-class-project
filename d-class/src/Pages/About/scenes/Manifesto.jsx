import { useRef, useEffect, useState } from "react";

const Manifesto = ({ statements }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="snap-start min-h-screen bg-black relative flex items-center justify-center overflow-hidden"
    >
      {/* Subtle vertical line accent */}
      <div
        className={`manifesto-line absolute left-1/2 -translate-x-1/2 transition-all duration-[2s] ${
          visible ? "h-[60%] opacity-100" : "h-0 opacity-0"
        }`}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 flex flex-col gap-16 md:gap-20">
        {statements.map((s, i) => (
          <div
            key={i}
            className={`manifesto-item transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: visible ? `${0.3 + i * 0.4}s` : "0s" }}
          >
            {/* Label */}
            <p className="text-primary/70 text-xs tracking-[0.35em] uppercase mb-4 font-medium">
              {s.label}
            </p>

            {/* Statement */}
            <p className="text-2xl md:text-3xl lg:text-4xl text-white/90 font-light leading-relaxed">
              {s.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Manifesto;
