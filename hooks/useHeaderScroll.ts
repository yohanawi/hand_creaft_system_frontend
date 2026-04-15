import { useRef } from "react";
import { Animated } from "react-native";

export default function useHeaderScroll() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const onScroll = useRef(
    Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: false,
    }),
  ).current;

  return { scrollY, onScroll };
}
