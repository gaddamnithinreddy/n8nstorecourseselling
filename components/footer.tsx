"use client"

import Link from "next/link"
import { Zap, Twitter, Github, Linkedin, Instagram, Youtube } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"

export function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                {settings?.siteName || "n8n Store"}
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {settings?.siteDescription || "Premium n8n automation templates to supercharge your workflows."}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/templates" className="text-muted-foreground transition-colors hover:text-primary">
                  All Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/templates?category=Automation"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Automation
                </Link>
              </li>
              <li>
                <Link
                  href="/templates?category=Integration"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/documentation" className="text-muted-foreground transition-colors hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-muted-foreground transition-colors hover:text-primary"
                  onClick={(e) => {
                    if (window.location.pathname === "/") {
                      e.preventDefault()
                      const element = document.getElementById("faq")
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" })
                        // Update URL without scroll
                        window.history.pushState(null, "", "/#faq")
                      }
                    }
                  }}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-muted-foreground transition-colors hover:text-primary">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Connect</h4>
            <div className="flex gap-3">
              {settings?.socialLinks?.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-primary"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {settings?.socialLinks?.github && (
                <a
                  href={settings.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-primary"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {settings?.socialLinks?.linkedin && (
                <a
                  href={settings.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-primary"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-primary"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings?.socialLinks?.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-primary"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>{settings?.footerText || `© ${new Date().getFullYear()} n8n Store. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  )
}
