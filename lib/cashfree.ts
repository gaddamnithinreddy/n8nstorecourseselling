import { Cashfree, CFEnvironment } from "cashfree-pg";

const environment = (process.env.CASHFREE_ENV === "PROD" || process.env.NEXT_PUBLIC_CASHFREE_MODE === "PROD")
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

const appId = process.env.CASHFREE_APP_ID || "";
const secretKey = process.env.CASHFREE_SECRET_KEY || "";

console.log(`[Cashfree] Initializing in ${environment === CFEnvironment.PRODUCTION ? "PRODUCTION" : "SANDBOX"} mode`)
if (environment === CFEnvironment.PRODUCTION && (!appId || !secretKey)) {
    console.error("[Cashfree] CRITICAL: Production keys missing or empty!")
}

// Initialize with constructor arguments as per docs
const cashfree = new Cashfree(environment, appId, secretKey);

export default cashfree;
