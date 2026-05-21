import { Order } from '@/types/orders';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export interface ExportOrderData {
    'كود الطلب': string;
    'كود شركة الشحن': string;
    'اسم العميل': string;
    'رقم الهاتف': string;
    'المحافظة': string;
    'المنطقة': string;
    'العنوان': string;
    'المنتجات': string;
    'السعر الإجمالي': number;
    'الحالة': string;
    'عدد المحاولات': number;
    'تاريخ الإنشاء': string;
    'الملاحظات': string;
    'سبب الإلغاء': string;
    'ملاحظات الإلغاء': string;
}

export function exportOrdersToExcel(
    orders: Order[],
    filename: string = 'orders',
    statusLabels: Map<string, string>
) {
    if (orders.length === 0) {
        toast.error('لا توجد طلبات لتصديرها');
        return null;
    }

    return exportInArabicFormat(orders, filename, statusLabels);
}

export function exportInArabicFormat(
    orders: Order[],
    filename: string = 'orders',
    statusLabels: Map<string, string>
) {
    const excelData: ExportOrderData[] = orders.map((order) => ({
        'كود الطلب': order.code,
        'كود شركة الشحن': order.shippingId || '',
        'الحالة': statusLabels.get(order.status) || order.status,
        'اسم العميل': order.customers.name,
        'رقم الهاتف': order.customers.phone_numbers?.join(', ') || '',
        'المحافظة': order.governorate || order.customers.governorate || order.externalGovernorate || '',
        'المنطقة': order.city || order.customers.area || order.customers.city || '',
        'العنوان': order.address || order.customers.address || '',
        'المنتجات': order.order_products
            .map((op: any) => {
                const product = `${op.products.name}`;
                const sku = op.sku || op.products.sku;
                const skuText = sku ? ` [SKU: ${sku}]` : '';
                const size = op.products.size ? ` - ${op.products.size}` : '';
                const color = op.products.color ? ` - ${op.products.color}` : '';
                const quantity = op.quantity ? ` (×${op.quantity})` : '';
                return `${product}${skuText}${size}${color}${quantity}`;
            })
            .join(', '),
        'السعر الإجمالي': order.totalCost,
        'عدد المحاولات': order.numberOfTriesToReach,
        'تاريخ الإنشاء': (() => {
            const d = new Date(order.createdAt);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        })(),
        'الملاحظات': order.notes || '',
        'سبب الإلغاء': order.cancelReason || '',
        'ملاحظات الإلغاء': order.cancelNotes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const columnWidths = [
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 30 },
        { wch: 40 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 25 },
        { wch: 30 },
        { wch: 25 },
        { wch: 30 },
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلبات');

    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${filename}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    return fileName;
}
