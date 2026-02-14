import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play, CircleNotch } from "@phosphor-icons/react";
import BASE_URL from "Utilities/BASE_URL";

const SERVER_URL = BASE_URL.replace("/api", "");

const getThumb = (course) => {
  if (course?.trailer?.assets?.thumbnail) return course.trailer.assets.thumbnail;
  if (course?.thumbnail) return course.thumbnail;
  if (course?.image) return `${SERVER_URL}/${course.image}`;
  return null;
};

const getImgUrl = (p) =>
  !p || p.startsWith("http") ? p : `${SERVER_URL}/${p}`;

const CinemaCard = ({ course }) => {
  const { i18n } = useTranslation();
  const trailerId = course?.trailer?.videoId || null;
  const thumbnail = getThumb(course);
  const instructor = course.instructor;
  const profileImg = instructor?.profileImage
    ? getImgUrl(instructor.profileImage)
    : null;

  const [hovering, setHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const hoveringRef = useRef(false);

  const enter = useCallback(() => {
    if (!trailerId) return;
    hoveringRef.current = true;
    setHovering(true);
  }, [trailerId]);

  const leave = useCallback(() => {
    hoveringRef.current = false;
    setHovering(false);
    setVideoReady(false);
  }, []);

  useEffect(() => {
    if (!hovering || !trailerId) return;
    const onMsg = (e) => {
      if (!hoveringRef.current) return;
      try {
        const d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (["playing", "play"].includes(d?.type || d?.name))
          setVideoReady(true);
      } catch {}
    };
    window.addEventListener("message", onMsg);
    const fb = setTimeout(() => hoveringRef.current && setVideoReady(true), 2000);
    return () => {
      window.removeEventListener("message", onMsg);
      clearTimeout(fb);
    };
  }, [hovering, trailerId]);

  return (
    <Link
      to={`/course/${course.slug}`}
      className="group relative block shrink-0 w-[280px] sm:w-[320px] lg:w-[360px]"
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      {/* Image / Video */}
      <div className="relative overflow-hidden rounded-2xl aspect-[16/10]">
        {trailerId && hovering && (
          <iframe
            src={`https://embed.api.video/vod/${trailerId}?autoplay=true&muted=false&loop=true&hideTitle=true&hidePoster=true`}
            className="absolute inset-0 w-full h-full"
            style={{ border: "none" }}
            allow="autoplay; fullscreen"
          />
        )}
        <img
          src={thumbnail}
          className={`relative w-full h-full object-cover transition-all duration-700 ${
            videoReady ? "opacity-0" : "opacity-100"
          } ${!hovering ? "group-hover:scale-110" : ""}`}
          style={{ zIndex: videoReady ? 0 : 2 }}
          alt={course.name}
          loading="lazy"
        />
        {hovering && !videoReady && (
          <div className="absolute inset-0 z-[3] flex items-center justify-center">
            <CircleNotch size={32} className="text-white animate-spin" />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"
          style={{ zIndex: 3, pointerEvents: "none" }}
        />

        {/* NEW badge */}
        <div
          className={`absolute top-3 ${i18n.language === "ar" ? "right-3" : "left-3"} z-10`}
        >
          <span className="new-badge-glow rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
            New
          </span>
        </div>

        {/* Play button on hover (no trailer) */}
        {!trailerId && (
          <div className="absolute inset-0 z-[4] flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur-sm scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play size={24} weight="fill" className="text-white ms-0.5" />
            </div>
          </div>
        )}

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 inset-x-0 z-10 p-4">
          <h3 className="text-white text-base font-semibold line-clamp-1 drop-shadow-lg group-hover:text-primary transition-colors duration-300">
            {course.name}
          </h3>
          {instructor?.name && (
            <div className="flex items-center gap-2 mt-1.5">
              {profileImg ? (
                <img
                  src={profileImg}
                  alt={instructor.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-white/30"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/40 text-[9px] font-bold text-white ring-1 ring-white/30">
                  {instructor.name.charAt(0)}
                </div>
              )}
              <span className="text-xs text-white/60">{instructor.name}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CinemaCard;
