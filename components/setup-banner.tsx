"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SetupBannerProps {
  type: "firestore-rules" | "firebase-config" | "general"
  message?: string
}

export function SetupBanner({ type, message }: SetupBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const content = {
    "firestore-rules": {
      title: "Firestore Security Rules Required",
      description: "Your Firebase project needs security rules to allow the app to read/write data.",
      steps: [
        "Go to Firebase Console → Firestore Database → Rules",
        "Copy the rules from FIREBASE_SETUP.md in your project",
        "Paste them in the Rules editor and click Publish",
        "Also create the required indexes in the Indexes tab",
      ],
    },
    "firebase-config": {
      title: "Firebase Configuration Missing",
      description: "Please add your Firebase environment variables.",
      steps: [
        "Go to Firebase Console → Project Settings",
        "Copy your Firebase config values",
        "Add them as environment variables in Vercel",
      ],
    },
    general: {
      title: "Setup Required",
      description: message || "Please complete the setup to use this feature.",
      steps: [],
    },
  }

  const { title, description, steps } = content[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 overflow-hidden rounded-xl border border-amber-500/50 bg-amber-500/10"
    >
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-amber-500">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {steps.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-amber-500 hover:bg-amber-500/10 hover:text-amber-500"
            >
              {isExpanded ? (
                <>
                  Hide Steps <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Show Steps <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDismissed(true)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && steps.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-amber-500/20 bg-amber-500/5 px-4 py-3"
          >
            <ol className="ml-4 list-decimal space-y-2 text-sm text-muted-foreground">
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <Button variant="outline" size="sm" className="mt-4 bg-transparent" asChild>
              <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">
                Open Firebase Console <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
