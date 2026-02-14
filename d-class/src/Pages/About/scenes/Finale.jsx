import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import bgImage from "assests/bghomd.png";

const Finale = ({ eyebrow, subtitle, buttonText, buttonLink }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="snap-start min-h-screen relative flex items-center justify-center overflow-hidden"
    >
      {/* BG with slow zoom */}
      <div className={`finale-bg absolute inset-0 ${visible ? "is-visible" : ""}`}>
        <img src={bgImage} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Layered overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
      <div className="absolute inset-0 finale-vignette" />

      {/* Ambient glow */}
      <div className="finale-glow" />

      {/* Content — no glass box, just raw text */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        {/* Eyebrow */}
        <p
          className={`finale-eyebrow text-primary/80 text-sm tracking-[0.3em] uppercase mb-6 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {eyebrow || "The next chapter is yours"}
        </p>

        {/* Title — word reveal like Opening */}
        {visible && (
          <h2 className="word-reveal text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8">
            {"Your Journey".split(" ").map((w, i) => (
              <span
                key={i}
                className="text-white mr-3 lg:mr-5"
                style={{ animationDelay: `${0.2 + i * 0.18}s` }}
              >
                {w}
              </span>
            ))}
            <br className="hidden md:block" />
            {"Starts Here.".split(" ").map((w, i) => (
              <span
                key={i}
                className="text-primary opening-text-glow mr-3 lg:mr-5"
                style={{ animationDelay: `${0.6 + i * 0.18}s` }}
              >
                {w}
              </span>
            ))}
          </h2>
        )}

        {/* Subtitle */}
        <p
          className={`text-white/40 text-lg md:text-xl max-w-xl mx-auto mb-12 transition-all duration-1000 delay-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {subtitle || "Join learners worldwide and start building your future today."}
        </p>

        {/* CTA button */}
        <div
          className={`transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0 delay-[1.2s]" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: visible ? "1.2s" : "0s" }}
        >
          <Link
            to={buttonLink || "/plans"}
            className="finale-btn group inline-flex items-center gap-3 bg-primary text-white font-semibold px-10 py-4 rounded-full text-lg transition-all hover:gap-5"
          >
            {buttonText || "Get Started"}
            <ArrowRight size={22} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Bottom fade to black (clean exit) */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-10" />
    </section>
  );
};

export default Finale;
