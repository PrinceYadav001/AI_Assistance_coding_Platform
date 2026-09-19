import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, LayoutDashboard, Code2, FileText, User, LogOut, Shield, ChevronRight, Menu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/apiClient';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', path: '/dashboard' },
  { icon: <Code2 className="w-4 h-4" />, label: 'Problems', path: '/problems' },
  { icon: <FileText className="w-4 h-4" />, label: 'Submissions', path: '/submissions' },
  { icon: <User className="w-4 h-4" />, label: 'Profile', path: '/profile' },
  { icon: <Shield className="w-4 h-4" />, label: 'Admin', path: '/admin', adminOnly: true },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || (user?.role === 'admin' || user?.role === 'instructor')
  );

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-60 bg-surface-900 border-r border-surface-600 flex flex-col transform transition-transform duration-200',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-600">
          <div className="p-1.5 bg-accent-600/20 rounded-lg border border-accent-600/30">
            <Brain className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">AI DSA Assessment</p>
            <p className="text-muted text-xs">Practice Lab</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive(item.path)
                  ? 'bg-accent-600/15 text-accent-400 border border-accent-600/20'
                  : 'text-muted hover:text-white hover:bg-surface-700'
              )}
            >
              {item.icon}
              {item.label}
              {isActive(item.path) && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-surface-600 p-3">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent-600/30 border border-accent-600/50 flex items-center justify-center text-accent-400 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-muted text-xs truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted hover:text-error-400 hover:bg-error-500/10 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-surface-900 border-b border-surface-600 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-muted hover:text-white rounded-lg hover:bg-surface-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-400" />
            <span className="font-bold text-white text-sm">AI DSA Assessment</span>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
