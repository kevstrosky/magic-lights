"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Blend,
  Check,
  Copy,
  Droplet,
  Moon,
  MoveVertical,
  PanelRight,
  PanelRightOpen,
  Percent,
  Plus,
  Square,
  Sun,
} from "lucide-react";
import Card from "./card";
import ColorField from "./color-field";
import ScrubInput from "./scrub-input";
import SidePicker from "./side-picker";
import { setTheme } from "../lib/theme";
import {
  aiPromptBlocks,
  CARD_THEMES,
  cssBlocks,
  defaultConfig,
  MAX_COLORS,
  SIDES,
  randomColors,
  toHex,
  tailwindBlocks,
  type CodeBlock,
  type LightConfig,
  type Side,
} from "../lib/light";

const EASE = [0.22, 1, 0.36, 1] as const;

const COLOR_LABELS = ["Primary color", "Secondary color"];

// Side-by-side panels (and a horizontal open/close animation) from xl up.
function useIsWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(min-width: 1280px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return wide;
}

// `footer` renders at the bottom of the card example.
export default function Editor({ footer }: { footer?: ReactNode }) {
  const [config, setConfig] = useState<LightConfig>(defaultConfig);
  const update = <K extends keyof LightConfig>(key: K, value: LightConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));
  const randomize = () =>
    setConfig((c) => ({ ...c, colors: randomColors(c.colors.length) }));
  const setColor = (index: number, value: string) =>
    setConfig((c) => ({
      ...c,
      colors: c.colors.map((color, i) => (i === index ? value : color)),
    }));
  const addColor = () =>
    setConfig((c) => ({
      ...c,
      colors: [...c.colors, randomColors(1)[0]].slice(0, MAX_COLORS),
    }));
  const removeColor = (index: number) =>
    setConfig((c) => ({
      ...c,
      colors: c.colors.filter((_, i) => i !== index),
    }));
  const toggleSide = (side: Side) =>
    setConfig((c) => ({
      ...c,
      sides: c.sides.includes(side)
        ? c.sides.filter((s) => s !== side)
        : [...c.sides, side],
    }));
  const [showCode, setShowCode] = useState(true);
  const wide = useIsWide();

  const [dark, setDark] = useState(true);

  // Keep the card and the theme switch in step with the site theme.
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const isDark = root.classList.contains("dark");
      setDark(isDark);
      setConfig((c) => ({ ...c, ...CARD_THEMES[isDark ? "dark" : "light"] }));
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const gradient = `linear-gradient(to right, ${config.colors.map(toHex).join(", ")})`;
  const collapsed = wide ? { width: 0 } : { height: 0 };
  const expanded = wide ? { width: "auto" } : { height: "auto" };

  return (
    <div className="flex w-full max-w-[1440px] flex-col items-center gap-10 px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1
          className={`select-none bg-clip-text text-4xl font-bold text-transparent ${
            config.animated ? "animate-text" : ""
          }`}
          style={{ backgroundImage: gradient }}
        >
          Magic lights for your cards
        </h1>
        <p className="text-balance text-base text-ui-muted sm:text-lg">
          Design glowing gradient borders for your cards, then copy the Tailwind
          CSS or plain CSS code.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
        <div className="my-6 w-full shrink-0 md:max-w-[340px] lg:sticky lg:top-6 lg:my-0">
          <Card config={config} onRandom={randomize} footer={footer} />
        </div>

        {/* One bordered shell; the code side slides out of it. */}
        <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-md border border-ui-line lg:sticky lg:top-6 lg:flex-1 xl:h-[calc(340px*16/9)] xl:w-auto xl:flex-none xl:flex-row">
          <section className="flex min-h-0 flex-col gap-6 bg-ui-config px-5 pb-5 xl:pb-24 xl:w-[360px] xl:shrink-0 xl:overflow-y-auto">
            {/* Pinned while the panel scrolls; it carries the panel's top padding so nothing shows above it. */}
            <div className="sticky top-0 z-10 -mx-5 -mb-2 flex items-center justify-between bg-ui-config px-5 py-2.5">
              <h2 className="text-lg font-semibold text-ui-fg">
                Light configuration
              </h2>
              <button
                onClick={() => setShowCode((v) => !v)}
                aria-label={showCode ? "Hide code" : "Show code"}
                title={showCode ? "Hide code" : "Show code"}
                className="-my-1.5 hidden rounded-md p-1.5 text-ui-muted transition-colors hover:bg-ui-hover hover:text-ui-fg xl:block"
              >
                {showCode ? (
                  <PanelRight size={18} strokeWidth={1.75} />
                ) : (
                  <PanelRightOpen size={18} strokeWidth={1.75} />
                )}
              </button>
            </div>
            <Group>
              <Field label="Border">
                <SidePicker
                  sides={config.sides}
                  onToggle={toggleSide}
                  onSetAll={(on) => update("sides", on ? [...SIDES] : [])}
                />
              </Field>

              <Divider />

              <Field label="Color">
                <div className="flex flex-col gap-3">
                  {config.colors.map((color, i) => (
                    <ColorField
                      key={i}
                      label={COLOR_LABELS[i] ?? `Color ${i + 1}`}
                      value={color}
                      onChange={(v) => setColor(i, v)}
                      onRemove={i >= 2 ? () => removeColor(i) : undefined}
                    />
                  ))}
                  {config.colors.length < MAX_COLORS && (
                    <button
                      type="button"
                      onClick={addColor}
                      className="flex h-8 items-center justify-center gap-1.5 rounded-md bg-ui-surface text-xs font-medium text-ui-muted transition-colors hover:bg-ui-hover hover:text-ui-fg"
                    >
                      <Plus size={14} />
                      Add color
                    </button>
                  )}
                </div>
              </Field>

              <Divider />

              <Field label="Glow">
                <div className="grid grid-cols-2 gap-3">
                  <ScrubInput
                    label="Bar size"
                    icon={<Percent size={14} />}
                    value={config.barSize}
                    min={10}
                    max={100}
                    unit="%"
                    onChange={(v) => update("barSize", v)}
                  />
                  <ScrubInput
                    label="Thickness"
                    icon={<MoveVertical size={14} />}
                    value={config.thickness}
                    min={1}
                    max={64}
                    unit="px"
                    onChange={(v) => update("thickness", v)}
                  />
                  <ScrubInput
                    label="Blur"
                    icon={<Droplet size={14} />}
                    value={config.blur}
                    min={0}
                    max={100}
                    unit="px"
                    onChange={(v) => update("blur", v)}
                  />
                  <ScrubInput
                    label="Opacity"
                    icon={<Blend size={14} />}
                    value={config.opacity}
                    min={10}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={(v) => update("opacity", v)}
                  />
                </div>
              </Field>

              <div className="flex items-center gap-3">
                <span
                  id="animated-label"
                  className="text-sm font-medium text-ui-soft"
                >
                  Animated
                </span>
                <Toggle
                  labelledBy="animated-label"
                  checked={config.animated}
                  onChange={(on) => update("animated", on)}
                />
              </div>
            </Group>

            <Divider />

            <Field label="Card">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3">
                  <ColorField
                    label="Background"
                    value={config.cardBg}
                    onChange={(v) => update("cardBg", v)}
                  />
                  <ColorField
                    label="Border"
                    value={config.cardBorder}
                    onChange={(v) => update("cardBorder", v)}
                  />
                </div>
                <ScrubInput
                  label="Radius"
                  icon={<Square size={14} />}
                  value={config.radius}
                  min={0}
                  max={170}
                  unit="px"
                  onChange={(v) => update("radius", v)}
                />
              </div>
            </Field>

            <Divider />

            <Field label="Theme mode">
              <div className="grid grid-cols-2 gap-1 rounded-md bg-ui-surface p-1">
                {[
                  { isDark: false, label: "Light mode", Icon: Sun },
                  { isDark: true, label: "Dark mode", Icon: Moon },
                ].map(({ isDark, label, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={dark === isDark}
                    onClick={() => setTheme(isDark)}
                    className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium transition-colors ${
                      dark === isDark
                        ? "bg-ui-active text-ui-fg shadow-sm"
                        : "text-ui-muted hover:text-ui-fg"
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </Field>
          </section>

          <AnimatePresence initial={false}>
            {/* Below xl the code is always shown under the configuration. */}
            {(showCode || !wide) && (
              <motion.section
                key="code"
                initial={collapsed}
                animate={expanded}
                exit={collapsed}
                transition={{ duration: 0.45, ease: EASE }}
                className="min-h-0 shrink-0 overflow-hidden bg-ui-codepanel"
              >
                {/* Fixed width so the content is revealed, not squeezed, while it opens. */}
                <div className="h-full overflow-y-auto px-5 pb-5 xl:w-[clamp(320px,calc(100vw-820px),560px)]">
                  <CodeOutput config={config} />
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      {title && (
        <h2 className="text-xs font-bold uppercase tracking-widest text-ui-subtle">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  labelledBy,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelledBy: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#2C88FF]" : "bg-[var(--ui-surface-2)]"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

function Divider() {
  return (
    <hr className="h-px w-full shrink-0 border-0 bg-[var(--ui-divider)]" />
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ui-soft">{label}</span>
      {children}
    </div>
  );
}

const TABS = {
  tailwind: { label: "Tailwind", blocks: tailwindBlocks },
  css: { label: "Plain CSS", blocks: cssBlocks },
  ai: { label: "AI prompt", blocks: aiPromptBlocks },
};

function CodeOutput({ config }: { config: LightConfig }) {
  const [tab, setTab] = useState<keyof typeof TABS>("tailwind");
  const blocks = TABS[tab].blocks(config);

  return (
    <Group>
      <h2 className="sticky top-0 z-10 -mx-5 bg-ui-codepanel px-5 py-2.5 text-lg font-semibold text-ui-fg">
        Code
      </h2>
      <div className="grid grid-cols-3 gap-1 rounded-md border border-ui-line bg-ui-surface p-1">
        {(Object.keys(TABS) as (keyof typeof TABS)[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded py-1.5 text-xs font-medium transition-colors ${
              tab === t
                ? "bg-ui-active text-ui-fg shadow-sm"
                : "text-ui-muted hover:text-ui-fg"
            }`}
          >
            {TABS[t].label}
          </button>
        ))}
      </div>
      {blocks.map((block) => (
        <CodeView key={block.label} {...block} />
      ))}
    </Group>
  );
}

function CodeView({ label, code }: CodeBlock) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="overflow-hidden rounded-md border border-ui-line bg-ui-code">
      <div className="flex items-center justify-between border-b border-ui-line px-3 py-1.5">
        <span className="font-mono text-xs text-ui-subtle">{label}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-ui-soft transition-colors hover:bg-ui-hover hover:text-ui-fg"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-xs leading-relaxed text-ui-soft">
        <code>{code}</code>
      </pre>
    </div>
  );
}
