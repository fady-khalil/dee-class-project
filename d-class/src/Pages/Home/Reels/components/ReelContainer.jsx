import React, { useRef, useEffect } from "react";
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

  useEffect(() => {
    if (!reelsContainerRef.current) return;

    const handleScroll = () => {
      if (reelsContainerRef.current) {
        const container = reelsContainerRef.current;
        const scrollPosition = container.scrollTop;
        const item = container.querySelector(".reel-item");
        if (!item) return;
        const itemHeight = item.offsetHeight;
        const index = Math.round(scrollPosition / itemHeight);

        if (index !== activeIndex && index >= 0 && index < reelsData.length) {
          setActiveIndex(index);
        }
      }
    };

    const container = reelsContainerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
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
    <div className="relative w-full sm:max-w-md mx-auto border border-grey rounded-xl">
      <div className="rounded-xl overflow-hidden shadow-2xl bg-black/50">
        <div
          ref={reelsContainerRef}
          className="h-[65vh] overflow-y-scroll scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {reelsData.map((video, index) => (
            <div key={video.videoId || video.id} className="reel-item h-[65vh]">
              <ReelItem
                video={video}
                isCurrent={index === activeIndex}
                onVideoEnd={handleNextVideo}
              />
            </div>
          ))}
        </div>

        <ReelScrollIndicator
          reelsData={reelsData}
          activeIndex={activeIndex}
          onIndicatorClick={scrollToIndex}
        />
      </div>

      {isLargeScreen && (
        <ReelNavigation
          activeIndex={activeIndex}
          totalReels={reelsData.length}
          onPrev={handlePrevVideo}
          onNext={handleNextVideo}
        />
      )}
    </div>
  );
};

export default ReelContainer;
