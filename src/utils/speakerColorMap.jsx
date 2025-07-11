// src/utils/speakerColorMap.js

const COLORS = [
  "#DCF8C6", // Light green
  "#E6E6FA", // Lavender
  "#FFF0F5", // Lavender blush
  "#FFEBCC", // Light orange
  "#E0FFFF", // Light cyan
  "#FDE2E4", // Light pink
  "#D3F8E2", // Mint
  "#E4C1F9", // Lilac
  "#C1F9E4", // Aqua green
  "#F9E4C1"  // Pale yellow
];

export function getSpeakerColor(speakerId) {
  return COLORS[speakerId % COLORS.length];
}
