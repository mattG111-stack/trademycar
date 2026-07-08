import type { Metadata, Viewport } from "next";
import { FAQ } from "@/lib/content";
import "./globals.css";

const TITLE = "Sell My Car NZ | Beat Any Trade-In Offer by $500 — TradeMyCar";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.trademycar.co.nz"),
  title: TITLE,
  description:
    "Selling your car in New Zealand? Get a free, no-obligation offer in 60 seconds. We come to you, pay the same day, and beat any written trade-in offer by $500 — guaranteed.",
  keywords:
    "sell my car NZ, sell car New Zealand, car buyers NZ, we buy any car, instant car offer, same day car payment, trade-in offer, cash for cars NZ, sell car online NZ",
  authors: [{ name: "TradeMyCar" }],
  robots: "index, follow",
  alternates: { canonical: "https://www.trademycar.co.nz/" },
  openGraph: {
    type: "website",
    siteName: "TradeMyCar",
    locale: "en_NZ",
    url: "https://www.trademycar.co.nz/",
    title: TITLE,
    description:
      "Enter your plate for a free, no-obligation offer. We come to you and pay the same day — and beat any written trade-in offer by $500.",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Free, no-obligation offer on your car. We come to you, pay same day, and beat any written trade-in offer by $500.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A5BE8",
};

const autoDealerLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: "TradeMyCar",
  description:
    "We buy cars directly from New Zealanders. Free, no-obligation offer, we come to you, and same-day payment.",
  url: "https://www.trademycar.co.nz/",
  areaServed: { "@type": "Country", name: "New Zealand" },
  priceRange: "Free valuation",
  makesOffer: {
    "@type": "Offer",
    description: "We beat any written trade-in offer by $500, guaranteed.",
    areaServed: "NZ",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    reviewCount: "2300",
  },
};

// Built from the on-page FAQ so the two never drift apart.
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NZ">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(autoDealerLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
        {children}
      </body>
    </html>
  );
}
