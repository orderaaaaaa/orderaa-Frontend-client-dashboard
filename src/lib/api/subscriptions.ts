import http from './http';
import {
  Plan,
  ActiveSubscription,
  SubscribeResponse,
} from '@/types/wallet';

export interface SubscribePayload {
  planId: number;
}

export const subscriptionsApi = {
  getPlans: () =>
    http.get<Plan[]>('/plans').then((res) => res.data),

  getActiveSubscription: () =>
    http
      .get<ActiveSubscription | null>('/subscriptions/active')
      .then((res) => res.data),

  subscribe: (payload: SubscribePayload) =>
    http
      .post<SubscribeResponse>('/subscriptions/subscribe', payload)
      .then((res) => res.data),
};
