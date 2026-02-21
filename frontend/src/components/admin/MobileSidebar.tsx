import { FileText, History, Users, Settings, ExternalLink, X } from 'lucide-react';
import SidebarMenuItem from './SidebarMenuItem';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ease-in-out"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-zinc-950 flex flex-col z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white">
            BURO 710
            <span className="block text-sm font-normal text-zinc-400">ADMIN</span>
          </h1>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Закрити меню"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarMenuItem icon={FileText} label="Пости" path="/admin/posts" />
          <SidebarMenuItem icon={History} label="Журнал дій" path="/admin/logs" />
          <SidebarMenuItem icon={Users} label="Користувачі" path="/admin/users" />
          <SidebarMenuItem icon={Settings} label="Налаштування" path="/admin/settings" />
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-zinc-900 space-y-2">
          <SidebarMenuItem icon={ExternalLink} label="Перегляд сайту" path="/" isExternal />
        </div>
      </aside>
    </>
  );
}
