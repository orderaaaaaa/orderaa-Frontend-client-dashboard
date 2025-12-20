export interface StatCardProps {
  title: string;
  count: number;
  iconBgColor: string;
  iconPath: string;
  alt?: string;
  borderColor?: string;
}

export interface StatCardConfig {
  title: string;
  accessLevel: string;
  borderColor?: string;
  iconBgColor: string;
  iconPath: string;
  alt?: string; // Optional alt text
}
