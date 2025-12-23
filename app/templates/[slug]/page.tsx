
import type { Metadata } from 'next'
import TemplateClient from './template-client'
import { getTemplateBySlug } from '@/lib/firebase/server-templates'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { slug } = await params
  const template = await getTemplateBySlug(slug)

  if (!template) {
    return {
      title: 'Template Not Found',
    }
  }

  return {
    title: template.metaTitle || template.title,
    description: template.metaDescription || template.shortDescription,
    keywords: template.tags ? [...template.tags, "n8n template", "automation workflow"] : ["n8n template", "automation workflow"],
    alternates: {
      canonical: `/templates/${template.slug}`,
    },
    openGraph: {
      title: template.title,
      description: template.shortDescription,
      images: [template.thumbnailUrl],
      type: 'website',
      siteName: 'n8n Templates Store',
      // @ts-ignore - OpenGraph types are not fully typed in Next.js
      price: {
        amount: template.price,
        currency: template.currency,
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: template.title,
      description: template.shortDescription,
      images: [template.thumbnailUrl],
      creator: '@n8ntemplates',
    },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const template = await getTemplateBySlug(slug)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://n8npremiumtemplates.vercel.app"

  const jsonLd = template ? [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: template.title,
      image: template.thumbnailUrl,
      description: template.shortDescription,
      sku: template.id,
      offers: {
        '@type': 'Offer',
        price: template.price,
        priceCurrency: template.currency,
        availability: template.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${baseUrl}/templates/${template.slug}`,
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Templates',
          item: `${baseUrl}/templates`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: template.title,
          item: `${baseUrl}/templates/${template.slug}`
        }
      ]
    }
  ] : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <TemplateClient slug={slug} initialTemplate={template} />
    </>
  )
}
