import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { LETTER_STAGGER, COLORS } from "./constants";

const LETTERS = ["D", "E", "E", " ", "C", "L", "A", "S", "S"];

const AnimatedTitle = () => {
  const anims = useRef(LETTERS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      LETTER_STAGGER,
      anims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  return (
    <View style={styles.row}>
      {LETTERS.map((letter, i) => {
        if (letter === " ") {
          return <View key={i} style={styles.space} />;
        }

        const opacity = anims[i].interpolate({
          inputRange: [0, 0.4, 1],
          outputRange: [0, 1, 1],
        });
        const rotateY = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: ["-90deg", "0deg"],
        });
        const scale = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1],
        });

        return (
          <Animated.Text
            key={i}
            style={[
              styles.letter,
              {
                opacity,
                transform: [
                  { perspective: 600 },
                  { rotateY },
                  { scale },
                ],
              },
            ]}
          >
            {letter}
          </Animated.Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    fontSize: 48,
    fontWeight: "900",
    color: COLORS.primary,
  },
  space: {
    width: 18,
  },
});

export default AnimatedTitle;
