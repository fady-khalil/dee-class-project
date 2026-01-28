import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Dimensions,
  FlatList,
  StyleSheet,
  Animated,
  StatusBar,
} from "react-native";
import ReelItem from "./ReelItem";
import ReelScrollIndicator from "./ReelScrollIndicator";
import COLORS from "../../../styles/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ReelContainer = ({ reelsData, activeIndex, setActiveIndex }) => {
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(activeIndex);

  // Update local currentIndex whenever external activeIndex changes
  useEffect(() => {
    if (activeIndex !== currentIndex) {
      setCurrentIndex(activeIndex);
    }
  }, [activeIndex]);

  // Scroll to the active index whenever it changes
  useEffect(() => {
    if (flatListRef.current && currentIndex !== undefined && reelsData) {
      flatListRef.current.scrollToIndex({
        index: currentIndex,
        animated: true,
        viewPosition: 0,
      });
    }
  }, [currentIndex, reelsData]);

  // Use a more reliable viewability configuration to detect active items
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80, // Item must be 80% visible to be considered active
    minimumViewTime: 200, // Must be visible for at least 200ms
  }).current;

  // This function is called when items become visible in the viewport
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== undefined && newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        setActiveIndex(newIndex); // Update parent component's index
        console.log("Active reel changed to:", newIndex);
      }
    }
  }).current;

  const scrollToIndex = (index) => {
    if (flatListRef.current && index >= 0 && index < reelsData.length) {
      try {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0,
        });
        setCurrentIndex(index);
        setActiveIndex(index);
      } catch (error) {
        console.log("Error scrolling to index:", error);
      }
    }
  };

  const handleNextVideo = () => {
    if (currentIndex < reelsData.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  // Use full screen height plus statusbar height for each item to avoid white space
  const getItemHeight = () => {
    const statusBarHeight = StatusBar.currentHeight || 0;
    return screenHeight + statusBarHeight;
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={reelsData}
        renderItem={({ item, index }) => (
          <ReelItem
            video={item}
            isActive={index === currentIndex}
            onVideoEnd={handleNextVideo}
            height={getItemHeight()}
          />
        )}
        keyExtractor={(item) => item._id?.toString() || item.videoId}
        showsVerticalScrollIndicator={false}
        snapToInterval={getItemHeight()}
        snapToAlignment="start"
        decelerationRate={"fast"}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        pagingEnabled={true}
        windowSize={3}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => ({
          length: getItemHeight(),
          offset: getItemHeight() * index,
          index,
        })}
        bounces={false}
        initialScrollIndex={activeIndex}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 1,
        }}
      />

      <ReelScrollIndicator
        reelsData={reelsData}
        activeIndex={currentIndex}
        onIndicatorClick={scrollToIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});

export default ReelContainer;
