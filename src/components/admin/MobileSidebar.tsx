import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../config/translations';
import SidebarMenuItem from './SidebarMenuItem';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { language } = useLanguage();
  const t = translations[language];

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
        className={`fixed left-0 top-0 h-full w-64 bg-zinc-900 text-white flex flex-col z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold tracking-tight">
            BURO 710
            <span className="block text-sm font-normal text-zinc-400">ADMIN</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarMenuItem
            icon="solar:folder-files-linear"
            label={t.navigation.projects}
            path="/admin/dashboard"
          />
          <SidebarMenuItem
            icon="solar:add-circle-linear"
            label={t.navigation.createProject}
            path="/admin/projects/create"
          />
          <SidebarMenuItem
            icon="solar:settings-linear"
            label={t.navigation.settings}
            path="/admin/settings"
          />
          <SidebarMenuItem
            icon="solar:file-text-linear"
            label={t.navigation.activityLog}
            path="/admin/logs"
          />
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <SidebarMenuItem
            icon="solar:globe-linear"
            label={t.navigation.previewSite}
            path="/"
            isExternal
          />
          <SidebarMenuItem
            icon="solar:logout-linear"
            label={t.navigation.logout}
            path="/admin/login"
          />
        </div>
      </aside>
    </>
  );
}
