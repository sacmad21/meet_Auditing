// testSpeakerColorMap.js
import { getSpeakerColor } from '../src/utils/speakerColorMap';

for (let i = 0; i < 15; i++) {
  console.log(`Speaker ${i}: ${getSpeakerColor(i)}`);
}
