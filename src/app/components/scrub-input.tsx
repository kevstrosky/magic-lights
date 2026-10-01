"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";

type Props = {
  label: string;
  icon: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
};

// Pixels of horizontal drag needed to sweep the whole range.
const DRAG_RANGE = 200;

// A number field you can drag left/right to change (like Figma), or click to type into.
export default function ScrubInput({
  label,
  icon,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: Props) {
  const [text, setText] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(
    null,
  );

  useEffect(() => setText(String(value)), [value]);

  const clamp = (v: number) =>
    Math.min(max, Math.max(min, Math.round(v / step) * step));

  const commit = () => {
    const n = Number(text);
    if (Number.isFinite(n) && text.trim() !== "") onChange(clamp(n));
    else setText(String(value));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Let text selection work once the field is being edited.
    if (document.activeElement === inputRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, start: value, moved: false };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const delta = e.clientX - d.x;
    if (Math.abs(delta) > 2) d.moved = true;
    if (d.moved) onChange(clamp(d.start + (delta / DRAG_RANGE) * (max - min)));
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) inputRef.current?.select();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-ui-muted">{label}</span>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        title="Drag left or right to adjust"
        className="relative flex h-8 cursor-ew-resize touch-none select-none items-center overflow-hidden rounded-md bg-ui-surface"
      >
        <span className="relative flex h-full w-8 shrink-0 items-center justify-center bg-[var(--ui-surface-2)] text-ui-muted">
          {icon}
        </span>
        <input
          ref={inputRef}
          aria-label={label}
          inputMode="numeric"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              onChange(clamp(value + (e.key === "ArrowUp" ? step : -step)));
            }
          }}
          className="relative w-full min-w-0 cursor-ew-resize bg-transparent pl-3 font-mono text-xs text-ui-fg outline-none focus:cursor-text"
        />
        {unit && (
          <span className="relative pr-2.5 text-xs text-ui-subtle">{unit}</span>
        )}
      </div>
    </div>
  );
}
