import { useRef, useEffect, useState, useMemo } from "react";
import { CaretDown } from "@phosphor-icons/react";

const PARTICLE_COUNT = 20;

const Opening = ({ line1, line2 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        bottom: `${-Math.random() * 20}%`,
        size: 1 + Math.random() * 2,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 10,
        opacity: 0.2 + Math.random() * 0.4,
      })),
    []
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words1 = line1.split(" ");
  const words2 = line2.split(" ");
  const line2Start = 0.3 + words1.length * 0.18;

  return (
    <section
      ref={ref}
      className="snap-start min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Radial ambient glow — breathing */}
      <div className="absolute inset-0 bg-black" />
      <div className="opening-glow" />

      {/* Film grain overlay */}
      <div className="opening-grain" />

      {/* Floating particles */}
      <div className="opening-particles">
        {particles.map((p, i) => (
          <span
            key={i}
            style={{
              left: p.left,
              bottom: p.bottom,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Cinematic light streak */}
      <div className="opening-light-streak" />

      {/* Cinematic letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-[6vh] bg-black z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-[6vh] bg-black z-20" />

      {/* Vignette */}
      <div className="absolute inset-0 opening-vignette z-10" />

      {/* Title */}
      {visible && (
        <div className="word-reveal text-center relative z-10 px-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
            {words1.map((w, i) => (
              <span
                key={i}
                className="text-white mr-3 lg:mr-5"
                style={{ animationDelay: `${0.3 + i * 0.18}s` }}
              >
                {w}
              </span>
            ))}
          </h1>

          {/* Expanding divider line */}
          <div
            className="opening-line mx-auto my-5 md:my-7"
            style={{ animationDelay: `${line2Start - 0.1}s` }}
          />

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
            {words2.map((w, i) => (
              <span
                key={i}
                className="text-primary opening-text-glow mr-3 lg:mr-5"
                style={{ animationDelay: `${line2Start + i * 0.18}s` }}
              >
                {w}
              </span>
            ))}
          </h1>
        </div>
      )}

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-[8vh] z-20 flex flex-col items-center gap-2 transition-opacity duration-1000 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: `${line2Start + words2.length * 0.18 + 0.5}s` }}
      >
        <span className="text-white/30 text-xs tracking-[0.3em] uppercase">Scroll</span>
        <div className="scroll-indicator text-white/30">
          <CaretDown size={24} />
        </div>
      </div>
    </section>
  );
};

export default Opening;
