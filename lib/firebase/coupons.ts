import { getAdminDb } from "@/lib/firebase/admin"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import type { Coupon } from "@/lib/firebase/types"

const COLLECTION_NAME = "coupons"

export async function createCoupon(couponData: Omit<Coupon, "id" | "createdAt" | "usedCount">) {
    const adminDb = await getAdminDb()
    if (!adminDb) throw new Error("Database not initialized") // Should be handled by caller usually

    const couponRef = adminDb.collection(COLLECTION_NAME).doc()

    const coupon: Coupon = {
        id: couponRef.id,
        ...couponData,
        usedCount: 0,
        createdAt: Timestamp.now() as any,
    }

    await couponRef.set(coupon)
    return coupon
}

export async function getCoupons() {
    const adminDb = await getAdminDb()
    if (!adminDb) return []

    const snapshot = await adminDb.collection(COLLECTION_NAME).get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Coupon)
}

export async function getCouponByCode(code: string) {
    const adminDb = await getAdminDb()
    if (!adminDb) return null

    const snapshot = await adminDb
        .collection(COLLECTION_NAME)
        .where("code", "==", code)
        .where("isActive", "==", true)
        .get()

    if (snapshot.empty) return null

    // Convert Firestore Timestamp to JS Date or keep as is? 
    // The type definition likely expects Timestamp or is flexible. 
    // Usually admin SDK returns admin.firestore.Timestamp.
    const data = snapshot.docs[0].data()
    return { id: snapshot.docs[0].id, ...data } as Coupon
}

export async function deleteCoupon(id: string) {
    const adminDb = await getAdminDb()
    if (!adminDb) throw new Error("Database not initialized")

    await adminDb.collection(COLLECTION_NAME).doc(id).delete()
}

export async function incrementCouponUsage(id: string) {
    const adminDb = await getAdminDb()
    if (!adminDb) throw new Error("Database not initialized")

    await adminDb.collection(COLLECTION_NAME).doc(id).update({
        usedCount: FieldValue.increment(1)
    })
}

export async function incrementCouponUsageByCode(code: string) {
    const adminDb = await getAdminDb()
    if (!adminDb) throw new Error("Database not initialized")

    const snapshot = await adminDb.collection(COLLECTION_NAME)
        .where("code", "==", code)
        .limit(1)
        .get()

    if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        await doc.ref.update({
            usedCount: FieldValue.increment(1)
        })
        console.log(`[Coupons] Incremented usage for code: ${code}`)
    } else {
        console.warn(`[Coupons] Failed to increment usage - code not found: ${code}`)
    }
}

export async function recordCouponPurchase(
    code: string,
    purchaseData: {
        userId: string
        userEmail: string
        userName: string
        orderId: string
        amount: number
        discountApplied: number
    }
) {
    const adminDb = await getAdminDb()
    if (!adminDb) throw new Error("Database not initialized")

    const snapshot = await adminDb.collection(COLLECTION_NAME)
        .where("code", "==", code)
        .limit(1)
        .get()

    if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        await doc.ref.update({
            purchases: FieldValue.arrayUnion({
                ...purchaseData,
                purchasedAt: Timestamp.now()
            })
        })
        console.log(`[Coupons] Recorded purchase for code: ${code}, user: ${purchaseData.userEmail}`)
    } else {
        console.warn(`[Coupons] Failed to record purchase - code not found: ${code}`)
    }
}

export async function validateCoupon(code: string, userEmail?: string): Promise<{ isValid: boolean; error?: string; coupon?: Coupon }> {
    try {
        console.log("[validateCoupon] Starting validation for code:", code, "userEmail:", userEmail)

        const coupon = await getCouponByCode(code)

        if (!coupon) {
            console.log("[validateCoupon] Coupon not found")
            return { isValid: false, error: "Invalid coupon code" }
        }

        console.log("[validateCoupon] Coupon found:", {
            id: coupon.id,
            code: coupon.code,
            isActive: coupon.isActive,
            validFrom: coupon.validFrom,
            validUntil: coupon.validUntil,
            usageLimit: coupon.usageLimit,
            usedCount: coupon.usedCount,
            specificEmail: coupon.specificEmail
        })

        const now = Timestamp.now()

        // Robustly convert to milliseconds regardless of SDK version or serialization
        const getMillis = (ts: any) => {
            if (typeof ts?.toMillis === 'function') return ts.toMillis();
            if (typeof ts?.toDate === 'function') return ts.toDate().getTime();
            if (ts?._seconds !== undefined) return ts._seconds * 1000;
            if (ts?.seconds !== undefined) return ts.seconds * 1000;
            return 0; // Fallback
        };

        const validUntilMillis = getMillis(coupon.validUntil);
        const validFromMillis = getMillis(coupon.validFrom);
        const nowMillis = now.toMillis();

        console.log("[validateCoupon] Time comparison:", {
            nowMillis,
            validFromMillis,
            validUntilMillis,
            nowDate: new Date(nowMillis).toISOString(),
            validFromDate: new Date(validFromMillis).toISOString(),
            validUntilDate: new Date(validUntilMillis).toISOString()
        })

        if (validUntilMillis < nowMillis) {
            console.log("[validateCoupon] Coupon expired")
            return { isValid: false, error: "Coupon has expired" }
        }

        // Check start date
        if (validFromMillis > nowMillis) {
            console.log("[validateCoupon] Coupon not yet active")
            return { isValid: false, error: "Coupon is not active yet" }
        }

        // Check usage limit
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            console.log("[validateCoupon] Usage limit reached:", { usedCount: coupon.usedCount, usageLimit: coupon.usageLimit })
            return { isValid: false, error: "Coupon usage limit reached" }
        }

        // Check specific email
        if (coupon.specificEmail && userEmail) {
            if (coupon.specificEmail.toLowerCase() !== userEmail.toLowerCase()) {
                console.log("[validateCoupon] Email mismatch:", { expected: coupon.specificEmail, provided: userEmail })
                return { isValid: false, error: "This coupon is not valid for your email address" }
            }
        } else if (coupon.specificEmail && !userEmail) {
            console.log("[validateCoupon] Email required but not provided")
            return { isValid: false, error: "This coupon requires a specific email address" }
        }

        console.log("[validateCoupon] Validation successful!")
        return { isValid: true, coupon }
    } catch (error) {
        console.error("[validateCoupon] Error during validation:", error)
        return { isValid: false, error: "Error verifying coupon" }
    }
}
