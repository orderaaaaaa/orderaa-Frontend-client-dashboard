'use client';

export interface UpdateScannedOrdersStatusParams {
  orderCodes: string[];
  status: string;
}

export interface UpdateScannedOrdersStatusResponse {
  success: boolean;
  updatedCount: number;
}

// TODO: Implement when API endpoint is ready
// export async function updateScannedOrdersStatus(
//   params: UpdateScannedOrdersStatusParams
// ): Promise<UpdateScannedOrdersStatusResponse> {
//   const response = await http.post<UpdateScannedOrdersStatusResponse>(
//     '/orders/bulk-status-update',
//     params
//   );
//   return response.data;
// }
