import { AutoConfirmationProvider } from '../types/autoConfirmation';

export const autoConfirmationProviders: AutoConfirmationProvider[] = [
  {
    id: 'VROBO',
    name: 'Vrobo',
    logo: '/Icons/vrobo.jpeg',
    description:
      'منصة ذكاء اصطناعي لتأكيد الطلبات تلقائياً والتواصل مع العملاء',
    isActive: true,
  },
];

export const autoConfirmationSetupSteps: Record<
  AutoConfirmationProvider['id'],
  string[]
> = {
  VROBO: [
    'سجل الدخول إلى لوحة تحكم Vrobo الخاصة بك',
    'انتقل إلى صفحة الإعدادات ثم تبويب "API & Integrations"',
    'انسخ مفتاح API ومعرف الحساب من اللوحة',
    'ألصق البيانات أدناه وفعّل الربط لبدء التأكيد الآلي',
  ],
};
