import type { NextRequest } from "next/server"
import { getAdminDb, isFirebaseAdminReady } from "@/lib/firebase/admin"
import { errorResponse, HTTP_STATUS } from "@/lib/api-response"

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params

    if (!token || typeof token !== "string" || token.length !== 64) {
      return errorResponse("Invalid download token", HTTP_STATUS.BAD_REQUEST, "INVALID_TOKEN")
    }

    const isReady = await isFirebaseAdminReady()
    if (!isReady) {
      return errorResponse("Server configuration error", HTTP_STATUS.INTERNAL_ERROR, "SERVER_CONFIG_ERROR")
    }

    const adminDb = await getAdminDb()
    if (!adminDb) {
      return errorResponse("Database connection failed", HTTP_STATUS.INTERNAL_ERROR, "DB_CONNECTION_ERROR")
    }

    // Performance Optimization: Query the dedicated downloadTokens collection
    const tokenQuery = await adminDb.collection("downloadTokens").where("token", "==", token).limit(1).get()

    if (tokenQuery.empty) {
      return errorResponse("Invalid or expired download token", HTTP_STATUS.NOT_FOUND, "TOKEN_NOT_FOUND")
    }

    const foundToken = tokenQuery.docs[0].data()
    const templateId = foundToken.templateId

    const expiresAt = foundToken.expiresAt.toDate()
    if (new Date() > expiresAt) {
      return errorResponse(
        "Download token has expired. Please contact support for a new link.",
        HTTP_STATUS.GONE,
        "TOKEN_EXPIRED",
      )
    }

    const templateDoc = await adminDb.collection("templates").doc(templateId).get()

    if (!templateDoc.exists) {
      return errorResponse("Template not found", HTTP_STATUS.NOT_FOUND, "TEMPLATE_NOT_FOUND")
    }

    const template = templateDoc.data() as Record<string, unknown>

    if (!template.downloadFileUrl) {
      console.error("[Download] No download URL found for template:", templateId)
      return errorResponse("Download file not available", HTTP_STATUS.NOT_FOUND, "FILE_NOT_AVAILABLE")
    }

    const downloadUrl = template.downloadFileUrl as string


    let response
    try {
      response = await fetch(downloadUrl)
    } catch (fetchErr) {
      console.error("[Download] Network error fetching file:", fetchErr)
      return errorResponse("Failed to reach file server", HTTP_STATUS.INTERNAL_ERROR, "FILE_NETWORK_ERROR")
    }

    if (!response.ok) {
      console.error("[Download] Failed to fetch file:", response.status, response.statusText)
      return errorResponse("Failed to retrieve file", HTTP_STATUS.INTERNAL_ERROR, "FILE_FETCH_FAILED")
    }

    // Check content type
    const contentType = response.headers.get("content-type")


    // If it's HTML, the URL is probably wrong (pointing to a webpage instead of raw file)
    if (contentType?.includes("text/html")) {
      console.error("[Download] URL returned HTML instead of JSON. URL may be incorrect:", downloadUrl)
      return errorResponse(
        "Invalid download URL configuration. Please contact support.",
        HTTP_STATUS.INTERNAL_ERROR,
        "INVALID_FILE_URL"
      )
    }

    const fileContent = await response.text()

    // Validate it's actually JSON
    try {
      JSON.parse(fileContent)
    } catch (parseErr) {
      console.error("[Download] Downloaded content is not valid JSON")
      console.error("[Download] First 200 chars:", fileContent.substring(0, 200))
      return errorResponse(
        "Downloaded file is not valid JSON. Please contact support.",
        HTTP_STATUS.INTERNAL_ERROR,
        "INVALID_FILE_FORMAT"
      )
    }

    const filename = `${template.slug || "template"}.json`

    return new Response(fileContent, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[Download] Error:", message)
    return errorResponse("Failed to download", HTTP_STATUS.INTERNAL_ERROR, "DOWNLOAD_FAILED")
  }
}
