// Email service for sending purchase notifications
import { getAdminDb } from "@/lib/firebase/admin"

interface OrderEmailData {
  userEmail: string
  userName: string
  templates: Array<{ templateTitle: string; priceAtPurchase: number }>
}

interface DownloadToken {
  templateId: string
  token: string
}

/**
 * Send purchase confirmation email with download links
 */
import nodemailer from "nodemailer"

// ... existing imports ...

export async function sendPurchaseEmail(order: OrderEmailData, downloadTokens: DownloadToken[]): Promise<void> {
  // Use Gmail App Password
  const gmailUser = process.env.GMAIL_USER
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailAppPassword) {
    console.log("[Email] Gmail credentials (GMAIL_USER or GMAIL_APP_PASSWORD) not configured, skipping email")
    return
  }

  try {
    const adminDb = await getAdminDb()

    // Check settings
    let emailSettings = {
      enableEmailNotifications: true,
      emailSubjectTemplate: "Your Purchase: {{templateName}}",
      emailBodyTemplate: "",
      emailFromName: "Course Store"
    }

    if (adminDb) {
      const settingsDoc = await adminDb.collection("settings").doc("site-settings").get()
      if (settingsDoc.exists) {
        const data = settingsDoc.data()
        if (data) {
          if (data.enableEmailNotifications === false) {
            console.log("[Email] Email notifications disabled in settings")
            return
          }
          emailSettings = {
            enableEmailNotifications: data.enableEmailNotifications ?? true,
            emailSubjectTemplate: data.emailSubjectTemplate || "Your Purchase: {{templateName}}",
            emailBodyTemplate: data.emailBodyTemplate || "",
            emailFromName: data.emailFromName || "Course Store"
          }
        }
      }
    }

    // Get template details
    const templateDetails = await Promise.all(
      order.templates.map(async (t, index) => {
        try {
          const token = downloadTokens[index]
          if (!token) return { ...t, downloadToken: null }

          if (!adminDb) {
            return { ...t, title: t.templateTitle, downloadToken: token.token }
          }

          const doc = await adminDb.collection("templates").doc(token.templateId).get()
          const data = doc.exists ? doc.data() : {}

          return {
            ...t,
            title: data?.title || t.templateTitle,
            downloadToken: token.token,
          }
        } catch {
          return { ...t, downloadToken: downloadTokens[index]?.token || null }
        }
      }),
    )

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Create Nodemailer transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    })

    // Dynamic Subject
    const templateNames = order.templates.map((t) => t.templateTitle).join(", ")
    const subject = emailSettings.emailSubjectTemplate.replace("{{templateName}}", templateNames)

    // Generate HTML (pass custom body template if exists)
    const emailHtml = generatePurchaseEmailHtml({
      userName: order.userName,
      templates: templateDetails,
      baseUrl,
      customBody: emailSettings.emailBodyTemplate
    })

    const mailOptions = {
      from: `"${emailSettings.emailFromName}" <${gmailUser}>`,
      to: order.userEmail,
      subject: subject,
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)

    console.log("[Email] Purchase email sent successfully via Gmail to:", order.userEmail)
  } catch (error) {
    console.error("[Email] Error sending purchase email:", error)
    console.log("[Email] Order was still completed successfully. User can access downloads from dashboard.")
  }
}

interface EmailTemplateData {
  userName: string
  templates: Array<{ title?: string; templateTitle: string; priceAtPurchase: number; downloadToken: string | null }>
  baseUrl: string
  customBody?: string
}

function generatePurchaseEmailHtml({ userName, templates, baseUrl, customBody }: EmailTemplateData): string {
  const templateBlocks = templates
    .map(
      (t) => `
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 16px 0; border: 1px solid #e2e8f0;">
        <h3 style="color: #1a1a1a; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">
          ${t.title || t.templateTitle}
        </h3>
        <p style="color: #64748b; margin: 0 0 16px 0; font-size: 14px;">
          ₹${t.priceAtPurchase}
        </p>
        ${t.downloadToken
          ? `<a href="${baseUrl}/api/downloads/${t.downloadToken}" 
               style="background: #171717; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 14px;">
              Download Template
            </a>`
          : `<span style="color: #94a3b8; font-size: 14px;">Download link unavailable</span>`
        }
      </div>
    `,
    )
    .join("")

  const defaultBody = `
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        Your payment has been successfully processed. Here are your download links:
      </p>
  `;

  // Minimal expansion for custom body if provided. Just replacing the specific text paragraph.
  // Full template engine replacement is overkill here.
  const bodyContent = customBody ?
    `<div style="color: #475569; font-size: 16px; line-height: 1.6;">${customBody.replace("{{userName}}", userName || "User").replace(/\\n/g, "<br>")}</div>`
    : defaultBody;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Purchase</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: #171717; padding: 12px; border-radius: 12px; margin-bottom: 16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#ffffff"/>
          </svg>
        </div>
        <h1 style="color: #171717; margin: 0; font-size: 24px; font-weight: 700;">
          Thank you for your purchase!
        </h1>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        Hi ${userName || "there"},
      </p>
      
      ${bodyContent}
      
      ${templateBlocks}
      
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          <strong>Important:</strong> These download links will expire in 7 days. You can always access your purchases from your dashboard.
        </p>
      </div>
      
      <div style="margin-top: 32px; text-align: center;">
        <a href="${baseUrl}/dashboard/downloads" 
           style="color: #171717; text-decoration: underline; font-size: 14px;">
          View All Downloads
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
        If you have any questions or need assistance, please contact our support team.<br>
        <a href="${baseUrl}" style="color: #64748b;">n8n Templates Store</a>
      </p>
    </body>
    </html>
  `
}
