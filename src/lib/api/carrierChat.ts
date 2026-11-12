import http from './http';
import type { CarrierChatMessage, CarrierChatThread, SendCarrierChatMessageBody } from '@/types/carrierChat';

const carrierChatOrderUrl = (orderId: number): string => `/shipping/carrier-chat/orders/${orderId}`;

export async function getCarrierChatThread(orderId: number): Promise<CarrierChatThread> {
  const { data } = await http.get<CarrierChatThread>(carrierChatOrderUrl(orderId));
  return data;
}

export async function sendCarrierChatMessage(
  orderId: number,
  body: SendCarrierChatMessageBody
): Promise<CarrierChatMessage> {
  const { data } = await http.post<CarrierChatMessage>(`${carrierChatOrderUrl(orderId)}/messages`, body);
  return data;
}

export async function markCarrierChatSeen(orderId: number): Promise<void> {
  await http.post(`${carrierChatOrderUrl(orderId)}/seen`);
}
