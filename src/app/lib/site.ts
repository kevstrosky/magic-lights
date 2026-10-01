// Public URL of the deployed tool. Set NEXT_PUBLIC_SITE_URL in the hosting
// environment if the subdomain differs from the default below.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://magiclights.kevinochoa.dev"
).replace(/\/$/, "");

export const SITE_NAME = "Magic Lights";

export const SITE_TITLE =
  "Magic Lights – Glowing Card Border Generator for Tailwind CSS";

export const SITE_DESCRIPTION =
  "Free online tool to design glowing gradient borders for your cards. Pick sides, colors, blur and thickness, then copy the Tailwind CSS or plain CSS code.";

export const AUTHOR = { name: "kevstrosky", url: "https://kevinochoa.dev" };
