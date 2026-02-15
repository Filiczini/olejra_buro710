import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';

interface SidebarMenuItemProps {
  icon: string;
  label: string;
  path: string;
  isExternal?: boolean;
}

export default function SidebarMenuItem({ icon, label, path, isExternal }: SidebarMenuItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path || location.pathname.startsWith(path + '/');

  const activeClasses = 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out bg-white/10 text-white border-l-4 border-white';
  const inactiveClasses = 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out text-zinc-400 hover:bg-zinc-800 hover:text-white border-l-4 border-transparent';

  const linkClasses = isActive ? activeClasses : inactiveClasses;

  const content = (
    <>
      <Icon icon={icon} width={20} />
      <span className="font-medium">{label}</span>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={path} className={linkClasses}>
      {content}
    </Link>
  );
}
