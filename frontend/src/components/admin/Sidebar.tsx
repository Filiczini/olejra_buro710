import { adminNavItems, adminBottomNavItems } from '../../constants/navigation';
import SidebarMenuItem from './SidebarMenuItem';

interface SidebarProps {
  role?: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const visibleNavItems = adminNavItems.filter(
    (item) => !item.roles || item.roles.includes(role as 'admin' | 'editor')
  );

  return (
    <aside className="w-72 h-full bg-zinc-950 text-zinc-400 flex flex-col border-r border-zinc-800 flex-shrink-0">
      {/* Logo Section */}
      <div className="p-6">
        <h1 className="text-white text-xl tracking-tight font-semibold">BURO 710</h1>
        <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium mt-1 block">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {visibleNavItems.map((item) => (
          <SidebarMenuItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isExternal={item.isExternal}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-zinc-900">
        {adminBottomNavItems.map((item) => (
          <SidebarMenuItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isExternal={item.isExternal}
          />
        ))}
      </div>
    </aside>
  );
}
