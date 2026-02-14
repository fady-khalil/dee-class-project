import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play, CircleNotch } from "@phosphor-icons/react";
import BASE_URL from "Utilities/BASE_URL";

const SERVER_URL = BASE_URL.replace("/api", "");

const getCourseThumbnail = (course) => {
  if (course?.trailer?.assets?.thumbnail) return course.trailer.assets.thumbnail;
  if (course?.thumbnail) return course.thumbnail;
  if (course?.image) return `${SERVER_URL}/${course.image}`;
  if (course?.mobileImage) return `${SERVER_URL}/${course.mobileImage}`;
  return null;
};

const getImageUrl = (path) =>
  !path || path.startsWith("http") ? path : `${SERVER_URL}/${path}`;

const getTrailerId = (course) => course?.trailer?.videoId || null;

const getLessonInfo = (course, t) => {
  if (course.course_type === "series") {
    const count = course.series?.length || 0;
    return count > 0 ? `${count} ${t("course_card.episodes", "Episodes")}` : null;
  }
  if (course.course_type === "playlist") {
    const count = course.chapters?.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0) || 0;
    return count > 0 ? `${count} ${t("course_card.lessons", "Lessons")}` : null;
  }
  return t("course_card.masterclass", "Masterclass");
};

const CourseCard = ({ course }) => {
  const { t, i18n } = useTranslation();
  const thumbnail = getCourseThumbnail(course);
  const instructor = course.instructor;
  const profileImg = instructor?.profileImage ? getImageUrl(instructor.profileImage) : null;
  const lessonInfo = getLessonInfo(course, t);
  const trailerId = getTrailerId(course);

  const [hovering, setHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const iframeRef = useRef(null);
  const hoveringRef = useRef(false);

  const handleMouseEnter = useCallback(() => {
    if (!trailerId) return;
    hoveringRef.current = true;
    setHovering(true);
  }, [trailerId]);

  const handleMouseLeave = useCallback(() => {
    hoveringRef.current = false;
    setHovering(false);
    setVideoReady(false);
  }, []);

  // Listen for api.video postMessage events to detect when video starts playing
  useEffect(() => {
    if (!hovering || !trailerId) return;

    const handleMessage = (e) => {
      if (!hoveringRef.current) return;
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.type === "playing" || data?.type === "play" || data?.name === "playing" || data?.name === "play") {
          setVideoReady(true);
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    // Fallback: if postMessage doesn't fire, show after 2s
    const fallback = setTimeout(() => {
      if (hoveringRef.current) setVideoReady(true);
    }, 2000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(fallback);
    };
  }, [hovering, trailerId]);

  return (
    <Link
      to={`/course/${course.slug}`}
      className="group relative block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image / Video container */}
      <div className="relative overflow-hidden rounded-xl">
        {/* Iframe loads behind thumbnail */}
        {trailerId && hovering && (
          <iframe
            ref={iframeRef}
            src={`https://embed.api.video/vod/${trailerId}?autoplay=true&muted=false&loop=true&hideTitle=true&hidePoster=true`}
            className="absolute inset-0 w-full h-full"
            style={{ border: "none" }}
            allow="autoplay; fullscreen"
          />
        )}

        {/* Thumbnail stays on top until video is ready */}
        <img
          src={thumbnail}
          className={`relative w-full h-[200px] lg:h-[280px] object-cover transition-all duration-500 ${
            videoReady ? "opacity-0" : "opacity-100"
          } ${!hovering ? "group-hover:scale-105" : ""}`}
          style={{ zIndex: videoReady ? 0 : 2 }}
          alt={course.name}
          loading="lazy"
        />

        {/* Spinner on thumbnail while loading */}
        {hovering && !videoReady && (
          <div className="absolute inset-0 z-[3] flex items-center justify-center">
            <CircleNotch size={36} className="text-white animate-spin" />
          </div>
        )}

        {/* Permanent bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" style={{ zIndex: 3, pointerEvents: "none" }} />

        {/* Tags */}
        {course?.tags?.length > 0 && (
          <div
            className={`absolute top-3 ${
              i18n.language === "ar" ? "left-3" : "right-3"
            } flex flex-wrap gap-1 z-10`}
          >
            {course.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs font-medium rounded-md shadow-md capitalize"
                style={{ backgroundColor: tag.color, color: tag.text_color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Hover overlay — play button (only when no trailer) */}
        {!trailerId && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-[4]">
            <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25 scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play size={26} weight="fill" className="text-white ms-0.5" />
            </div>
          </div>
        )}

        {/* Lesson info badge */}
        {lessonInfo && (
          <div
            className={`absolute bottom-3 ${
              i18n.language === "ar" ? "right-3" : "left-3"
            } z-10`}
          >
            <span className="text-xs font-medium text-white/90 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
              {lessonInfo}
            </span>
          </div>
        )}
      </div>

      {/* Text info below image */}
      <div className="mt-3">
        <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {course.name}
        </h3>
        {instructor?.name && (
          <div className="flex items-center gap-2 mt-1.5">
            {profileImg ? (
              <img
                src={profileImg}
                alt={instructor.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-white/20">
                {instructor.name.charAt(0)}
              </div>
            )}
            <span className="text-sm text-white/50">{instructor.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default CourseCard;
