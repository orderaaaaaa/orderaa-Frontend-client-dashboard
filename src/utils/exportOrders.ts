import { Order, OrderFormat } from '@/types/orders';
import * as XLSX from 'xlsx';
import { exportOrderaaFormat } from './exportOrderaaFormat';
import { exportEasyOrderFormat } from './exportEasyOrderFormat';

export interface ExportOrderData {
    'كود الطلب': string;
    'اسم العميل': string;
    'رقم الهاتف': string;
    'المحافظة': string;
    'المدينة': string;
    'المنطقة': string;
    'العنوان': string;
    'المنتجات': string;
    'السعر الإجمالي': number;
    'الحالة': string;
    'عدد المحاولات': number;
    'تاريخ الإنشاء': string;
    'الملاحظات': string;
}

/**
 * Exports orders to Excel with automatic format detection
 * - Detects if orders are mixed formats or single format
 * - Exports each format separately if mixed
 * - Uses appropriate format exporter based on order.format field
 */
export function exportOrdersToExcel(orders: Order[], filename: string = 'orders') {
    if (orders.length === 0) {
        alert('لا توجد طلبات لتصديرها');
        return null;
    }

    // Detect formats in the orders
    const formats = new Set(orders.map(o => o.format));

    // If all orders are the same format, use format-specific exporter
    if (formats.size === 1) {
        const format = Array.from(formats)[0];

        if (format === OrderFormat.APP) {
            return exportOrderaaFormat(orders, filename);
        } else if (format === OrderFormat.EASYORDER) {
            return exportEasyOrderFormat(orders, filename);
        }
    }

    // If mixed formats or unknown, separate them and export to different sheets
    if (formats.size > 1) {
        const appOrders = orders.filter(o => o.format === OrderFormat.APP);
        const easyOrders = orders.filter(o => o.format === OrderFormat.EASYORDER);

        // Create workbook with multiple sheets
        const workbook = XLSX.utils.book_new();

        if (appOrders.length > 0) {
            const appData = transformOrdersForOrderaaFormat(appOrders);
            const appSheet = XLSX.utils.json_to_sheet(appData);
            XLSX.utils.book_append_sheet(workbook, appSheet, 'Orderaa Format');
        }

        if (easyOrders.length > 0) {
            const easyData = transformOrdersForEasyOrderFormat(easyOrders);
            const easySheet = XLSX.utils.json_to_sheet(easyData);
            XLSX.utils.book_append_sheet(workbook, easySheet, 'EasyOrder Format');
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `${filename}_mixed_formats_${timestamp}.xlsx`;

        // Download file
        XLSX.writeFile(workbook, fileName);

        return fileName;
    }

    // Fallback: Use Arabic format for display/reporting
    return exportInArabicFormat(orders, filename);
}

/**
 * Export orders in Arabic format (for internal reporting)
 * This is the original export format with Arabic headers
 */
export function exportInArabicFormat(orders: Order[], filename: string = 'orders') {
    // Transform orders data to Excel format
    const excelData: ExportOrderData[] = orders.map((order) => ({
        'كود الطلب': order.code,
        'اسم العميل': order.customer.name,
        'رقم الهاتف': order.customer.phoneNumber,
        'المحافظة': order.customer.governorate || '',
        'المدينة': order.customer.city || '',
        'المنطقة': order.customer.area || '',
        'العنوان': order.customer.address || '',
        'المنتجات': order.orderProducts
            .map((op: any) => {
                const product = `${op.product.name}`;
                const size = op.product.size ? ` - ${op.product.size}` : '';
                const color = op.product.color ? ` - ${op.product.color}` : '';
                const quantity = op.quantity ? ` (×${op.quantity})` : '';
                return `${product}${size}${color}${quantity}`;
            })
            .join(', '),
        'السعر الإجمالي': order.totalCost,
        'الحالة': getStatusInArabic(order.status),
        'عدد المحاولات': order.numberOfTriesToReach,
        'تاريخ الإنشاء': new Date(order.createdAt).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }),
        'الملاحظات': order.notes || '',
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
        { wch: 15 }, // كود الطلب
        { wch: 20 }, // اسم العميل
        { wch: 15 }, // رقم الهاتف
        { wch: 15 }, // المحافظة
        { wch: 15 }, // المدينة
        { wch: 15 }, // المنطقة
        { wch: 30 }, // العنوان
        { wch: 40 }, // المنتجات
        { wch: 15 }, // السعر الإجمالي
        { wch: 20 }, // الحالة
        { wch: 15 }, // عدد المحاولات
        { wch: 25 }, // تاريخ الإنشاء
        { wch: 30 }, // الملاحظات
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلبات');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${filename}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fileName);

    return fileName;
}

// Helper functions for transforming orders to specific formats
function transformOrdersForOrderaaFormat(orders: Order[]) {
    // Implementation matches exportOrderaaFormat but returns data instead of downloading
    // Template supports ONLY 2 products
    return orders.map((order) => {
        const products = order.orderProducts || [];

        const data: any = {
            'FullName': order.customer.name,
            'Phone': order.customer.phoneNumber,
            'Phone 2': order.customer.altPhone || '',
            'City': order.customer.city || order.customer.governorate || '',
            'Address': order.customer.address || '',
            'Shipping Cost': order.shippingCost || 0,
            'Note': order.notes || '',
            'Utm Source': order.utmSource || '',
            'Utm Campaign': order.utmCampaign || '',
            'Payment Status': order.paymentStatus || '',
            'Product Name 1': products[0]?.product.name || '',
            'Variant 1': products[0]?.variant || formatVariant(products[0]?.product),
        };

        // Add second product if exists (template only supports 2 products)
        if (products[1]) {
            data['Product Name 2'] = products[1].product.name;
            data['Variant 2'] = products[1].variant || formatVariant(products[1].product);
        }

        return data;
    });
}

function transformOrdersForEasyOrderFormat(orders: Order[]) {
    return orders.map((order) => {
        const products = order.orderProducts || [];
        const firstProduct = products[0];

        return {
            'ID': order.id.toString(),
            'Status': order.status,
            'FullName': order.customer.name,
            'Phone': order.customer.phoneNumber,
            'City': order.customer.city || '',
            'Address': order.customer.address || '',
            'Total Cost': order.totalCost,
            'Product Cost': order.totalCost - (order.shippingCost || 0),
            'Shipping Cost': order.shippingCost || 0,
            'Coupon': order.coupon || '',
            'Coupon Discount': order.couponDiscount || 0,
            'Product Name': firstProduct?.product.name || '',
            'Variant': firstProduct?.variant || formatVariant(firstProduct?.product),
            'Quantity': firstProduct?.quantity || 1,
            'SKU': firstProduct?.sku || '',
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
    });
}

function formatVariant(product?: { size?: string; color?: string }): string {
    if (!product) return '';

    const parts: string[] = [];
    if (product.color) parts.push(product.color);
    if (product.size) parts.push(product.size);

    return parts.join(' - ');
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

function getStatusInArabic(status: string): string {
    const statusMap: Record<string, string> = {
        TRIED_TO_REACH_CUSTOMER: 'طلبات جديدة',
        WAITING_FOR_PAYMENT: 'في انتظار الدفع',
        ON_HOLD: 'تأجيلات',
        CALLED_CUSTOMER_AGAIN: 'اعادة اتصال',
        CANCELLED: 'تم الإلغاء',
        CONFIRMED: 'تم التأكيد',
        PREPARED: 'تم التحضير',
        SHIPPED: 'في الشحن',
        RETURNED: 'مرتجع',
        DELIVERED: 'تم التسليم',
        DOWN_PAYMENT: 'دفعة مقدمة',
        MISSING: 'طلبات مفقودة',
    };

    return statusMap[status] || status;
}

