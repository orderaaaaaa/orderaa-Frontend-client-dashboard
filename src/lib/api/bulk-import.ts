import api from './index';

export type ExcelFormat = 'app' | 'easyorder';

export interface ProductItem {
    name: string;
    variant?: string;
    quantity?: number;
    price?: number;
    sku?: string;
    size?: string;
    color?: string;
    material?: string;
    weight?: string;
    manufactureCompany?: string;
}

export interface OrderRow {
    rowIndex: number;
    fullName: string;
    phone: string;
    altPhone?: string;
    city?: string;
    address: string;
    shippingCost: number;
    products: ProductItem[];
    note?: string;
    utmSource?: string;
    utmCampaign?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    totalCost?: number;
    productCost?: number;
    governorate?: string;
    email?: string;
    coupon?: string;
    couponDiscount?: number;
    externalOrderId?: string;
    referralCode?: string;
}

export interface BulkImportRequest {
    format: ExcelFormat;
    merchantId: number;
    orders: OrderRow[];
}

export interface OrderCreationResult {
    rowIndex: number;
    orderId?: string;
    orderCode?: string;
    status: 'created' | 'failed';
    error?: string;
    details?: string;
}

export interface BulkImportResponse {
    success: boolean;
    data: {
        totalProcessed: number;
        successCount: number;
        failureCount: number;
        createdOrders: OrderCreationResult[];
        failedOrders: OrderCreationResult[];
    };
}

export interface BulkValidateResponse {
    success: boolean;
    data: {
        totalRows: number;
        validCount: number;
        invalidCount: number;
        validOrders: Array<{
            rowIndex: number;
            status: 'valid';
        }>;
        invalidOrders: Array<{
            rowIndex: number;
            errors: string[];
        }>;
    };
}

export async function validateBulkOrders(
    request: BulkImportRequest
): Promise<BulkValidateResponse> {
    const { data } = await api.post<BulkValidateResponse>(
        '/orders/bulk-validate',
        request
    );
    return data;
}


export async function importBulkOrders(
    request: BulkImportRequest
): Promise<BulkImportResponse> {
    const { data } = await api.post<BulkImportResponse>(
        '/orders/bulk-import',
        request
    );
    return data;
}


export function transformToApiFormat(
    validOrders: Array<{ rowIndex: number; data: any }>,
    format: ExcelFormat
): OrderRow[] {
    return validOrders.map((order) => {
        const data = order.data;

        if (format === 'app') {
            return transformAppFormatOrder(data, order.rowIndex);
        } else {
            return transformEasyOrderFormatOrder(data, order.rowIndex);
        }
    });
}


function transformAppFormatOrder(data: any, rowIndex: number): OrderRow {
    const products: ProductItem[] = [];
    for (let i = 1; i <= 20; i++) {
        const productName = data[`Product Name ${i}`];
        if (productName && productName.trim()) {
            products.push({
                name: productName.trim(),
                variant: data[`Variant ${i}`]?.trim() || undefined,
                quantity: 1,
            });
        }
    }

    return {
        rowIndex,
        fullName: data.FullName?.trim() || '',
        phone: data.Phone?.toString().trim() || '',
        altPhone: data['Phone 2']?.toString().trim() || undefined,
        city: data.City?.trim() || undefined,
        address: data.Address?.trim() || '',
        shippingCost: parseFloat(data['Shipping Cost']) || 0,
        products,
        note: data.Note?.trim() || undefined,
        utmSource: data['Utm Source']?.trim() || undefined,
        utmCampaign: data['Utm Campaign']?.trim() || undefined,
        paymentStatus: data['Payment Status']?.trim() || undefined,
    };
}


function transformEasyOrderFormatOrder(data: any, rowIndex: number): OrderRow {
    const products: ProductItem[] = [
        {
            name: data['Product Name']?.trim() || '',
            variant: data.Variant?.trim() || undefined,
            quantity: parseInt(data.Quantity) || 1,
            price: parseFloat(data['Item Price']) || undefined,
            sku: data.SKU?.trim() || undefined,
        },
    ];

    return {
        rowIndex,
        fullName: data.FullName?.trim() || '',
        phone: data.Phone?.toString().trim() || '',
        altPhone: data['Alt Phone']?.toString().trim() || undefined,
        city: data.City?.trim() || undefined,
        address: data.Address?.trim() || '',
        shippingCost: parseFloat(data['Shipping Cost']) || 0,
        totalCost: parseFloat(data['Total Cost']) || undefined,
        productCost: parseFloat(data['Product Cost']) || undefined,
        products,
        note: data.Note?.trim() || undefined,
        utmSource: data['Utm Source']?.trim() || undefined,
        utmCampaign: data['Utm Campaign']?.trim() || undefined,
        paymentStatus: data['Payment Status']?.trim() || undefined,
        paymentMethod: data['Payment Method']?.trim() || undefined,
        email: data.Email?.trim() || undefined,
        coupon: data.Coupon?.trim() || undefined,
        couponDiscount: parseFloat(data['Coupon Discount']) || undefined,
        externalOrderId: data['External Order ID']?.trim() || undefined,
        referralCode: data['Referral Code']?.trim() || undefined,
    };
}

/**
 * Gets merchant ID from user data
 * For now, returns 1. Update this to extract from actual user data
 */
export function getMerchantIdFromUser(userId: number): number {
    // TODO: Implement proper merchant ID extraction
    // This should ideally come from the backend after login
    // For now, we assume merchantId = userId
    return userId;
}

