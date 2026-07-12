import { useNavigate } from 'react-router-dom';
import { User, LogOut, Menu } from 'lucide-react';
import { authService } from '../../services/api';

interface TopBarProps {
  onMobileMenuClick?: () => void;
}

export default function TopBar({ onMobileMenuClick }: TopBarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Cookies are cleared server-side; ignore network errors
    }
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Hamburger Menu - Mobile only */}
        <button
          onClick={onMobileMenuClick}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* User Info */}
        <div className="flex items-center text-gray-500">
          <User className="h-5 w-5 mr-2" />
          <span className="text-base font-medium">admin</span>
        </div>
      </div>

      {/* Right Section */}
      <button
        onClick={handleLogout}
        className="flex items-center text-gray-500 hover:text-red-600 transition-colors text-sm font-medium cursor-pointer"
        aria-label="Logout"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Вийти
      </button>
    </header>
  );
}
