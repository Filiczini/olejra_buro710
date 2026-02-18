import { FileText, History, Users, Settings, ExternalLink } from 'lucide-react';
import SidebarMenuItem from './SidebarMenuItem';

export default function Sidebar() {
  return (
    <aside className="w-72 h-full bg-zinc-950 text-zinc-400 flex flex-col border-r border-zinc-800 flex-shrink-0">
      {/* Logo Section */}
      <div className="p-6">
        <h1 className="text-white text-xl tracking-tight font-semibold">BURO 710</h1>
        <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium mt-1 block">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        <SidebarMenuItem
          icon={FileText}
          label="Пости"
          path="/admin/posts"
        />
        <SidebarMenuItem
          icon={History}
          label="Журнал дій"
          path="/admin/logs"
        />
        <SidebarMenuItem
          icon={Users}
          label="Користувачі"
          path="/admin/users"
        />
        <SidebarMenuItem
          icon={Settings}
          label="Налаштування"
          path="/admin/settings"
        />
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-zinc-900">
        <SidebarMenuItem
          icon={ExternalLink}
          label="Перегляд сайту"
          path="/"
          isExternal
        />
      </div>
    </aside>
  );
}
