import { Order, formatOrderProductVariant } from '@/types/orders';
import * as XLSX from 'xlsx';

/**
 * Orderaa (App) Format Export Data
 * Matches EXACTLY the orderaa-template (2).xlsx - 14 columns
 */
export interface OrderaaFormatExportData {
    'FullName': string;
    'Phone': string;
    'Phone 2'?: string;
    'City': string;
    'Address': string;
    'Shipping Cost': number;
    'Note'?: string;
    'Utm Source'?: string;
    'Utm Campaign'?: string;
    'Payment Status'?: string;
    'Product Name 1': string;
    'Variant 1'?: string;
    'Product Name 2'?: string;
    'Variant 2'?: string;
}

/**
 * Exports orders in Orderaa (App) format
 * Matches EXACTLY orderaa-template (2).xlsx format (14 columns)
 * Template supports ONLY 2 products per order
 * 
 * IMPORTANT: Column names and order MUST match template exactly for re-import to work
 */
export function exportOrderaaFormat(orders: Order[], filename: string = 'orderaa_orders') {
    const excelData: OrderaaFormatExportData[] = orders.map((order) => {
        const products = order.order_products || [];

        const data: OrderaaFormatExportData = {
            'FullName': order.customers.name,
            'Phone': order.customers.phone_numbers?.[0] || '',
            'Phone 2': order.customers.phone_numbers?.[1] || '',
            'City': order.city || order.customers.city || order.governorate || order.customers.governorate || '',
            'Address': order.address || order.customers.address || '',
            'Shipping Cost': order.shippingCost || 0,
            'Note': order.notes || '',
            'Utm Source': order.utmSource || '',
            'Utm Campaign': order.utmCampaign || '',
            'Payment Status': order.paymentStatus || '',
            'Product Name 1': products[0]?.products.name || '',
            'Variant 1': formatOrderProductVariant(products[0]) || formatVariant(products[0]?.products),
        };

        // Add second product if exists (template only supports 2 products)
        if (products[1]) {
            data['Product Name 2'] = products[1].products.name;
            data['Variant 2'] = formatOrderProductVariant(products[1]) || formatVariant(products[1].products);
        }

        return data;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths (order matches orderaa-template (2).xlsx exactly - 14 columns)
    const columnWidths = [
        { wch: 20 }, // FullName
        { wch: 15 }, // Phone
        { wch: 15 }, // Phone 2
        { wch: 15 }, // City
        { wch: 30 }, // Address
        { wch: 12 }, // Shipping Cost
        { wch: 30 }, // Note
        { wch: 15 }, // Utm Source
        { wch: 15 }, // Utm Campaign
        { wch: 15 }, // Payment Status
        { wch: 25 }, // Product Name 1
        { wch: 20 }, // Variant 1
        { wch: 25 }, // Product Name 2
        { wch: 20 }, // Variant 2
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


