import { Order, OrderFormat } from '@/types/orders';
import * as XLSX from 'xlsx';
import { exportOrderaaFormat } from './exportOrderaaFormat';
import { exportEasyOrderFormat } from './exportEasyOrderFormat';
import { toast } from 'sonner';

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
 * @param orders - Array of orders to export
 * @param filename - Base filename for the export
 * @param statusLabels - Optional map of status keys to labels (from API)
 */
export function exportOrdersToExcel(
    orders: Order[],
    filename: string = 'orders',
    statusLabels?: Map<string, string>
) {
    if (orders.length === 0) {
        toast.error('لا توجد طلبات لتصديرها');
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
    return exportInArabicFormat(orders, filename, statusLabels);
}

/**
 * Export orders in Arabic format (for internal reporting)
 * This is the original export format with Arabic headers
 * @param orders - Array of orders to export
 * @param filename - Base filename for the export
 * @param statusLabels - Optional map of status keys to labels (from API)
 */
export function exportInArabicFormat(
    orders: Order[],
    filename: string = 'orders',
    statusLabels?: Map<string, string>
) {
    // Transform orders data to Excel format
    const excelData: ExportOrderData[] = orders.map((order) => ({
        'كود الطلب': order.code,
        'اسم العميل': order.customers.name,
        'رقم الهاتف': order.customers.phone_numbers?.join(', ') || '',
        'المحافظة': order.customers.governorate || '',
        'المدينة': order.customers.city || '',
        'المنطقة': order.customers.area || '',
        'العنوان': order.customers.address || '',
        'المنتجات': order.order_products
            .map((op: any) => {
                const product = `${op.products.name}`;
                const size = op.products.size ? ` - ${op.products.size}` : '';
                const color = op.products.color ? ` - ${op.products.color}` : '';
                const quantity = op.quantity ? ` (×${op.quantity})` : '';
                return `${product}${size}${color}${quantity}`;
            })
            .join(', '),
        'السعر الإجمالي': order.totalCost,
        'الحالة': statusLabels?.get(order.status) || getStatusInArabic(order.status),
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
        const products = order.order_products || [];

        const data: any = {
            'FullName': order.customers.name,
            'Phone': order.customers.phone_numbers?.[0] || '',
            'Phone 2': order.customers.phone_numbers?.[1] || '',
            'City': order.customers.city || order.customers.governorate || '',
            'Address': order.customers.address || '',
            'Shipping Cost': order.shippingCost || 0,
            'Note': order.notes || '',
            'Utm Source': order.utmSource || '',
            'Utm Campaign': order.utmCampaign || '',
            'Payment Status': order.paymentStatus || '',
            'Product Name 1': products[0]?.products.name || '',
            'Variant 1': products[0]?.variant || formatVariant(products[0]?.products),
        };

        // Add second product if exists (template only supports 2 products)
        if (products[1]) {
            data['Product Name 2'] = products[1].products.name;
            data['Variant 2'] = products[1].variant || formatVariant(products[1].products);
        }

        return data;
    });
}

function transformOrdersForEasyOrderFormat(orders: Order[]) {
    return orders.map((order) => {
        const products = order.order_products || [];
        const firstProduct = products[0];

        return {
            'ID': order.id.toString(),
            'Status': order.status,
            'FullName': order.customers.name,
            'Phone': order.customers.phone_numbers?.[0] || '',
            'City': order.customers.city || '',
            'Address': order.customers.address || '',
            'Total Cost': order.totalCost,
            'Product Cost': order.totalCost - (order.shippingCost || 0),
            'Shipping Cost': order.shippingCost || 0,
            'Coupon': order.coupon || '',
            'Coupon Discount': order.couponDiscount || 0,
            'Product Name': firstProduct?.products.name || '',
            'Variant': firstProduct?.variant || formatVariant(firstProduct?.products),
            'Quantity': firstProduct?.quantity || 1,
            'SKU': firstProduct?.sku || '',
            'Item Price': firstProduct?.price || 0,
            'CreatedAt': new Date(order.createdAt).toISOString(),
            'Alt Phone': order.customers.phone_numbers?.[1] || '',
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
        'PARTIAL_DELIVERY': 'partial',
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
        NEW_ORDER: 'طلبات جديدة',
        STOPPED: 'وقف التشغيل',
        CALL_AGAIN: 'إعادة اتصال',
        POSTPONED: 'تأجيلات',
        REGISTERED: 'منتسب',
        WAITING_FOR_PAYMENT: 'في انتظار الدفع',
        ATTEMPTED: 'تم المحاولة',
        CONFIRMED: 'تم التأكيد',
        PREPARED: 'تم التحضير',
        RETURNED_DELIVERED: 'مرتجع مسلم',
        REPORTS: 'تقرير',
        SHIPPING: 'في الشحن',
        DELIVERED: 'تم التسليم',
        MISSING: 'طلبات مفقودة',
        PARTIAL_DELIVERY: 'تسليم جزئى',
        CANCELLED: 'تم الإلغاء',
    };

    return statusMap[status] || status;
}

