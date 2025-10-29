import { Order } from '@/types/orders';
import * as XLSX from 'xlsx';

/**
 * EasyOrder Format Export Data
 * Matches the exact column names from excel-upload.ts EasyOrderFormatRow
 */
export interface EasyOrderFormatExportData {
    'ID'?: string;
    'Status'?: string;
    'FullName': string;
    'Phone': string;
    'City'?: string;
    'Address': string;
    'Total Cost'?: number;
    'Product Cost'?: number;
    'Shipping Cost': number;
    'Coupon'?: string;
    'Coupon Discount'?: number;
    'Product Name': string;
    'Variant'?: string;
    'Quantity'?: number;
    'SKU'?: string;
    'Item Price'?: number;
    'CreatedAt'?: string;
    'Extra Data'?: string;
    'Extra Data2'?: string;
    'Alt Phone'?: string;
    'Note'?: string;
    'Ref'?: string;
    'Utm Source'?: string;
    'Utm Campaign'?: string;
    'Payment Method'?: string;
    'Payment Status'?: string;
    'Funnel ID'?: string;
    'Order ID'?: string;
    'Referral Code'?: string;
    'External Order ID'?: string;
}

/**
 * Exports orders in EasyOrder format
 * Matches the exact format from excel-upload.ts EasyOrderFormatRow
 * This format focuses on single product orders with additional fields
 * 
 * IMPORTANT: Column names MUST match exactly for re-import to work
 */
export function exportEasyOrderFormat(orders: Order[], filename: string = 'easyorder_orders') {
    const excelData: EasyOrderFormatExportData[] = orders.map((order) => {
        const products = order.orderProducts || [];
        const firstProduct = products[0];

        const data: EasyOrderFormatExportData = {
            'ID': order.id.toString(),
            'Status': order.status,
            'FullName': order.customer.name,
            'Phone': order.customer.phoneNumber,
            'City': order.customer.city || order.customer.governorate || '',
            'Address': order.customer.address || '',
            'Total Cost': order.totalCost,
            'Product Cost': order.totalCost - (order.shippingCost || 0),
            'Shipping Cost': order.shippingCost || 0,
            'Coupon': order.coupon || '',
            'Coupon Discount': order.couponDiscount || 0,
            'Product Name': firstProduct?.product.name || '',
            'Variant': firstProduct?.variant || formatVariant(firstProduct?.product),
            'Quantity': firstProduct?.quantity || 1,
            'SKU': firstProduct?.sku || generateSKU(firstProduct?.product.name, firstProduct?.product.size, firstProduct?.product.color),
            'Item Price': firstProduct?.price || 0,
            'CreatedAt': new Date(order.createdAt).toISOString(),
            'Alt Phone': order.customer.altPhone || '',
            'Note': order.notes || '',
            'Utm Source': order.utmSource || '',
            'Utm Campaign': order.utmCampaign || '',
            'Payment Method': order.paymentMethod || 'cash',
            'Payment Status': order.paymentStatus || '',
            'Order ID': order.id.toString(),
            'External Order ID': order.externalOrderId || order.code,
            'Referral Code': order.referralCode || '',
        };

        return data;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths (order matches EasyOrderFormatRow)
    const columnWidths = [
        { wch: 10 }, // ID
        { wch: 25 }, // Status
        { wch: 20 }, // FullName
        { wch: 15 }, // Phone
        { wch: 15 }, // City
        { wch: 30 }, // Address
        { wch: 12 }, // Total Cost
        { wch: 12 }, // Product Cost
        { wch: 12 }, // Shipping Cost
        { wch: 15 }, // Coupon
        { wch: 15 }, // Coupon Discount
        { wch: 25 }, // Product Name
        { wch: 20 }, // Variant
        { wch: 10 }, // Quantity
        { wch: 15 }, // SKU
        { wch: 12 }, // Item Price
        { wch: 20 }, // CreatedAt
        { wch: 20 }, // Extra Data
        { wch: 20 }, // Extra Data2
        { wch: 15 }, // Alt Phone
        { wch: 30 }, // Note
        { wch: 15 }, // Ref
        { wch: 15 }, // Utm Source
        { wch: 15 }, // Utm Campaign
        { wch: 15 }, // Payment Method
        { wch: 15 }, // Payment Status
        { wch: 15 }, // Funnel ID
        { wch: 10 }, // Order ID
        { wch: 15 }, // Referral Code
        { wch: 20 }, // External Order ID
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${filename}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fileName);

    return fileName;
}

function formatVariant(product?: { size?: string; color?: string }): string {
    if (!product) return '';

    const parts: string[] = [];
    if (product.color) parts.push(product.color);
    if (product.size) parts.push(product.size);

    return parts.join(' - ');
}

function generateSKU(productName: string, size?: string, color?: string): string {
    // Generate a simple SKU based on product attributes
    const namePart = productName.substring(0, 4).toUpperCase().replace(/\s/g, '');
    const sizePart = size ? size.substring(0, 2).toUpperCase() : 'NA';
    const colorPart = color ? color.substring(0, 3).toUpperCase() : 'NA';

    return `${namePart}-${sizePart}-${colorPart}`;
}

function getPaymentStatus(status: string): string {
    const statusMap: Record<string, string> = {
        'WAITING_FOR_PAYMENT': 'pending',
        'DOWN_PAYMENT': 'partial',
        'DELIVERED': 'paid',
        'CONFIRMED': 'confirmed',
    };

    return statusMap[status] || 'pending';
}

function extractUtmFromNotes(type: 'source' | 'campaign', notes?: string): string {
    if (!notes) return '';

    const regex = type === 'source'
        ? /utm[_\s]source[:\s]*([^\n,]+)/i
        : /utm[_\s]campaign[:\s]*([^\n,]+)/i;

    const match = notes.match(regex);
    return match ? match[1].trim() : '';
}

