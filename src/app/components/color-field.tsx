"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Hash, Minus } from "lucide-react";
import {
  convertColor,
  formatOf,
  parseColor,
  toHex,
  type ColorFormat,
} from "../lib/light";
import { TAILWIND_COLORS } from "../lib/tailwind-colors";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
};

const NAMES = Object.keys(TAILWIND_COLORS);

const FORMAT_LABEL: Record<ColorFormat, string> = {
  tailwind: "Tailwind",
  hex: "HEX",
  rgb: "RGB",
  hsl: "HSL",
  css: "CSS",
};

const FORMATS = ["hex", "rgb", "hsl"] as const;

type Item =
  | { kind: "format"; format: (typeof FORMATS)[number]; value: string }
  | { kind: "tailwind"; name: string };

// Text field for a color: Tailwind name, hex, rgb(), hsl() or any CSS color.
// The format button opens a menu to rewrite the color as HEX/RGB/HSL or pick
// from the Tailwind palette; the swatch opens the native picker.
export default function ColorField({
  label,
  value,
  onChange,
  onRemove,
}: Props) {
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => setText(value), [value]);

  const parsed = parseColor(text);
  // Follows the text as it's typed, falling back to the saved color.
  const format = formatOf(parsed ?? value);
  const query = text
    .trim()
    .toLowerCase()
    .replace(/^(bg|from|via|to|text|border)-/, "");
  const matches =
    text === value || !query ? NAMES : NAMES.filter((n) => n.includes(query));

  const formatItems: Item[] = FORMATS.map((f) => ({
    kind: "format",
    format: f,
    value: convertColor(value, f),
  }));
  const tailwindItems: Item[] = matches.map((name) => ({
    kind: "tailwind",
    name,
  }));
  const items = [...formatItems, ...tailwindItems];

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${highlight}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const type = (next: string) => {
    setText(next);
    setOpen(true);
    setHighlight(formatItems.length);
    const color = parseColor(next);
    if (color) onChange(color);
  };

  const pick = (item: Item) => {
    const next = item.kind === "format" ? item.value : item.name;
    setText(next);
    onChange(next);
    setOpen(false);
  };

  const toggleMenu = () => {
    // Focusing opens the menu (and lets a click outside close it again).
    if (document.activeElement !== inputRef.current) inputRef.current?.focus();
    else setOpen((o) => !o);
  };

  const renderItem = (item: Item, index: number) => {
    const active =
      item.kind === "format" ? format === item.format : item.name === value;
    return (
      <li
        key={item.kind === "format" ? item.format : item.name}
        data-index={index}
        role="option"
        aria-selected={active}
        onClick={() => pick(item)}
        onMouseEnter={() => setHighlight(index)}
        className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 font-mono text-xs ${
          index === highlight ? "bg-ui-hover text-ui-fg" : "text-ui-soft"
        }`}
      >
        {item.kind === "format" ? (
          <>
            <span className="w-8 shrink-0 font-sans text-[10px] font-bold tracking-wide text-ui-muted">
              {FORMAT_LABEL[item.format]}
            </span>
            <span className="truncate">{item.value}</span>
          </>
        ) : (
          <>
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-sm"
              style={{ backgroundColor: TAILWIND_COLORS[item.name] }}
            />
            {item.name}
          </>
        )}
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-xs text-ui-muted">
        {label}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="flex items-center gap-1 rounded px-1 py-0.5 text-[11px] text-ui-subtle transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Minus size={12} />
            Remove
          </button>
        )}
      </span>

      <div className="relative">
        <div className="flex h-8 items-center gap-3 overflow-hidden rounded-md bg-ui-surface pl-2">
          <label
            className="relative h-5 w-5 shrink-0 cursor-pointer overflow-hidden rounded"
            style={{ backgroundColor: toHex(value) }}
            title="Pick a custom color"
          >
            <input
              type="color"
              value={toHex(value)}
              onChange={(e) => {
                setText(e.target.value);
                onChange(e.target.value);
              }}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>

          <input
            ref={inputRef}
            aria-label={label}
            value={text}
            spellCheck={false}
            onChange={(e) => type(e.target.value)}
            onFocus={() => {
              setOpen(true);
              setHighlight(0);
            }}
            onBlur={() => {
              setOpen(false);
              if (!parsed) setText(value);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
                setHighlight((h) => Math.min(h + 1, items.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlight((h) => Math.max(h - 1, 0));
              } else if (e.key === "Enter" && open && items[highlight]) {
                e.preventDefault();
                pick(items[highlight]);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className="w-full min-w-0 bg-transparent pr-2 font-mono text-xs text-ui-fg outline-none"
          />

          {/* Current format plus the menu chevron, as one compact button. */}
          <button
            type="button"
            tabIndex={-1}
            aria-label={`${FORMAT_LABEL[format]} color. Show formats and Tailwind colors`}
            title={`${FORMAT_LABEL[format]} color`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggleMenu}
            className="flex h-full w-11 shrink-0 items-center justify-center gap-0.5 bg-[var(--ui-surface-2)] text-ui-soft transition-colors hover:text-ui-fg"
          >
            <span className="flex w-5 justify-center">
              {format === "tailwind" ? (
                <TailwindIcon />
              ) : format === "hex" ? (
                <Hash size={13} />
              ) : (
                <span className="text-[8px] font-bold tracking-wide">
                  {FORMAT_LABEL[format]}
                </span>
              )}
            </span>
            <ChevronDown
              size={12}
              className={`shrink-0 text-ui-subtle transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {open && (
          <ul
            ref={listRef}
            role="listbox"
            onMouseDown={(e) => e.preventDefault()}
            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-md bg-[var(--ui-menu)] p-1 shadow-lg shadow-black/10 ring-1 ring-ui-line dark:shadow-black/40 dark:ring-0"
          >
            <MenuHeading>Format</MenuHeading>
            {formatItems.map((item, i) => renderItem(item, i))}
            {tailwindItems.length > 0 && <MenuHeading>Tailwind</MenuHeading>}
            {tailwindItems.map((item, i) =>
              renderItem(item, formatItems.length + i),
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

function MenuHeading({ children }: { children: string }) {
  return (
    <li
      role="presentation"
      className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-ui-subtle first:pt-1"
    >
      {children}
    </li>
  );
}

function TailwindIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#38bdf8" aria-hidden>
      <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
    </svg>
  );
}
