import { getSettings } from "@/lib/firebase/settings"

const API_VERSION = "2022-09-01" // Compatible stable version

export const getCashfreeConfig = () => {
    const mode = process.env.NEXT_PUBLIC_CASHFREE_MODE === "PROD" ? "PRODUCTION" : "SANDBOX"
    const appId = process.env.CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY

    const baseUrl = mode === "PRODUCTION"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg"

    return { mode, appId, secretKey, baseUrl }
}

export const createCashfreeOrder = async (orderData: any) => {
    const { mode, appId, secretKey, baseUrl } = getCashfreeConfig()

    console.log(`[Cashfree API] Creating order in ${mode} mode at ${baseUrl}`)

    if (!appId || !secretKey) {
        throw new Error("Cashfree credentials missing")
    }

    const url = `${baseUrl}/orders`
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-version": API_VERSION,
            "x-client-id": appId,
            "x-client-secret": secretKey
        },
        body: JSON.stringify(orderData)
    }

    try {
        const response = await fetch(url, options)
        const data = await response.json()

        if (!response.ok) {
            console.error("[Cashfree API] Response Error:", JSON.stringify(data))
            throw new Error(data.message || "Cashfree API request failed")
        }

        return data
    } catch (error: any) {
        console.error("[Cashfree API] Network Error:", error)
        throw error
    }
}

export const verifyCashfreeOrder = async (orderId: string) => {
    const { mode, appId, secretKey, baseUrl } = getCashfreeConfig()

    const url = `${baseUrl}/orders/${orderId}/payments`
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-api-version": API_VERSION,
            "x-client-id": appId,
            "x-client-secret": secretKey
        }
    }

    try {
        const response = await fetch(url, options)
        const data = await response.json()

        if (!response.ok) {
            console.error("[Cashfree API] Verify Response Error:", JSON.stringify(data))
            throw new Error(data.message || "Cashfree API verification failed")
        }

        return data // Returns array of payments
    } catch (error: any) {
        console.error("[Cashfree API] Verify Network Error:", error)
        throw error
    }
}
