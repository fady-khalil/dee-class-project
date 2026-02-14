import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CaretLeft, CaretRight, Fire } from "@phosphor-icons/react";
import useApiQuery from "Hooks/useApiQuery";
import CinemaCard from "./CinemaCard";

const NewThisWeek = () => {
  const { t, i18n } = useTranslation();
  const { data } = useApiQuery("courses/new-this-week");
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isRtl = i18n.language === "ar";

  const courses = data?.data || [];

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const absScroll = Math.abs(scrollLeft);
    setCanScrollLeft(absScroll > 10);
    setCanScrollRight(absScroll + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [courses.length]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  if (!courses.length) return null;

  return (
    <section className="relative mt-12 mb-4">
      {/* Section header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
            <Fire size={20} weight="fill" className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            {t("explore.new_this_week", "New This Week")}
          </h2>
        </div>

        {/* Nav arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
              canScrollLeft
                ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                : "border-white/5 bg-white/5 text-white/20 cursor-default"
            }`}
          >
            {isRtl ? <CaretRight size={16} weight="bold" /> : <CaretLeft size={16} weight="bold" />}
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
              canScrollRight
                ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                : "border-white/5 bg-white/5 text-white/20 cursor-default"
            }`}
          >
            {isRtl ? <CaretLeft size={16} weight="bold" /> : <CaretRight size={16} weight="bold" />}
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div className="relative">
        {/* Left fade */}
        {canScrollLeft && (
          <div className={`pointer-events-none absolute top-0 bottom-0 ${isRtl ? "right-0" : "left-0"} z-10 w-16 bg-gradient-to-r ${isRtl ? "from-transparent to-[#0a0a0a]" : "from-[#0a0a0a] to-transparent"}`} />
        )}

        <div
          ref={scrollRef}
          className="hide-scrollbar flex gap-5 overflow-x-auto scroll-smooth pb-2"
        >
          {courses.map((course) => (
            <CinemaCard key={course._id || course.slug} course={course} />
          ))}
        </div>

        {/* Right fade */}
        {canScrollRight && (
          <div className={`pointer-events-none absolute top-0 bottom-0 ${isRtl ? "left-0" : "right-0"} z-10 w-16 bg-gradient-to-r ${isRtl ? "from-[#0a0a0a] to-transparent" : "from-transparent to-[#0a0a0a]"}`} />
        )}
      </div>
    </section>
  );
};

export default NewThisWeek;
