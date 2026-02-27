import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theporchcoffeebar.com";

export const metadata: Metadata = {
  title: {
    default: "The Porch Coffee Bar | Mobile Coffee Cart for Events",
    template: "%s | The Porch Coffee Bar",
  },
  description:
    "Premium mobile coffee cart service for weddings, parties, and corporate events. Handcrafted beverages brought to your venue. Book online today!",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "The Porch Coffee Bar",
    title: "The Porch Coffee Bar | Mobile Coffee Cart for Events",
    description:
      "Premium mobile coffee cart service for weddings, parties, and corporate events. Handcrafted beverages brought to your venue.",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Porch Coffee Bar — Premium Mobile Coffee Cart",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Porch Coffee Bar | Mobile Coffee Cart for Events",
    description:
      "Premium mobile coffee cart service for weddings, parties, and events.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: SITE_URL },
  icons: {
    icon: "/favicon.ico",
    apple: "/the porch coffe bar logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f59e0b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/the porch coffe bar logo.png" />
        {googleVerification && (
          <meta name="google-site-verification" content={googleVerification} />
        )}

        {/* JSON-LD Structured Data — helps Google show business info */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FoodEstablishment",
              name: "The Porch Coffee Bar",
              description:
                "Premium mobile coffee cart service for weddings, parties, and special events.",
              url: SITE_URL,
              logo: `${SITE_URL}/the porch coffe bar logo.png`,
              image: `${SITE_URL}/og-image.png`,
              telephone: "+1-386-882-6560",
              email: "theporchkombuchabar@gmail.com",
              priceRange: "$$",
              servesCuisine: "Coffee, Espresso, Specialty Beverages",
              areaServed: {
                "@type": "State",
                name: "Georgia",
              },
              sameAs: [
                process.env.NEXT_PUBLIC_INSTAGRAM_URL,
                process.env.NEXT_PUBLIC_FACEBOOK_URL,
                process.env.NEXT_PUBLIC_TIKTOK_URL,
              ].filter(Boolean),
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        {/* Google Analytics */}
        {gaId && <GoogleAnalytics gaId={gaId} />}

        {/* Meta Pixel (Facebook / Instagram) */}
        {metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`}
          </Script>
        )}
      </body>
    </html>
  );
}
