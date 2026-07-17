import * as XLSX from 'xlsx';

/**
 * Generate App Format Excel template
 */
export function generateAppFormatTemplate(): Blob {
  const headers = [
    'FullName',
    'Phone',
    'Phone 2',
    'City',
    'Address',
    'Shipping Cost',
    'Note',
    'Utm Source',
    'Utm Campaign',
    'Payment Status',
    'Product Name 1',
    'Variant 1',
    'Product Name 2',
    'Variant 2',
  ];

  const sampleData = [
    [
      'أحمد محمد',
      '01012345678',
      '01098765432',
      'القاهرة',
      '١٢٣ شارع الجامعة، مدينة نصر',
      '50',
      'توصيل قبل المغرب',
      'Facebook',
      'Summer Sale',
      'مدفوع',
      'تيشيرت قطن',
      'أزرق - XL',
      'بنطلون جينز',
      'أسود - L',
    ],
    [
      'سارة علي',
      '01123456789',
      '',
      'الإسكندرية',
      '٤٥ شارع البحر، سموحة',
      '60',
      '',
      'Instagram',
      'New Arrival',
      'غير مدفوع',
      'فستان صيفي',
      'أحمر - M',
      '',
      '',
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  // Set column widths
  const colWidths = headers.map(() => ({ wch: 20 }));
  worksheet['!cols'] = colWidths;

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Generate Settlement template for bulk settlement uploads
 */
export function generateSettlementTemplate(): Blob {
  const headers = [
    'orderCode',
    'shippingCompanyCode',
    'settlementAmount',
    'targetStatus',
  ];

  const sampleData = [
    ['ORD-123', '', '-15', 'COLLECTED'],
    ['', 'SHIP-ABC-999', '120.50', 'RETURNED_SETTLED'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Settlement');

  // Set column widths
  const colWidths = headers.map(() => ({ wch: 22 }));
  worksheet['!cols'] = colWidths;

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Generate EasyOrder Format Excel template
 */
export function generateEasyOrderFormatTemplate(): Blob {
  const headers = [
    'ID',
    'Status',
    'FullName',
    'Phone',
    'City',
    'Address',
    'Total Cost',
    'Product Cost',
    'Shipping Cost',
    'Coupon',
    'Coupon Discount',
    'Product Name',
    'Variant',
    'Quantity',
    'SKU',
    'Item Price',
    'CreatedAt',
    'Extra Data',
    'Extra Data2',
    'Alt Phone',
    'Note',
    'Ref',
    'Utm Source',
    'Utm Campaign',
    'Payment Method',
    'Payment Status',
    'Funnel ID',
    'Order ID',
    'Referral Code',
    'External Order ID',
  ];

  const sampleData = [
    [
      '1001',
      'pending',
      'أحمد محمد',
      '01012345678',
      'القاهرة',
      '١٢٣ شارع الجامعة، مدينة نصر',
      '350',
      '300',
      '50',
      'SUMMER20',
      '20',
      'تيشيرت قطن',
      'أزرق - XL',
      '2',
      'TSH-001-BLU-XL',
      '150',
      '2024-01-15',
      '',
      '',
      '01098765432',
      'توصيل قبل المغرب',
      'FB-123',
      'Facebook',
      'Summer Sale',
      'Cash',
      'مدفوع',
      'F001',
      'ORD-1001',
      'REF-ABC',
      'EXT-5001',
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  // Set column widths
  const colWidths = headers.map(() => ({ wch: 18 }));
  worksheet['!cols'] = colWidths;

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

