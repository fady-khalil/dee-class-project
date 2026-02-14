import { useRef, useEffect, useState } from "react";

const Story = ({ text, image }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

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

  return (
    <section
      ref={ref}
      className="snap-start min-h-screen relative flex items-center justify-center overflow-hidden"
    >
      {/* Background image with slow zoom */}
      <div className={`story-bg absolute inset-0 ${visible ? "is-visible" : ""}`}>
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Glassmorphic panel */}
      <div
        className={`liquid-glass relative z-10 max-w-2xl mx-6 p-8 md:p-12 rounded-3xl text-center transition-all duration-1000 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <p className="text-lg md:text-2xl text-white/90 leading-relaxed font-light">
          "{text}"
        </p>
      </div>
    </section>
  );
};

export default Story;
