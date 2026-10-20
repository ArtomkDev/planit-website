export type AsciiFigure = "calendar" | "palette" | "checklist" | "clock" | "sharing" | "devices";
type Point = readonly [number, number];
type Stroke = readonly Point[];
export interface AsciiGlyph { x: number; y: number; ink: number; tint: number; seed: number }
export interface GlyphPose { x: number; y: number; alpha: number; progress: number }
export interface GlyphRelay { from: AsciiGlyph; to: AsciiGlyph; start: number; duration: number; bend: number }
export const ASCII_CHARACTERS = ".:+-=/*<>[]01";

/** Sparse punctuation in the halo, fuller mathematical marks along the contour. */
export function getAsciiGlyphIndex(seed: number, ink: number, elapsed: number, activity = 0) {
  const alphabet = ink < .09 ? ".:+" : ink < .36 ? ":+-=/" : "01=+/*<>[]";
  const resting = alphabet[Math.floor(glyphNoise(seed + 211) * alphabet.length)];
  if (activity > glyphNoise(seed + 307)) {
    const beat = Math.floor(elapsed / (75 + glyphNoise(seed + 401) * 85));
    return Math.floor(glyphNoise(seed + beat * 31) * ASCII_CHARACTERS.length);
  }
  return ASCII_CHARACTERS.indexOf(resting);
}

export interface AsciiFlight { from: number; to: number; started: number; duration: number }
export interface AsciiArrival { index: number; started: number | null }
export interface AsciiMotion { settled: number; requested: number; flight: AsciiFlight | null; arrival?: AsciiArrival }
export const ASCII_FLIGHT_DURATION = 1700;
export const ASCII_ASSEMBLY_DURATION = 1500;

/** A distant jump starts its own visible arrival, with no journey through skipped sections. */
export function beginAsciiArrival(index: number): AsciiMotion {
  return { settled: index, requested: index, flight: null, arrival: { index, started: null } };
}

export function advanceAsciiArrival(state: AsciiMotion, now: number, visible: boolean): AsciiMotion {
  const arrival = state.arrival;
  if (!arrival) return state;
  if (arrival.started === null) return visible ? { ...state, arrival: { ...arrival, started: now - 90 } } : state;
  if (now - arrival.started < ASCII_ASSEMBLY_DURATION) return state;
  return { settled: state.settled, requested: state.requested, flight: null };
}

export function shouldAssembleAsciiLocally(from: number, to: number, sourceCentre: number, scroll: number, height: number) {
  return Math.abs(to - from) > 1 || sourceCentre - scroll < -height * .25 || sourceCentre - scroll > height * 1.25;
}

export function getAsciiFigureForSection(id: string) {
  if (id === "top" || id === "features") return 0;
  if (id === "get-started") return ASCII_SCENES.length - 1;
  const index = ASCII_SCENES.findIndex(scene => scene.id === id);
  return index < 0 ? null : index;
}

/** Keep the flight readable; fast skips use a local arrival instead of crushing this timeline. */
export function getAsciiFlightBudget(scroll: number, centre: number, height: number, velocity: number) {
  if (Math.abs(velocity) < .08) return ASCII_FLIGHT_DURATION;
  const distance = velocity > 0 ? centre - scroll - height * .42 : height * .62 - (centre - scroll);
  return Math.min(ASCII_FLIGHT_DURATION, Math.max(1200, distance / Math.abs(velocity) + 650));
}

function shortenAsciiFlight(flight: AsciiFlight, now: number, remainingBudget: number) {
  const progress = getAsciiFlightProgress(flight, now);
  if (progress >= 1 || flight.started + flight.duration - now <= remainingBudget) return flight;
  const duration = remainingBudget / (1 - progress);
  return { ...flight, started: now - progress * duration, duration };
}

/** Scroll only selects a destination. Hysteresis prevents tiny wheel reversals from retriggering it. */
export function getRequestedAsciiFigure(scroll: number, centres: number[], height: number, previous?: number) {
  const thresholds = centres.slice(1).map((centre, i) => Math.max(centres[i] - height * .3, centre - height * .94));
  if (previous === undefined) return thresholds.filter(threshold => scroll >= threshold).length;
  const margin = Math.min(70, Math.max(32, height * .035));
  let requested = Math.min(centres.length - 1, Math.max(0, previous));
  while (requested < thresholds.length && scroll >= thresholds[requested] + margin) requested++;
  while (requested > 0 && scroll < thresholds[requested - 1] - margin) requested--;
  return requested;
}

/** Shorten remaining time without changing the current pose. Queued flights land before handing off. */
export function advanceAsciiMotion(state: AsciiMotion, requested: number, now: number, animate: boolean, canDepart = true, budget = ASCII_FLIGHT_DURATION): AsciiMotion {
  if (!animate || budget <= 0) return { settled: requested, requested, flight: null };
  if (state.arrival) return state;
  let { settled, flight } = state;
  if (flight && now >= flight.started + flight.duration) {
    settled = flight.to;
    flight = null;
  }
  if (!flight && settled !== requested && canDepart) {
    flight = { from: settled, to: requested, started: now, duration: budget };
  }
  if (flight) flight = shortenAsciiFlight(flight, now, flight.to === requested ? budget : Math.min(450, budget));
  return { settled, requested, flight };
}

export function getAsciiFlightProgress(flight: AsciiFlight, now: number) {
  return clampUnit((now - flight.started) / flight.duration);
}

export const ASCII_SCENES = [
  { id: "feature-lesson", figure: "calendar" },
  { id: "feature-appearance", figure: "palette" },
  { id: "feature-tasks", figure: "checklist" },
  { id: "feature-schedule", figure: "clock" },
  { id: "everyday", figure: "sharing" },
  { id: "platforms", figure: "devices" },
] as const;

export const clampUnit = (value: number) => Math.max(0, Math.min(1, value));
export function glyphNoise(seed: number) {
  let value = Math.imul(seed + 17, 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}
function segmentDistance(x: number, y: number, a: Point, b: Point) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = clampUnit(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1));
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
}
function pathDistance(x: number, y: number, paths: readonly Stroke[]) {
  let distance = 10;
  for (const path of paths) for (let i = 1; i < path.length; i++) {
    distance = Math.min(distance, segmentDistance(x, y, path[i - 1], path[i]));
  }
  return distance;
}
function ring(x: number, y: number, cx: number, cy: number, radius: number) {
  return Math.abs(Math.hypot(x - cx, y - cy) - radius);
}
const frame: Stroke = [[-.62,-.55],[-.55,-.63],[.55,-.63],[.63,-.55],[.63,.59],[.55,.67],[-.55,.67],[-.62,.59],[-.62,-.55]];
const calendar: Stroke[] = [frame, [[-.62,-.3],[.63,-.3]], [[-.33,-.78],[-.33,-.48]], [[.33,-.78],[.33,-.48]]];
for (const y of [-.06, .22, .47]) for (const x of [-.34, 0, .34]) {
  calendar.push([[x-.035,y],[x+.035,y]]);
}
const checklist: Stroke[] = [
  [[-.54,-.7],[.32,-.7],[.61,-.41],[.61,.68],[-.54,.68],[-.54,-.7]],
  [[.32,-.7],[.32,-.41],[.61,-.41]],
];
for (const y of [-.22, .14, .49]) {
  checklist.push([[-.34,y],[-.25,y+.08],[-.09,y-.1]], [[.07,y],[.39,y]], [[.07,y+.09],[.27,y+.09]]);
}
const clock: Stroke[] = [[[0,-.44],[0,.02],[.31,.25]], [[-.17,-.86],[.17,-.86]], [[0,-.86],[0,-.69]]];
for (let i = 0; i < 12; i++) {
  const a = i * Math.PI / 6;
  clock.push([[Math.sin(a)*.57,-Math.cos(a)*.57], [Math.sin(a)*.61,-Math.cos(a)*.61]]);
}
const palette: Stroke[] = [
  [[.5,.47],[.28,.68],[-.11,.72],[-.48,.55],[-.7,.2],[-.68,-.22],[-.45,-.57],[-.1,-.74],[.28,-.68],[.57,-.44],[.68,-.1],[.57,.08],[.28,.08],[.18,.25],[.29,.44],[.5,.47]],
];
const devices: Stroke[] = [
  [[-.79,-.48],[.4,-.48],[.4,.34],[-.79,.34],[-.79,-.48]],
  [[-.79,.21],[.4,.21]], [[-.2,.34],[-.2,.58]], [[-.48,.58],[.08,.58]],
  [[.2,-.15],[.72,-.15],[.72,.7],[.2,.7],[.2,-.15]], [[.39,.58],[.54,.58]],
];
const sharing: Stroke[] = [
  [[-.48,-.42],[.48,-.42]], [[-.48,-.42],[0,.47]], [[.48,-.42],[0,.47]],
];
const paths: Record<AsciiFigure, Stroke[]> = { calendar, palette, checklist, clock, sharing, devices };
function figureDistance(figure: AsciiFigure, x: number, y: number) {
  let distance = pathDistance(x, y, paths[figure]);
  if (figure === "clock") distance = Math.min(distance, ring(x,y,0,0,.7));
  if (figure === "palette") for (const [cx, cy] of [[-.42,-.12],[-.22,-.42],[.17,-.43],[.4,-.19]]) {
    distance = Math.min(distance, ring(x,y,cx,cy,.085));
  }
  if (figure === "sharing") for (const [cx,cy] of [[-.48,-.42],[.48,-.42],[0,.47]]) {
    distance = Math.min(distance, ring(x,y,cx,cy,.19));
  }
  return distance;
}

/** Original vector silhouettes sampled onto a common typographic lattice. No raster assets. */
export function createAsciiFigure(figure: AsciiFigure, columns = 68): AsciiGlyph[] {
  const glyphs: AsciiGlyph[] = [];
  for (let row = 0; row < columns; row++) for (let col = 0; col < columns; col++) {
    const seed = row * columns + col;
    const x = (col / (columns - 1) - .5) * 2.25;
    const y = (row / (columns - 1) - .5) * 2.25;
    // A slight oblique projection gives the flat symbols depth without rotating the text.
    const distance = figureDistance(figure, x - y * .085, y / .94);
    const body = Math.exp(-Math.pow(distance / .052, 1.35));
    const halo = Math.exp(-distance * 10) * .07;
    const speck = glyphNoise(seed * 7) > .965 ? .035 : 0;
    const vignette = clampUnit((1.16 - Math.hypot(x, y)) * 3);
    const ink = Math.max(body * (.58 + glyphNoise(seed) * .42), halo, speck) * vignette;
    if (ink < .018) continue;
    glyphs.push({ x: col / (columns - 1), y: row / (columns - 1), ink, tint: clampUnit((x + 1) * .32 + (y + 1) * .18), seed });
  }
  return glyphs;
}

export function getAssemblyPose(glyph: AsciiGlyph, elapsed: number, size: number): GlyphPose {
  const delay = (1 - glyph.ink) * 140 + glyphNoise(glyph.seed + 51) * 100;
  const duration = 1000 + glyphNoise(glyph.seed + 97) * 250;
  const progress = clampUnit((elapsed - delay) / duration);
  const ease = 1 - (1 - progress) ** 3;
  const angle = glyphNoise(glyph.seed + 13) * Math.PI * 2;
  const radius = size * (.24 + glyphNoise(glyph.seed + 23) * .38);
  return {
    x: glyph.x * size + Math.cos(angle) * radius * (1 - ease) + Math.sin(progress * Math.PI) * Math.sin(glyph.seed) * size * .045,
    y: glyph.y * size + Math.sin(angle) * radius * (1 - ease),
    alpha: glyph.ink * Math.min(1, progress * 2.4), progress,
  };
}

export function createGlyphRelay(from: AsciiGlyph[], to: AsciiGlyph[]): GlyphRelay[] {
  if (!from.length || !to.length) return [];
  const sort = (points: AsciiGlyph[]) => [...points].sort((a,b) => (a.y + glyphNoise(a.seed)*.12) - (b.y + glyphNoise(b.seed)*.12));
  const a = sort(from), b = sort(to), count = Math.max(a.length, b.length);
  let lastA = -1, lastB = -1;
  return Array.from({length:count}, (_,i) => {
    const ai = Math.floor(i*a.length/count), bi = Math.floor(i*b.length/count);
    const start = i/count*.3 + glyphNoise(i+72)*.06;
    const courier = {
      from: {...a[ai], ink:ai === lastA ? 0 : a[ai].ink},
      to: {...b[bi], ink:bi === lastB ? 0 : b[bi].ink},
      start, duration:.56 + glyphNoise(i+93)*.08, bend:(glyphNoise(i+33)-.5)*260,
    };
    lastA=ai; lastB=bi;
    return courier;
  });
}

export function getRelayPose(relay: GlyphRelay, progress: number, from: {x:number;y:number;size:number}, to: {x:number;y:number;size:number}): GlyphPose {
  const local = clampUnit((progress-relay.start)/relay.duration);
  const t = local < .5 ? 4*local**3 : 1-(-2*local+2)**3/2;
  const ax = from.x+relay.from.x*from.size, ay = from.y+relay.from.y*from.size;
  const bx = to.x+relay.to.x*to.size, by = to.y+relay.to.y*to.size;
  const arc = Math.sin(t*Math.PI);
  return {
    x:ax+(bx-ax)*t+relay.bend*arc,
    y:ay+(by-ay)*t+Math.sin(relay.from.seed*.2)*22*arc,
    alpha:(relay.from.ink+(relay.to.ink-relay.from.ink)*t)*(1-arc*.28),
    progress:local,
  };
}

/** Local canvas coordinates stay in document space; scrolling is handled by the compositor. */
export function getAsciiLayerBounds(figures: {x:number;y:number;size:number}[], padding = 160) {
  const x = Math.floor(Math.min(...figures.map(figure=>figure.x))-padding);
  const y = Math.floor(Math.min(...figures.map(figure=>figure.y))-padding);
  return {
    x, y,
    width: Math.ceil(Math.max(...figures.map(figure=>figure.x+figure.size))+padding-x),
    height: Math.ceil(Math.max(...figures.map(figure=>figure.y+figure.size))+padding-y),
  };
}

/** Flights and assembly paint every display frame, including after the wheel stops. */
export function shouldPaintAsciiFrame(now: number, lastPaint: number, scrollChanged: boolean, dirty: boolean, inFlight = false) {
  return dirty || scrollChanged || inFlight || now-lastPaint>=50;
}
