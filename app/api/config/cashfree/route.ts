import { NextResponse } from "next/server"

export async function GET() {
    const configured = !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY)
    const env = process.env.CASHFREE_ENV || "TEST"

    return NextResponse.json({
        configured,
        env
    })
}
