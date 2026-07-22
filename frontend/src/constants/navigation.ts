import type { LucideIcon } from 'lucide-react';
import { FileText, History, Users, Settings, ExternalLink } from 'lucide-react';

export interface AdminNavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  isExternal?: boolean;
  /** Omit to show to every logged-in role. */
  roles?: Array<'admin' | 'editor'>;
}

export const adminNavItems: AdminNavItem[] = [
  { icon: FileText, label: 'Пости', path: '/admin/posts' },
  { icon: History, label: 'Журнал дій', path: '/admin/logs' },
  { icon: Users, label: 'Користувачі', path: '/admin/users', roles: ['admin'] },
  { icon: Settings, label: 'Налаштування', path: '/admin/settings' },
];

export const adminBottomNavItems: AdminNavItem[] = [
  { icon: ExternalLink, label: 'Перегляд сайту', path: '/', isExternal: true },
];

export interface PublicNavItem {
  label: string;
  path: string;
}

export const publicNavItems: PublicNavItem[] = [
  { label: 'Проєкти', path: '/projects' },
  { label: 'Про бюро', path: '/about' },
  { label: 'Контакти', path: '/contact' },
];
