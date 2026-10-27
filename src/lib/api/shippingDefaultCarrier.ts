import http from '@/lib/api/http';

export interface DefaultCarrierResponse {
  shippingCompanyId: number | null;
}

export interface SetDefaultCarrierRequest {
  shippingCompanyId: number;
}

const DEFAULT_CARRIER_PATH = '/shipping/default-carrier';

export async function getDefaultCarrier(): Promise<DefaultCarrierResponse> {
  const { data } = await http.get<DefaultCarrierResponse>(DEFAULT_CARRIER_PATH);
  return data;
}

export async function setDefaultCarrier(
  body: SetDefaultCarrierRequest
): Promise<DefaultCarrierResponse> {
  const { data } = await http.put<DefaultCarrierResponse>(
    DEFAULT_CARRIER_PATH,
    body
  );
  return data;
}

export async function clearDefaultCarrier(): Promise<DefaultCarrierResponse> {
  const { data } =
    await http.delete<DefaultCarrierResponse>(DEFAULT_CARRIER_PATH);
  return data;
}
