import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  subtitle,
}) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-600 text-sm">{label}</span>
      <Icon className="w-6 h-6 text-purple-600" />
    </div>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
    {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
  </div>
);
