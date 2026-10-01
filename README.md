# Magic Lights

A free tool to design glowing gradient borders for cards and copy the result as Tailwind CSS, plain CSS, or an AI prompt.

Made by [kevstrosky](https://kevinochoa.dev).

## Features

- Light on any side of the card (or all four as a ring), with bar size, thickness, blur, opacity and animation
- Gradient colors as Tailwind names, hex, `rgb()`, `hsl()` or any CSS color
- Card background, border and radius
- Code output for Tailwind, plain CSS, and ready-to-paste AI prompts
- Light and dark theme

## Development

Requires Node 18+ and pnpm 11.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Set `NEXT_PUBLIC_SITE_URL` to the public URL (for example `https://magiclights.kevinochoa.dev`). It's used for the canonical URL, sitemap, robots.txt and social preview images.

```bash
pnpm build
pnpm start
```
