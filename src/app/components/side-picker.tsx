"use client";

import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { SIDES, type Side } from "../lib/light";

type Props = {
  sides: Side[];
  onToggle: (side: Side) => void;
  onSetAll: (on: boolean) => void;
};

const SPOT = 120;

// Width of the gutter around the square where the bars sit.
const GUTTER = 20;

// Hit areas fill the gutter and are wider than the visible 4×60px bars so they're easy to click.
const HIT_AREA: Record<Side, CSSProperties> = {
  top: { top: 0, left: "50%", width: 92, height: GUTTER, marginLeft: -46 },
  bottom: {
    bottom: 0,
    left: "50%",
    width: 92,
    height: GUTTER,
    marginLeft: -46,
  },
  left: { left: 0, top: "50%", width: GUTTER, height: 92, marginTop: -46 },
  right: { right: 0, top: "50%", width: GUTTER, height: 92, marginTop: -46 },
};

export default function SidePicker({ sides, onToggle, onSetAll }: Props) {
  const squareRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<Side | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spotX = useSpring(x, { stiffness: 350, damping: 35 });
  const spotY = useSpring(y, { stiffness: 350, damping: 35 });

  const onMove = (e: MouseEvent) => {
    const box = squareRef.current!.getBoundingClientRect();
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    x.set(px - SPOT / 2);
    y.set(py - SPOT / 2);

    // The side the pointer is closest to, relative to the square's size.
    const distance: Record<Side, number> = {
      top: py / box.height,
      bottom: 1 - py / box.height,
      left: px / box.width,
      right: 1 - px / box.width,
    };
    setHovered(SIDES.reduce((a, b) => (distance[a] <= distance[b] ? a : b)));
  };

  const active = SIDES.filter((side) => sides.includes(side));

  return (
    <div className="flex flex-col gap-3">
      <div
        onMouseMove={onMove}
        onMouseLeave={() => setHovered(null)}
        onClick={() => hovered && onToggle(hovered)}
        className="relative mx-auto w-full max-w-[160px] cursor-pointer select-none"
        style={{ padding: GUTTER }}
      >
        <div
          ref={squareRef}
          className="relative aspect-square overflow-hidden rounded-md"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, var(--picker-from), var(--picker-to))",
          }}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 rounded-full"
            style={{
              width: SPOT,
              height: SPOT,
              x: spotX,
              y: spotY,
              backgroundImage:
                "radial-gradient(circle, var(--picker-spot) 0%, transparent 70%)",
            }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />

          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-medium text-[color:var(--picker-hint)]">
            Click an edge
          </span>
        </div>

        {SIDES.map((side) => {
          const on = sides.includes(side);
          const horizontal = side === "top" || side === "bottom";
          return (
            <button
              key={side}
              type="button"
              aria-label={`${side} light`}
              aria-pressed={on}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(side);
              }}
              className="absolute flex items-center justify-center"
              style={HIT_AREA[side]}
            >
              <span
                className={`block rounded-full transition-all duration-200 ${
                  horizontal ? "h-[4px] w-[60px]" : "h-[60px] w-[4px]"
                } ${hovered === side ? (horizontal ? "scale-x-110" : "scale-y-110") : ""}`}
                style={{
                  backgroundColor: on
                    ? "var(--picker-bar-active)"
                    : hovered === side
                      ? "var(--picker-bar-hover)"
                      : "var(--picker-bar)",
                }}
              />
            </button>
          );
        })}
      </div>

      <div className="flex min-h-7 flex-wrap items-center gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {active.map((side) => (
            <motion.button
              key={side}
              layout
              type="button"
              title={`Remove ${side} light`}
              onClick={() => onToggle(side)}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <SideIcon sides={[side]} />
            </motion.button>
          ))}
        </AnimatePresence>
        {active.length === 0 && (
          <span className="text-xs text-ui-muted">No lights active</span>
        )}

        <button
          type="button"
          onClick={() => onSetAll(active.length < SIDES.length)}
          aria-pressed={active.length === SIDES.length}
          title={
            active.length === SIDES.length
              ? "Turn off all sides"
              : "Turn on all sides"
          }
          className="ml-auto flex items-center gap-2 rounded-md py-0.5 pl-2 text-xs font-medium text-ui-muted transition-colors hover:text-ui-fg"
        >
          {active.length === SIDES.length ? "Clear all" : "All sides"}
          <SideIcon sides={active} showInactive />
        </button>
      </div>
    </div>
  );
}

const BAR: Record<
  Side,
  { x: number; y: number; width: number; height: number }
> = {
  top: { x: 9, y: 3, width: 10, height: 2 },
  right: { x: 23, y: 9, width: 2, height: 10 },
  bottom: { x: 9, y: 23, width: 10, height: 2 },
  left: { x: 3, y: 9, width: 2, height: 10 },
};

// Active sides are drawn blue; with showInactive the rest are drawn gray.
function SideIcon({
  sides,
  showInactive = false,
}: {
  sides: Side[];
  showInactive?: boolean;
}) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect width="28" height="28" rx="2" fill="var(--icon-frame)" />
      <rect x="6" y="6" width="16" height="16" rx="2" fill="var(--icon-inner)" />
      {SIDES.map((side) =>
        sides.includes(side) ? (
          <rect
            key={side}
            {...BAR[side]}
            rx="1"
            fill="#2C88FF"
            className="transition-colors"
          />
        ) : showInactive ? (
          <rect
            key={side}
            {...BAR[side]}
            rx="1"
            fill="var(--icon-off)"
            className="transition-colors"
          />
        ) : null,
      )}
    </svg>
  );
}
