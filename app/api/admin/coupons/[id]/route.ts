
import { NextResponse } from "next/server"
import { deleteCoupon } from "@/lib/firebase/coupons"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await deleteCoupon(id)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
