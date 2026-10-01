// Switches the site theme (the `dark` class on <html>) and remembers it.
export function setTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
}
