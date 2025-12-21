import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Browse n8n Automation Templates | CRM, AI, Marketing Workflows",
    description: "Explore our collection of premium and free n8n templates. Download-ready automation workflows for marketing, CRM, data processing, and AI Agents.",
    keywords: ["n8n templates", "n8n workflows", "free n8n templates", "premium n8n templates", "n8n automation examples", "download ready", "ai agents", "crm automation", "verified workflows"],
}

export default function TemplatesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
