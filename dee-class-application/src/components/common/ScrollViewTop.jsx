import React, { useRef, useCallback } from "react";
import { ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const ScrollViewTop = React.forwardRef((props, ref) => {
  const innerRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      innerRef.current?.scrollTo?.({ y: 0, animated: false });
    }, [])
  );

  return (
    <ScrollView
      {...props}
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
    />
  );
});

export default ScrollViewTop;
