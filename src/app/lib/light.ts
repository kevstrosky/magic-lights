import type { CSSProperties } from "react";
import { CHROMATIC_FAMILIES, TAILWIND_COLORS } from "./tailwind-colors";

export type Side = "top" | "right" | "bottom" | "left";

export const SIDES: Side[] = ["top", "right", "bottom", "left"];

export type LightConfig = {
  sides: Side[];
  // Each color is a Tailwind name ("indigo-500") or a hex value ("#6366f1").
  colors: string[];
  barSize: number;
  thickness: number;
  blur: number;
  opacity: number;
  animated: boolean;
  cardBg: string;
  cardBorder: string;
  radius: number;
};

export const MAX_COLORS = 6;

export const defaultConfig: LightConfig = {
  sides: ["bottom"],
  colors: ["indigo-500", "purple-500", "red-500"],
  barSize: 100,
  thickness: 4,
  blur: 8,
  opacity: 100,
  animated: true,
  cardBg: "#1c1c1c",
  cardBorder: "#3a3a3a",
  radius: 6,
};

// Card colors applied when the site theme changes.
export const CARD_THEMES = {
  dark: { cardBg: "#1c1c1c", cardBorder: "#3a3a3a" },
  light: { cardBg: "#ffffff", cardBorder: "#e4e4e7" },
} satisfies Record<string, Pick<LightConfig, "cardBg" | "cardBorder">>;

export function isTailwindColor(value: string) {
  return value in TAILWIND_COLORS;
}

export type ColorFormat = "tailwind" | "hex" | "rgb" | "hsl" | "css";

const RGB_RE =
  /^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*(?:[,/]\s*[\d.]+%?\s*)?\)$/;
const HSL_RE =
  /^hsla?\(\s*(-?[\d.]+)(?:deg)?\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%\s*(?:[,/]\s*[\d.]+%?\s*)?\)$/;

export function formatOf(value: string): ColorFormat {
  if (isTailwindColor(value)) return "tailwind";
  if (/^#[0-9a-f]{6}$/.test(value)) return "hex";
  if (RGB_RE.test(value)) return "rgb";
  if (HSL_RE.test(value)) return "hsl";
  return "css";
}

// Turns what the user typed into a stored color, or null if it isn't one.
// Accepts Tailwind names ("indigo-500", "bg-indigo-500"), hex ("#6366f1",
// "6366f1", "#63f"), rgb()/hsl(), and any other CSS color the browser knows.
export function parseColor(input: string): string | null {
  const v = input.trim().toLowerCase();
  const name = v.replace(/^(bg|from|via|to|text|border)-/, "");
  if (isTailwindColor(name)) return name;

  const hex = v.replace(/^#/, "");
  if (/^[0-9a-f]{6}$/.test(hex)) return `#${hex}`;
  if (/^[0-9a-f]{3}$/.test(hex))
    return `#${hex
      .split("")
      .map((ch) => ch + ch)
      .join("")}`;

  const rgb = v.match(RGB_RE);
  if (rgb) {
    const [r, g, b] = rgb.slice(1, 4).map(Number);
    return r <= 255 && g <= 255 && b <= 255 ? `rgb(${r}, ${g}, ${b})` : null;
  }

  const hsl = v.match(HSL_RE);
  if (hsl) {
    const h = Math.round(((Number(hsl[1]) % 360) + 360) % 360);
    const sat = Math.min(100, Number(hsl[2]));
    const light = Math.min(100, Number(hsl[3]));
    return `hsl(${h}, ${sat}%, ${light}%)`;
  }

  if (typeof CSS !== "undefined" && CSS.supports("color", v)) return v;
  return null;
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")}`;
}

function hslToRgb(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return [
    Math.round((h * 60 + 360) % 360),
    Math.round(s * 100),
    Math.round(l * 100),
  ];
}

// Resolves named/modern CSS colors (e.g. "tomato", "oklch(...)") by painting a pixel.
const resolved = new Map<string, string>();
function resolveCssColor(value: string) {
  if (typeof document === "undefined") return "#000000";
  const cached = resolved.get(value);
  if (cached) return cached;
  const ctx = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  if (!ctx) return "#000000";
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const { data } = ctx.getImageData(0, 0, 1, 1);
  const [r, g, b] = [data[0], data[1], data[2]];
  const hex = rgbToHex(r, g, b);
  resolved.set(value, hex);
  return hex;
}

export function toHex(value: string): string {
  switch (formatOf(value)) {
    case "tailwind":
      return TAILWIND_COLORS[value];
    case "hex":
      return value;
    case "rgb": {
      const [r, g, b] = value.match(RGB_RE)!.slice(1, 4).map(Number);
      return rgbToHex(r, g, b);
    }
    case "hsl": {
      const [h, s, l] = value.match(HSL_RE)!.slice(1, 4).map(Number);
      const [r, g, b] = hslToRgb(h, s, l);
      return rgbToHex(r, g, b);
    }
    case "css":
      return resolveCssColor(value);
  }
}

// The same color written as hex, rgb() or hsl().
export function convertColor(value: string, format: "hex" | "rgb" | "hsl") {
  const hex = toHex(value);
  if (format === "hex") return hex;
  const [r, g, b] = hexToRgb(hex);
  if (format === "rgb") return `rgb(${r}, ${g}, ${b})`;
  const [h, sat, l] = rgbToHsl(r, g, b);
  return `hsl(${h}, ${sat}%, ${l}%)`;
}

// CSS value for a stored color: palette names become hex, everything else is kept as written.
export function cssColor(value: string) {
  return isTailwindColor(value) ? TAILWIND_COLORS[value] : value;
}

export function isLightColor(value: string) {
  const n = parseInt(toHex(value).slice(1), 16);
  const r = n >> 16;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

type Decl = [property: string, value: string];

export type CodeBlock = { label: string; code: string };

// Picks neighbouring Tailwind hues so random gradients stay harmonious.
export function randomColors(count: number): string[] {
  const families = CHROMATIC_FAMILIES;
  const start = Math.floor(Math.random() * families.length);
  const step = 1 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, (_, i) => {
    const family = families[(start + i * step) % families.length];
    const shade = Math.random() < 0.5 ? 400 : 500;
    return `${family}-${shade}`;
  });
}

// Tailwind class for a color: a palette name when possible, arbitrary hex otherwise.
// Arbitrary values can't contain spaces, so they're stripped.
function colorClass(prefix: string, value: string) {
  return isTailwindColor(value)
    ? `${prefix}-${value}`
    : `${prefix}-[${value.replace(/\s+/g, "")}]`;
}

// from/via/to covers up to three colors; more need an arbitrary gradient.
// Color stops for a CSS gradient; a single color is repeated so the gradient stays valid.
export function gradientStops(colors: string[]) {
  const stops = colors.map(cssColor);
  return (stops.length === 1 ? [stops[0], stops[0]] : stops).join(", ");
}

function gradientTw(colors: string[], direction: "right" | "bottom") {
  if (colors.length === 1) return [colorClass("bg", colors[0])];
  if (colors.length > 3) {
    const to = direction === "right" ? "to_right" : "to_bottom";
    const stops = colors.map((c) => cssColor(c).replace(/\s+/g, "")).join(",");
    return [`bg-[linear-gradient(${to},${stops})]`];
  }
  const [first, ...rest] = colors;
  const last = rest.pop();
  return [
    `bg-gradient-to-${direction === "right" ? "r" : "b"}`,
    colorClass("from", first),
    ...rest.map((c) => colorClass("via", c)),
    ...(last ? [colorClass("to", last)] : []),
  ];
}

type Light = {
  name: Side | "around";
  tw: string[];
  css: Decl[];
  // The ring paints a nested element, so the blur on the outer one isn't masked away.
  inner?: { tw: string[]; css: Decl[] };
};

// Keeps only a frame of the padding's width: the content box is cut out of the element.
const RING_MASK =
  "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)";

// Where each light sits relative to the card. Side lights straddle the edge
// (half under the card) and are inset by the radius so they clear the corners.
// With all four sides active at full bar size, a single hollow ring of the same
// thickness goes around the card instead, so it glows as brightly as the bars.
function geometry(c: LightConfig): {
  name: Light["name"];
  tw: string[];
  css: Decl[];
  direction: "right" | "bottom";
}[] {
  // No colors, no light.
  if (!c.colors.length) return [];

  const t = c.thickness;
  const half = t / 2;
  const r = c.radius;
  // Full-size bars clear the rounded corners (capped at 30% so very round cards
  // still get a visible bar); shorter ones are centered by percentage.
  const inset =
    c.barSize < 100
      ? `${(100 - c.barSize) / 2}%`
      : r > 24
        ? `min(${r}px,30%)`
        : `${r}px`;
  const insetTw = (axis: "x" | "y") =>
    inset === "0px" ? `inset-${axis}-0` : `inset-${axis}-[${inset}]`;

  if (c.barSize === 100 && SIDES.every((side) => c.sides.includes(side))) {
    return [
      {
        name: "around",
        tw: [`-inset-[${half}px]`],
        css: [["inset", `-${half}px`]],
        direction: "right",
      },
    ];
  }

  return SIDES.filter((side) => c.sides.includes(side)).map((side) => {
    const horizontal = side === "top" || side === "bottom";
    const [start, end, size] = horizontal
      ? ["left", "right", "height"]
      : ["top", "bottom", "width"];
    return {
      name: side,
      tw: [
        insetTw(horizontal ? "x" : "y"),
        `-${side}-[${half}px]`,
        `${size[0]}-[${t}px]`,
      ],
      css: [
        [start, inset],
        [end, inset],
        [side, `-${half}px`],
        [size, `${t}px`],
      ],
      direction: horizontal ? "right" : "bottom",
    };
  });
}

export function buildLight(c: LightConfig) {
  // Shared by every light; only position and gradient direction differ.
  const sharedTw = ["pointer-events-none", "absolute"];
  const effectTw: string[] = [];
  const sharedCss: Decl[] = [
    ["pointer-events", "none"],
    ["position", "absolute"],
  ];
  // Applied to whichever element paints the gradient.
  const paintTw: string[] = [];
  const paintCss: Decl[] = [];

  if (c.blur) {
    effectTw.push(`blur-[${c.blur}px]`);
    sharedCss.push(["filter", `blur(${c.blur}px)`]);
  }
  if (c.opacity < 100) {
    effectTw.push(`opacity-[${c.opacity / 100}]`);
    sharedCss.push(["opacity", `${c.opacity / 100}`]);
  }
  if (c.animated) {
    paintTw.push("animate-text");
    paintCss.push(
      ["background-size", "200% 200%"],
      ["animation", "magic-light 5s ease infinite"],
    );
  }

  const background = (direction: "right" | "bottom"): Decl => [
    "background-image",
    `linear-gradient(to ${direction}, ${gradientStops(c.colors)})`,
  ];

  const lights: Light[] = geometry(c).map((g) => {
    if (g.name !== "around") {
      return {
        name: g.name,
        tw: [
          ...sharedTw,
          ...g.tw,
          ...gradientTw(c.colors, g.direction),
          ...effectTw,
          ...paintTw,
        ],
        css: [...g.css, background(g.direction), ...paintCss],
      };
    }
    const ringRadius = c.radius + c.thickness / 2;
    return {
      name: g.name,
      tw: [...sharedTw, ...g.tw, ...effectTw],
      css: g.css,
      inner: {
        tw: [
          "absolute",
          "inset-0",
          `rounded-[${ringRadius}px]`,
          `p-[${c.thickness}px]`,
          `[mask:${RING_MASK.replace(/ /g, "_")}]`,
          ...gradientTw(c.colors, "right"),
          ...paintTw,
        ],
        css: [
          ["position", "absolute"],
          ["inset", "0"],
          ["box-sizing", "border-box"],
          ["border-radius", `${ringRadius}px`],
          ["padding", `${c.thickness}px`],
          ["mask", RING_MASK],
          background("right"),
          ...paintCss,
        ],
      },
    };
  });

  const bodyTw = [
    "relative",
    "z-10",
    "h-full",
    `rounded-[${c.radius}px]`,
    "border",
    colorClass("border", c.cardBorder),
    colorClass("bg", c.cardBg),
    "p-4",
  ];
  const bodyCss: Decl[] = [
    ["position", "relative"],
    ["z-index", "10"],
    ["box-sizing", "border-box"],
    ["height", "100%"],
    ["border", `1px solid ${cssColor(c.cardBorder)}`],
    ["border-radius", `${c.radius}px`],
    ["background-color", cssColor(c.cardBg)],
    ["padding", "16px"],
  ];

  return { lights, sharedCss, bodyTw, bodyCss };
}

export function toStyle(decls: Decl[]): CSSProperties {
  return Object.fromEntries(
    decls.map(([p, v]) => [
      p.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase()),
      v,
    ]),
  );
}

const TAILWIND_CONFIG = `// tailwind.config.ts → theme.extend
animation: {
  text: "text 5s ease infinite",
},
keyframes: {
  text: {
    "0%, 100%": {
      "background-size": "200% 200%",
      "background-position": "left center",
    },
    "50%": {
      "background-size": "200% 200%",
      "background-position": "right center",
    },
  },
},`;

const KEYFRAMES = `@keyframes magic-light {
  0%, 100% { background-position: left center; }
  50% { background-position: right center; }
}`;

function lightJsx(l: Light, indent = "") {
  if (!l.inner) return `${indent}<div className="${l.tw.join(" ")}" />`;
  return `${indent}<div className="${l.tw.join(" ")}">
${indent}  <div className="${l.inner.tw.join(" ")}" />
${indent}</div>`;
}

export function tailwindBlocks(c: LightConfig): CodeBlock[] {
  const { lights, bodyTw } = buildLight(c);
  const lightLines = lights.map((l) => `${lightJsx(l, "  ")}\n`).join("");
  const jsx = `<div className="relative aspect-[9/16]">
${lightLines}  <div className="${bodyTw.join(" ")}">
    {/* Your content */}
  </div>
</div>`;
  const blocks = [{ label: "JSX", code: jsx }];
  if (c.animated && lights.length)
    blocks.push({ label: "tailwind.config.ts", code: TAILWIND_CONFIG });
  return blocks;
}

export function cssBlocks(c: LightConfig): CodeBlock[] {
  const { lights, sharedCss, bodyCss } = buildLight(c);
  const rule = (selector: string, decls: Decl[]) =>
    `${selector} {\n${decls.map(([p, v]) => `  ${p}: ${v};`).join("\n")}\n}`;

  const lightLines = lights
    .map((l) =>
      l.inner
        ? `  <div class="magic-card__light magic-card__light--${l.name}">\n    <div class="magic-card__ring"></div>\n  </div>\n`
        : `  <div class="magic-card__light magic-card__light--${l.name}"></div>\n`,
    )
    .join("");
  const html = `<div class="magic-card">
${lightLines}  <div class="magic-card__body">
    <!-- Your content -->
  </div>
</div>`;
  const css = [
    rule(".magic-card", [
      ["position", "relative"],
      ["aspect-ratio", "9 / 16"],
    ]),
    ...(lights.length ? [rule(".magic-card__light", sharedCss)] : []),
    ...lights.flatMap((l) => [
      rule(`.magic-card__light--${l.name}`, l.css),
      ...(l.inner ? [rule(".magic-card__ring", l.inner.css)] : []),
    ]),
    rule(".magic-card__body", bodyCss),
    ...(c.animated && lights.length ? [KEYFRAMES] : []),
  ].join("\n\n");

  return [
    { label: "HTML", code: html },
    { label: "CSS", code: css },
  ];
}

function describeColor(value: string) {
  return isTailwindColor(value) ? `${value} (${toHex(value)})` : value;
}

// Plain-language spec of the current design, shared by both AI prompts.
function lightSpec(c: LightConfig) {
  const allSides = SIDES.every((side) => c.sides.includes(side));
  const sides = allSides
    ? c.barSize === 100
      ? "all four sides, as one continuous ring around the card"
      : "all four sides, as four separate bars"
    : c.sides.length
      ? SIDES.filter((side) => c.sides.includes(side)).join(", ")
      : "none (no light)";
  const length =
    c.barSize === 100
      ? "full length of each side, inset by the card's corner radius"
      : `${c.barSize}% of each side, centered`;
  return [
    `- Light on: ${sides}`,
    c.colors.length
      ? `- Gradient colors, in order: ${c.colors.map(describeColor).join(" → ")}`
      : "- Gradient colors: none (no light)",
    `- Bar length: ${length}`,
    `- Thickness: ${c.thickness}px, centered on the card's edge (half under the card)`,
    `- Blur: ${c.blur}px · Opacity: ${c.opacity}%`,
    c.animated
      ? "- Animation: the gradient slowly slides left ↔ right (background-size 200%, 5s ease, infinite)"
      : "- Animation: none (static gradient)",
    "- The light sits behind the card: light elements are absolute and pointer-events-none, the card is relative with a higher z-index",
  ].join("\n");
}

export function aiPromptBlocks(c: LightConfig): CodeBlock[] {
  const { lights } = buildLight(c);
  const [jsx] = tailwindBlocks(c);
  const lightLines = lights.map((l) => lightJsx(l)).join("\n");
  const animationNote = c.animated
    ? `\n\nThe \`animate-text\` class needs this in the Tailwind config (or an equivalent @keyframes in CSS):\n\n${TAILWIND_CONFIG}`
    : "";

  const component = `Create a reusable React component called \`MagicLightCard\` that wraps any content in a card with a glowing gradient light on its edges. Use Tailwind CSS; if the project doesn't use Tailwind, translate it to the project's styling approach.

Design spec:
${lightSpec(c)}
- Card: background ${describeColor(c.cardBg)}, 1px border ${describeColor(c.cardBorder)}, ${c.radius}px corner radius, 16px padding

Props:
- \`children\`: the card content
- \`className\`: extra classes for the card
- Optional overrides for the colors and which sides are lit, defaulting to the spec above

Reference markup:

${jsx.code}${animationNote}

Match the project's existing conventions (file location, TypeScript or not, naming) and export the component so it can be used anywhere.`;

  const existing = `Add a glowing gradient light to an existing card in my project: [describe the card or give the file path].

Keep the card's content, layout and current styles. Only add the light around it.

Design spec:
${lightSpec(c)}

How to apply it:
1. Wrap the card in a container with \`relative\` (or reuse an existing wrapper).
2. Add the light element(s) as siblings placed before the card inside that wrapper.
3. Make the card \`relative z-10\` so it stays above the light.
4. If the card's corner radius isn't ${c.radius}px, adjust the light's inset/rounding to match it.

Light elements (Tailwind):

${lightLines || "<!-- No sides are lit in the current design -->"}${animationNote}`;

  return [
    { label: "Reusable component", code: component },
    { label: "Apply to an existing card", code: existing },
  ];
}
