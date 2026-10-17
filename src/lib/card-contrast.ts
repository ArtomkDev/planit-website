function channels(color: string) {
  if (/^#[\da-f]{6}$/i.test(color)) {
    return [1, 3, 5].map(offset => parseInt(color.slice(offset, offset + 2), 16));
  }
  const hsl = color.match(/^hsl\((-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%\)$/);
  if (!hsl) throw new Error(`Unsupported card color: ${color}`);
  const hue = ((Number(hsl[1]) % 360) + 360) % 360;
  const saturation = Number(hsl[2]) / 100;
  const lightness = Number(hsl[3]) / 100;
  const a = saturation * Math.min(lightness, 1 - lightness);
  return [0, 8, 4].map(n => {
    const k = (n + hue / 30) % 12;
    return 255 * (lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  });
}
function luminance(rgb: number[]) {
  return rgb.reduce((sum, channel, index) => {
    const value = channel / 255;
    return sum + (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][index];
  }, 0);
}
export function contrastRatio(foreground: string, background: string) {
  const a = luminance(channels(foreground));
  const b = luminance(channels(background));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// A single foreground cannot cover an arbitrary light-to-dark gradient.
// Preserve its colors with the minimum black scrim needed for white text.
export function getReadableCardStyle(colors: string[]) {
  const first = channels(colors[0]);
  const last = channels(colors[colors.length - 1]);
  const samples = Array.from({ length: 33 }, (_, index) => first.map((value, component) => value + (last[component] - value) * index / 32));
  const darkLuminance = luminance(channels("#111827"));
  if (samples.every(sample => (luminance(sample) + 0.05) / (darkLuminance + 0.05) >= 4.6)) {
    return { textColor: "#111827", scrimOpacity: 0 };
  }
  let scrimOpacity = 0;
  while (scrimOpacity < 0.8 && samples.some(sample => 1.05 / (luminance(sample.map(value => value * (1 - scrimOpacity))) + 0.05) < 4.6)) {
    scrimOpacity = Math.round((scrimOpacity + 0.01) * 100) / 100;
  }
  return { textColor: "#ffffff", scrimOpacity };
}
