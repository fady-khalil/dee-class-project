import { Dimensions } from "react-native";
import COLORS from "../../styles/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Letter-by-letter stagger
export const LETTER_STAGGER = 60;

// Logo + fade out
export const LOGO_FADE_DELAY = 1600;
export const LOGO_FADE_DURATION = 600;
export const FADE_OUT_DELAY = 2400;
export const FADE_OUT_DURATION = 500;

export { SCREEN_WIDTH, SCREEN_HEIGHT, COLORS };
