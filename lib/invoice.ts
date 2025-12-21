import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"

interface InvoiceData {
    orderId: string
    userName: string
    userEmail: string
    date: any
    items: Array<{
        title: string
        price: number
    }>
    totalAmount: number
    discountAmount?: number
    currency: string
}

export function generateInvoice(data: InvoiceData) {
    const doc = new jsPDF()

    // Colors
    const primaryColor: [number, number, number] = [66, 66, 255] // Blue
    const darkGray: [number, number, number] = [60, 60, 60]
    const lightGray: [number, number, number] = [150, 150, 150]

    // Header with colored bar
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 40, 'F')

    // Company Name (White on blue)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text("n8n Templates Store", 14, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text("Premium Automation Templates", 14, 28)

    // Invoice Title (Right side, white)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text("INVOICE", 195, 25, { align: 'right' })

    // Reset to black for body
    doc.setTextColor(...darkGray)

    // Invoice Details Box
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text("Invoice Number:", 140, 50)
    doc.text("Invoice Date:", 140, 56)
    doc.text("Payment Status:", 140, 62)

    doc.setFont('helvetica', 'normal')
    doc.text(`#${data.orderId.substring(0, 8).toUpperCase()}`, 195, 50, { align: 'right' })
    doc.text(format(new Date(), "PPP"), 195, 56, { align: 'right' })

    // Payment status with color
    const isPaid = true // Assuming invoice is only generated for paid orders
    doc.setTextColor(isPaid ? 34 : 234, isPaid ? 197 : 179, isPaid ? 94 : 8)
    doc.setFont('helvetica', 'bold')
    doc.text(isPaid ? "PAID" : "PENDING", 195, 62, { align: 'right' })
    doc.setTextColor(...darkGray)

    // Bill To Section
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text("BILL TO:", 14, 50)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(data.userName, 14, 58)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...lightGray)
    doc.text(data.userEmail, 14, 64)
    doc.setTextColor(...darkGray)

    // Items Table with enhanced styling
    const tableBody = data.items.map((item, index) => [
        `${index + 1}`,
        item.title,
        '1',
        `${data.currency} ${item.price.toFixed(2)}`,
        `${data.currency} ${item.price.toFixed(2)}`
    ])

    autoTable(doc, {
        startY: 75,
        head: [["#", "Template Description", "Qty", "Unit Price", "Amount"]],
        body: tableBody,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left'
        },
        bodyStyles: {
            fontSize: 10
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 90 },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 35, halign: 'right' },
            4: { cellWidth: 35, halign: 'right' }
        },
        alternateRowStyles: {
            fillColor: [245, 245, 250]
        }
    })

    // Totals Section
    const finalY = (doc as any).lastAutoTable.finalY + 10
    const totalsX = 140

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    // Subtotal
    doc.text("Subtotal:", totalsX, finalY)
    doc.text(`${data.currency} ${(data.totalAmount + (data.discountAmount || 0)).toFixed(2)}`, 195, finalY, { align: 'right' })

    // Discount (if applicable)
    let currentY = finalY
    if (data.discountAmount && data.discountAmount > 0) {
        currentY += 6
        doc.setTextColor(234, 179, 8) // Yellow for discount
        doc.text("Discount Applied:", totalsX, currentY)
        doc.text(`- ${data.currency} ${data.discountAmount.toFixed(2)}`, 195, currentY, { align: 'right' })
        doc.setTextColor(...darkGray)
    }

    // Total (Bold and larger)
    currentY += 10
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(totalsX, currentY - 3, 195, currentY - 3)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.text("TOTAL:", totalsX, currentY + 5)
    doc.text(`${data.currency} ${data.totalAmount.toFixed(2)}`, 195, currentY + 5, { align: 'right' })

    // Footer Section
    const footerY = 250
    doc.setDrawColor(...lightGray)
    doc.setLineWidth(0.3)
    doc.line(14, footerY, 195, footerY)

    // Thank you message
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...primaryColor)
    doc.text("Thank you for your purchase!", 105, footerY + 8, { align: 'center' })

    // Contact & Terms
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...lightGray)
    doc.text("For support, contact: support@n8ntemplates.com", 105, footerY + 15, { align: 'center' })
    doc.text("Website: www.n8ntemplates.com", 105, footerY + 20, { align: 'center' })

    doc.setFontSize(8)
    doc.text("This is a computer-generated invoice. No signature required.", 105, footerY + 28, { align: 'center' })

    // Save with better filename
    const fileName = `n8n-invoice-${data.orderId.substring(0, 8)}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    doc.save(fileName)
}
