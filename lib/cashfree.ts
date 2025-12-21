import { Cashfree, CFEnvironment } from "cashfree-pg";

const environment = (process.env.CASHFREE_ENV === "PROD" || process.env.NEXT_PUBLIC_CASHFREE_MODE === "PROD")
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

const appId = process.env.CASHFREE_APP_ID || "";
const secretKey = process.env.CASHFREE_SECRET_KEY || "";

console.log(`[Cashfree] Initializing in ${environment === CFEnvironment.PRODUCTION ? "PRODUCTION" : "SANDBOX"} mode`)
console.log(`[Cashfree] App ID: ${appId ? appId.substring(0, 10) + "..." : "MISSING"}`)

if (environment === CFEnvironment.PRODUCTION && (!appId || !secretKey)) {
    console.error("[Cashfree] CRITICAL: Production keys missing or empty!")
}

// Initialize using static properties (correct pattern for cashfree-pg)
Cashfree.XClientId = appId;
Cashfree.XClientSecret = secretKey;
Cashfree.XEnvironment = environment;

export default Cashfree;
