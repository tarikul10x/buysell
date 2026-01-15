import { Button } from "@/components/ui/button";
import type { User } from "@shared/schema";

interface HeaderProps {
  user?: User;
}

export default function Header({ user }: HeaderProps) {
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="gradient-bg text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-rocket text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-app-name">Gen Z International</h1>
              <p className="text-sm opacity-90">Telegram Mini App</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1">
              <i className="fas fa-user-circle"></i>
              <span className="text-sm" data-testid="text-user-name">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username || 'User'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 bg-white/20 rounded-lg text-white hover:bg-white/30 p-0"
              data-testid="button-notifications"
            >
              <i className="fas fa-bell text-sm"></i>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-8 h-8 bg-white/20 rounded-lg text-white hover:bg-white/30 p-0"
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt text-sm"></i>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
