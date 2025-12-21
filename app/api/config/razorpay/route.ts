import { NextResponse } from "next/server"

export async function GET() {
  const publishableKey = process.env.RZP_ID

  if (!publishableKey) {
    return NextResponse.json(
      { keyId: null, mode: null, error: "Payment gateway not configured" },
      { status: 200 }, // Return 200 to avoid client errors, but with null keyId
    )
  }

  return NextResponse.json({
    keyId: publishableKey,
    mode: publishableKey.startsWith("rzp_test") ? "test" : "live",
  })
}
