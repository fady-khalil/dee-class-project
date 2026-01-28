import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReelItem from "./ReelItem";
import ReelScrollIndicator from "./ReelScrollIndicator";
import ReelNavigation from "./ReelNavigation";

const ReelContainer = ({
  reelsData,
  activeIndex,
  setActiveIndex,
  isLargeScreen,
  scrollToIndex,
}) => {
  const reelsContainerRef = useRef(null);
  const containerRef = useRef(null);
  const [isInViewport, setIsInViewport] = useState(false);

  // Intersection Observer to detect if component is in viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isVisible = entry.isIntersecting;

        // Only update state if there's a change
        if (isVisible !== isInViewport) {
          setIsInViewport(isVisible);

          // For debugging
          if (isVisible) {
            console.log("Reels container is now visible in viewport");
          } else {
            console.log("Reels container is now outside viewport");
          }
        }
      },
      {
        root: null,
        threshold: [0.1, 0.5], // Check at multiple thresholds for better detection
        rootMargin: "-10% 0px", // Only consider in viewport when 10% away from edges
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isInViewport]);

  useEffect(() => {
    if (!reelsContainerRef.current) return;

    const handleScroll = () => {
      if (reelsContainerRef.current) {
        const container = reelsContainerRef.current;
        const scrollPosition = container.scrollTop;
        const itemHeight = container.querySelector(".reel-item").offsetHeight;
        const index = Math.round(scrollPosition / itemHeight);

        if (index !== activeIndex && index >= 0 && index < reelsData.length) {
          setActiveIndex(index);
        }
      }
    };

    const container = reelsContainerRef.current;
    container.addEventListener("scroll", handleScroll);

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [activeIndex, reelsData.length, setActiveIndex]);

  const handleNextVideo = () => {
    if (activeIndex < reelsData.length - 1) {
      setActiveIndex(activeIndex + 1);
      scrollToIndex(activeIndex + 1);
    }
  };

  const handlePrevVideo = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      scrollToIndex(activeIndex - 1);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full sm:max-w-md mx-auto border border-grey rounded-xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Reels container - fixed height, not taking full screen on desktop */}
      <div className="rounded-xl overflow-hidden shadow-2xl bg-black/50 backdrop-blur-sm">
        {/* Vertical scrolling container */}
        <div
          ref={reelsContainerRef}
          className="h-[65vh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {reelsData.map((video, index) => (
            <div key={video.videoId || video.id} className="reel-item h-[65vh]">
              <ReelItem
                video={video}
                isActive={index === activeIndex && isInViewport}
                onVideoEnd={handleNextVideo}
                onVideoClick={() => {}}
              />
            </div>
          ))}
        </div>
        {/* <div
          ref={reelsContainerRef}
          className="h-[70vh] sm:h-[85vh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {reelsData.map((video, index) => (
            <div key={video.id} className="reel-item h-[70vh] sm:h-[85vh]">
              <ReelItem
                video={video}
                isActive={index === activeIndex}
                onVideoEnd={handleNextVideo}
                onVideoClick={() => {}}
              />
            </div>
          ))}
        </div> */}

        {/* Custom scrollbar indicator */}
        <ReelScrollIndicator
          reelsData={reelsData}
          activeIndex={activeIndex}
          onIndicatorClick={scrollToIndex}
        />
      </div>

      {/* Navigation arrows - Only visible on large screens */}
      {isLargeScreen && (
        <ReelNavigation
          activeIndex={activeIndex}
          totalReels={reelsData.length}
          onPrev={handlePrevVideo}
          onNext={handleNextVideo}
        />
      )}

      {/* Style for hiding scrollbar */}
      <style jsx="true">{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .shadow-glow {
          box-shadow: 0 0 8px var(--color-primary);
        }
      `}</style>
    </motion.div>
  );
};

export default ReelContainer;
