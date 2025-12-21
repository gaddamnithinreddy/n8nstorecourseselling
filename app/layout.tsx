import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Toaster } from "@/components/ui/sonner"
import { GlobalErrorBoundary } from "@/components/global-error-boundary"
import { MaintenanceCheck } from "@/components/maintenance-check"

import { Inter, JetBrains_Mono } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
})

import { getAdminDb } from "@/lib/firebase/admin"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const adminDb = await getAdminDb()
    let settings = null

    if (adminDb) {
      const doc = await adminDb.collection("settings").doc("site-settings").get()
      if (doc.exists) {
        settings = doc.data()
      }
    }

    const title = settings?.metaTitle || "n8n Templates Store | Premium & Free Automation Workflows"
    const description = settings?.metaDescription || "Download production-ready n8n templates and AI agents. Automate CRM, Marketing, and Sales with our verified workflows. valid for 2024."
    const siteName = settings?.siteName || "n8n Templates Store"
    const ogImage = settings?.ogImage || "/og-image.png"

    return {
      metadataBase: new URL(baseUrl),
      title: {
        default: title,
        template: `%s | ${siteName}`,
      },
      description: description,
      keywords: settings?.metaKeywords || [
        "n8n templates",
        "n8n premium templates",
        "n8n free templates",
        "automation workflows",
        "download ready n8n templates",
        "n8n ai agents",
        "business automation",
        "no-code workflows",
        "CRM automation"
      ],
      openGraph: {
        type: "website",
        locale: "en_US",
        url: baseUrl,
        siteName: siteName,
        title: title,
        description: description,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: siteName,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: title,
        description: description,
        images: [ogImage],
        creator: "@n8ntemplates",
      },
      icons: {
        icon: settings?.favicon || "/favicon.ico",
        shortcut: "/favicon-16x16.png", // We might want to make this dynamic too later
        apple: "/apple-touch-icon.png",
      },
      manifest: "/site.webmanifest",
      generator: 'v0.app'
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "n8n Templates Store - Premium Automation Workflows",
      description: "Get production-ready n8n automation templates.",
    }
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
}

import Script from "next/script"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Fetch settings for Analytics
  const adminDb = await getAdminDb()
  let settings: any = null
  if (adminDb) {
    const doc = await adminDb.collection("settings").doc("site-settings").get()
    if (doc.exists) {
      settings = doc.data()
    }
  }

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <MaintenanceCheck />
            <ScrollToTop />
            <GlobalErrorBoundary>
              {children}
            </GlobalErrorBoundary>
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
                className: "animate-slide-up",
              }}
            />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />

        {/* Google Analytics */}
        {settings?.analytics?.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.analytics.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${settings.analytics.googleAnalyticsId}');
                    `}
            </Script>
          </>
        )}

        {/* Meta Pixel */}
        {settings?.analytics?.metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${settings.analytics.metaPixelId}');
                fbq('track', 'PageView');
                `}
          </Script>
        )}

        {/* Structured Data (JSON-LD) for SEO */}
        <Script id="json-ld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "name": settings?.siteName || "n8n Templates Store",
                "url": baseUrl,
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": `${baseUrl}/templates?search={search_term_string}`,
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@type": "Organization",
                "name": settings?.siteName || "n8n Templates Store",
                "url": baseUrl,
                "logo": settings?.logoUrl || `${baseUrl}/logo.png`,
                "sameAs": [
                  settings?.socialLinks?.twitter,
                  settings?.socialLinks?.github,
                  settings?.socialLinks?.linkedin,
                ].filter(Boolean),
                "description": settings?.metaDescription || "Premium n8n automation templates to streamine your workflows."
              }
            ]
          })}
        </Script>
      </body>
    </html>
  )
}
