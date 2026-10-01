import Editor from "./components/editor";
import { AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./lib/site";

// Structured data so search engines can show the page as a free web app.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
};
import ThemeToggle from "./components/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ThemeToggle />
      <Editor footer={<Footer />} />
    </main>
  );
}

function Footer() {
  return (
    <footer className="flex flex-col items-center gap-1 text-center text-xs">
      <p>
        A tool made by <span className="font-semibold">kevstrosky</span>
      </p>
      <p>© {new Date().getFullYear()} kevstrosky. All rights reserved.</p>
      <p>
        Visit my website here:{" "}
        <a
          href="https://kevinochoa.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline-offset-4 hover:underline"
        >
          kevinochoa.dev
        </a>
      </p>
    </footer>
  );
}
