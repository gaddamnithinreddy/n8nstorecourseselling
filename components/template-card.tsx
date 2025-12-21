import Link from "next/link"
import Image from "next/image"
import type { Template } from "@/lib/firebase/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowRight, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface TemplateCardProps {
  template: Template
  index?: number
}

export function TemplateCard({ template, index = 0 }: TemplateCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Link
        href={`/templates/${template.slug}`}
        className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
      >
        <Card className="group h-full flex flex-col overflow-hidden border-border/60 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
          <div className="relative aspect-[16/10] overflow-hidden bg-muted shrink-0">
            {template.thumbnailUrl ? (
              <Image
                src={template.thumbnailUrl || "/placeholder.svg"}
                alt={template.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Zap className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            {!template.isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
                <Badge variant="secondary" className="text-sm">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
            <div className="mb-3 flex flex-wrap gap-1.5 align-center">
              <Badge variant="outline" className="text-xs font-medium">
                {template.category}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {template.level}
              </Badge>
              {template.originalPrice && template.originalPrice > template.price && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  Sale
                </Badge>
              )}
            </div>
            <h3 className="mb-2 line-clamp-1 text-base font-semibold leading-tight transition-colors group-hover:text-primary sm:text-lg">
              {template.title}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground flex-1">{template.shortDescription}</p>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-border/50 p-4 sm:p-5 mt-auto">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary sm:text-xl">
                {formatPrice(template.price, template.currency)}
              </span>
              {template.originalPrice && template.originalPrice > template.price && (
                <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                  {formatPrice(template.originalPrice, template.currency)}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
              View Details
              <motion.div
                variants={{
                  hover: { x: [0, 5, 0] }
                }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </span>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}
