import { useRef, useEffect, useState } from "react";

const POSITIONS = [
  "col-span-2 row-span-1 md:col-start-1 md:col-span-1",
  "col-span-2 row-span-1 md:col-start-2 md:col-span-1 md:mt-16",
  "col-span-2 row-span-1 md:col-start-1 md:col-span-1 md:-mt-8",
  "col-span-2 row-span-1 md:col-start-2 md:col-span-1 md:mt-8",
];

const CounterItem = ({ target, suffix, label, delay, go }) => {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!go) return;

    const timeout = setTimeout(() => {
      const duration = 2000;
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setCount(target);
          setDone(true);
        }
      };
      requestAnimationFrame(tick);
    }, delay);

    return () => clearTimeout(timeout);
  }, [go, target, delay]);

  return (
    <div className="text-center">
      <span
        className={`text-5xl md:text-7xl lg:text-8xl font-bold text-white tabular-nums ${
          done ? "count-done" : ""
        }`}
      >
        {count.toLocaleString()}
        <span className="text-primary">{suffix}</span>
      </span>
      <p className="text-white/50 text-sm md:text-base mt-2 tracking-wide uppercase">
        {label}
      </p>
    </div>
  );
};

const Impact = ({ items }) => {
  const ref = useRef(null);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setGo(true),
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="snap-start min-h-screen bg-black flex items-center justify-center px-6"
    >
      <div className="grid grid-cols-2 gap-8 md:gap-12 max-w-3xl w-full">
        {items.map((item, i) => (
          <div key={i} className={POSITIONS[i]}>
            <CounterItem {...item} delay={i * 200} go={go} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Impact;
