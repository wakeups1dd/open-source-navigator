import { Link, useLocation } from 'react-router-dom';
import { Compass, LayoutDashboard, Settings, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-card border-r-[3px] border-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b-[3px] border-foreground">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <Compass className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-mono font-bold text-lg">Compass
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 font-mono font-bold text-sm uppercase',
                    'border-2 border-foreground transition-all duration-150',
                    'hover:-translate-x-0.5 hover:-translate-y-0.5',
                    'active:translate-x-0.5 active:translate-y-0.5',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]'
                      : 'bg-background shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t-[3px] border-foreground">
        <div className="flex items-center gap-3 mb-4">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-10 h-10 border-2 border-foreground"
            />
          ) : (
            <div className="w-10 h-10 bg-muted flex items-center justify-center border-2 border-foreground">
              <User className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-mono font-bold text-sm truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">@{user?.login || 'user'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 font-mono font-bold text-sm uppercase bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
