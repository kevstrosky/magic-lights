import type { CSSProperties, ReactNode } from "react";
import { Shuffle } from "lucide-react";
import {
  buildLight,
  isLightColor,
  toHex,
  toStyle,
  type LightConfig,
} from "../lib/light";

type Props = {
  config: LightConfig;
  onRandom: () => void;
  footer?: ReactNode;
};

const Card = ({ config, onRandom, footer }: Props) => {
  const { lights, sharedCss, bodyCss } = buildLight(config);
  // Text and button colors follow the card background so they stay readable.
  const light = isLightColor(config.cardBg);
  const titleColor = light ? "text-[#111111]" : "text-white";
  const mutedColor = light ? "text-[#6B6B72]" : "text-[#9D9D9D]";
  // Lets the button's hover gradient follow the current light colors
  // (plain text color when every color has been removed).
  const stop = (i: number) =>
    config.colors.length
      ? toHex(config.colors[i])
      : light
        ? "#111111"
        : "#ffffff";
  const vars = {
    "--light-from": stop(0),
    "--light-via": stop(Math.floor(config.colors.length / 2)),
    "--light-to": stop(config.colors.length - 1),
  } as CSSProperties;

  return (
    <div className="relative aspect-[9/16] w-full" style={vars}>
      {lights.map((l) => (
        <div key={l.name} style={toStyle([...sharedCss, ...l.css])}>
          {l.inner && <div style={toStyle(l.inner.css)} />}
        </div>
      ))}
      <div className="flex flex-col" style={toStyle(bodyCss)}>
        <h1 className={`-mt-4 py-2.5 font-semibold text-lg ${titleColor}`}>
          Card example
        </h1>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <p className={`font-medium text-sm ${mutedColor}`}>
            You can create new colors examples
          </p>
          {/*TO DO LATER: CHANGE ALL FONTS TO INTER. USE RALEWAY FOR THE TITLES*/}
          <button
            onClick={onRandom}
            className={`px-3 py-1.5 group transition-colors duration-300 ease-in-out border-b-4 flex flex-row items-center gap-2 rounded-[4px] ${
              light
                ? "bg-[#F1F1F3] border-[#D9D9DE] hover:bg-[#E7E7EA] hover:border-[#F1F1F3]"
                : "bg-[#2C2C2C] border-[#3A3A3A] hover:bg-[#3A3A3A] hover:border-[#2C2C2C]"
            }`}
          >
            <Shuffle
              size={16}
              strokeWidth={1.5}
              className={`${titleColor} transition-colors duration-300 group-hover:text-[color:var(--light-via)]`}
            />
            <span
              className={`text-sm font-semibold
            group-hover:bg-gradient-to-r group-hover:bg-clip-text ${titleColor} group-hover:text-transparent transition-colors ease-in-out duration-300
            group-hover:from-[color:var(--light-from)] group-hover:via-[color:var(--light-via)] group-hover:to-[color:var(--light-to)]
            group-hover:animate-text`}
            >
              Random colors
            </span>
          </button>
        </div>
        {footer && <div className={`pb-1 ${mutedColor}`}>{footer}</div>}
      </div>
    </div>
  );
};

export default Card;
