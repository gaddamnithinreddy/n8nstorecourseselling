import { MetadataRoute } from 'next'
import { getAllTemplates } from '@/lib/firebase/server-templates'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://n8npremiumtemplates.vercel.app').replace(/\/$/, '')

    // Static routes
    const routes = [
        '',
        '/templates',
        '/login',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    const templates = await getAllTemplates()

    const templateRoutes = templates.map((template) => ({
        url: `${baseUrl}/templates/${template.slug}`,
        lastModified: template.updatedAt ? new Date(template.updatedAt as any) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [...routes, ...templateRoutes]
}
