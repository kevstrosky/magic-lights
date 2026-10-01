"use client";

import { Moon, Sun } from "lucide-react";
import { setTheme } from "../lib/theme";

export default function ThemeToggle() {
  const toggle = () =>
    setTheme(!document.documentElement.classList.contains("dark"));

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="fixed right-8 top-8 z-50 hidden p-2.5 lg:block text-ui-soft transition-colors hover:text-ui-fg"
    >
      <Moon size={18} strokeWidth={1.75} className="hidden dark:block" />
      <Sun size={18} strokeWidth={1.75} className="dark:hidden" />
    </button>
  );
}
