export const CARRIER_CHAT_ORIGIN = {
  CARRIER: 'CARRIER',
  MERCHANT: 'MERCHANT',
} as const;

export type CarrierChatOrigin = (typeof CARRIER_CHAT_ORIGIN)[keyof typeof CARRIER_CHAT_ORIGIN];

export type CarrierChatSendState = 'PENDING' | 'SENT' | 'FAILED';

export type CarrierChatDisplaySendState = CarrierChatSendState | 'SENDING';

export const CARRIER_CHAT_SEND_ERROR = {
  CARRIER_REFUSED: 'CARRIER_REFUSED',
  NOT_FOUND: 'NOT_FOUND',
  AUTH: 'AUTH',
  REJECTED: 'REJECTED',
  UNREACHABLE: 'UNREACHABLE',
  UNCONFIRMED: 'UNCONFIRMED',
} as const;

export type CarrierChatSendError = (typeof CARRIER_CHAT_SEND_ERROR)[keyof typeof CARRIER_CHAT_SEND_ERROR];

export interface CarrierChatFile {
  url: string;
  name: string;
  size: number | null;
  type: string | null;
}

export interface CarrierChatLocation {
  latitude: number;
  longitude: number;
}

export interface CarrierChatSentBy {
  employeeName: string | null;
}

export interface CarrierChatMessage {
  key: string;
  origin: CarrierChatOrigin;
  text: string;
  senderName: string | null;
  sentAt: string | null;
  dayKey: string | null;
  file: CarrierChatFile | null;
  attachmentName: string | null;
  location: CarrierChatLocation | null;
  sentBy: CarrierChatSentBy | null;
  sendState: CarrierChatDisplaySendState | null;
  error: CarrierChatSendError | null;
  logId: number | null;
  retryable: boolean;
  retried: boolean;
}

export interface CarrierChatRoomThread {
  orderId: number;
  shippingCode: string;
  carrierCanSend: boolean;
  carrierSendBlockReason: CarrierChatSendBlockReason | null;
  messages: CarrierChatMessage[];
  syncedAt: string;
}

export interface CarrierChatThread extends CarrierChatRoomThread {
  firstUnreadKey: string | null;
}

export interface SendCarrierChatMessageBody {
  text: string;
  retryOfLogId?: number;
}

export interface CarrierChatErrorBody {
  statusCode: number;
  code: CarrierChatErrorCode;
  message: string;
}

export const CARRIER_CHAT_ERROR_CODES = {
  NOT_AVAILABLE: 'CARRIER_CHAT_NOT_AVAILABLE',
  TEXT_INVALID: 'CARRIER_CHAT_TEXT_INVALID',
  SEND_IN_FLIGHT: 'CARRIER_CHAT_SEND_IN_FLIGHT',
  SEND_NOT_FOUND: 'CARRIER_CHAT_SEND_NOT_FOUND',
  RETRY_NOT_ALLOWED: 'CARRIER_CHAT_RETRY_NOT_ALLOWED',
  AUTH_FAILED: 'CARRIER_CHAT_AUTH_FAILED',
  UNREACHABLE: 'CARRIER_CHAT_UNREACHABLE',
  INVALID_PAYLOAD: 'CARRIER_CHAT_INVALID_PAYLOAD',
  TOO_MANY_ROOMS: 'CARRIER_CHAT_TOO_MANY_ROOMS',
} as const;

export type CarrierChatErrorCode = (typeof CARRIER_CHAT_ERROR_CODES)[keyof typeof CARRIER_CHAT_ERROR_CODES];

export const CARRIER_CHAT_SEND_BLOCK_REASON = {
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  AWAITING_CARRIER_ACCEPTANCE: 'AWAITING_CARRIER_ACCEPTANCE',
  PAST_WINDOW: 'PAST_WINDOW',
} as const;

export type CarrierChatSendBlockReason = (typeof CARRIER_CHAT_SEND_BLOCK_REASON)[keyof typeof CARRIER_CHAT_SEND_BLOCK_REASON];

export const CARRIER_CHAT_ACCESS_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  MERCHANT_PAUSED: 'MERCHANT_PAUSED',
} as const;

export type CarrierChatAccessCode = (typeof CARRIER_CHAT_ACCESS_CODES)[keyof typeof CARRIER_CHAT_ACCESS_CODES];

export const CARRIER_CHAT_EVENTS = {
  JOIN: 'chat:join',
  LEAVE: 'chat:leave',
  PAGE_JOIN: 'page:join',
  PAGE_LEAVE: 'page:leave',
  THREAD: 'chat:thread',
  ACTIVITY: 'chat:activity',
  STATUS: 'chat:status',
} as const;

export const CARRIER_CHAT_SOCKET_STATE = {
  OK: 'OK',
  DEGRADED: 'DEGRADED',
  AUTH_FAILED: 'AUTH_FAILED',
  REVOKED: 'REVOKED',
} as const;

export type CarrierChatSocketState = (typeof CARRIER_CHAT_SOCKET_STATE)[keyof typeof CARRIER_CHAT_SOCKET_STATE];

export interface CarrierChatThreadEvent {
  orderId: number;
  thread: CarrierChatRoomThread;
}

export interface CarrierChatActivityEvent {
  orderId: number;
}

export interface CarrierChatStatusEvent {
  orderId?: number;
  state: CarrierChatSocketState;
  code?: string;
}

export type CarrierChatAck = { ok: true } | { ok: false; code: string };
