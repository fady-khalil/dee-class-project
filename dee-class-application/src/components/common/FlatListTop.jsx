import React, { useRef, useCallback } from "react";
import { FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const FlatListTop = React.forwardRef((props, ref) => {
  const innerRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      innerRef.current?.scrollToOffset?.({ offset: 0, animated: false });
    }, [])
  );

  return (
    <FlatList
      {...props}
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
    />
  );
});

export default FlatListTop;
