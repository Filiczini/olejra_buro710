import { Link, useLocation } from 'react-router-dom';

interface SidebarMenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  isExternal?: boolean;
}

export default function SidebarMenuItem({
  icon: Icon,
  label,
  path,
  isExternal,
}: SidebarMenuItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path || location.pathname.startsWith(path + '/');

  const baseClasses =
    'group flex items-center px-3 py-2.5 text-base font-medium transition-colors rounded-md';
  const activeClasses = 'bg-zinc-900 text-white';
  const inactiveClasses = 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50';

  const linkClasses = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  const iconClasses = `mr-3 h-5 w-5 stroke-[1.5] ${isActive ? 'text-white' : ''}`;

  const content = (
    <>
      <Icon className={iconClasses} />
      <span>{label}</span>
    </>
  );

  if (isExternal) {
    return (
      <a href={path} target="_blank" rel="noopener noreferrer" className={linkClasses}>
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
