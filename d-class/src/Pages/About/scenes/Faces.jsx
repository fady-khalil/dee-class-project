import { useRef, useEffect, useState } from "react";

const FLOAT_DIRS = [
  { x: "-60px", y: "0px" },
  { x: "0px",   y: "60px" },
  { x: "60px",  y: "0px" },
  { x: "-40px", y: "-40px" },
  { x: "40px",  y: "40px" },
  { x: "0px",   y: "-60px" },
];

const SIZE_MAP = {
  large:  "col-span-2 row-span-2",
  medium: "col-span-1 row-span-2",
  small:  "col-span-1 row-span-1",
};

const Faces = ({ images }) => {
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
      className="snap-start min-h-screen bg-black flex items-center justify-center px-4 py-12"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] md:auto-rows-[160px] gap-3 max-w-5xl w-full">
        {images.map((img, i) => {
          const dir = FLOAT_DIRS[i % FLOAT_DIRS.length];
          return (
            <div
              key={i}
              className={`face-card ${SIZE_MAP[img.size] || SIZE_MAP.medium} ${
                visible ? "is-visible" : ""
              } relative rounded-2xl overflow-hidden`}
              style={{
                "--float-x": dir.x,
                "--float-y": dir.y,
                animationDelay: `${i * 0.15}s`,
              }}
            >
              <img
                src={img.src}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Faces;
