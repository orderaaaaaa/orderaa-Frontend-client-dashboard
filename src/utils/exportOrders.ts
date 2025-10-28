import { Order } from '@/types/orders';
import * as XLSX from 'xlsx';

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

export function exportOrdersToExcel(orders: Order[], filename: string = 'orders') {
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

