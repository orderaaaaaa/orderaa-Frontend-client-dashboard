import { SUPPORT_WHATSAPP, buildSupportWhatsAppUrl } from '@/constants/support';

interface SupportWhatsAppButtonProps {
  message: string;
}

export default function SupportWhatsAppButton({
  message,
}: SupportWhatsAppButtonProps) {
  if (!SUPPORT_WHATSAPP) return null;

  return (
    <a
      href={buildSupportWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full text-center border border-primary text-primary py-2.5 rounded-lg transition hover:bg-primary/5"
    >
      تواصل مع الدعم
    </a>
  );
}
