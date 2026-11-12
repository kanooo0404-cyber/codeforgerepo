import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Box,
  CheckCircle2,
  Compass,
  FileSearch,
  Handshake,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { BrandLogo } from './BrandLogo.jsx';
import { DemoModeBanner } from './DemoModeBanner.jsx';
import { listUserNotifications } from '../services/notificationService.js';
import { listRecoveryRequests } from '../services/recoveryService.js';
import { RECOVERY_STATUS } from '../config/constants.js';

const STUDENT_TOP_NAV = [
  { label: 'Dashboard', to: '/student/dashboard' },
  { label: 'Explore', to: '/student/explore' },
  { label: 'Matches', to: '/student/matches' },
  { label: 'Requests', to: '/student/recovery-requests' },
];

const STUDENT_SIDEBAR = [
  { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Report Lost', to: '/student/report-lost', icon: Search },
  { label: 'Report Found', to: '/student/report-found', icon: PlusCircle },
  { label: 'My Reports', to: '/student/my-reports', icon: Layers },
  { label: 'AI Matches', to: '/student/matches', icon: Sparkles },
  { label: 'Explore', to: '/student/explore', icon: Compass },
  { label: 'Recovery Requests', to: '/student/recovery-requests', icon: Handshake },
  { label: 'Notifications', to: '/student/notifications', icon: Bell },
  { label: 'Profile', to: '/student/profile', icon: User },
  { label: 'Settings', to: '/student/settings', icon: Settings },
];

const ADMIN_TOP_NAV = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Reports', to: '/admin/lost-reports' },
  { label: 'Matches', to: '/admin/matches' },
  { label: 'Requests', to: '/admin/recovery-requests' },
  { label: 'Items', to: '/admin/held-items' },
  { label: 'Users', to: '/admin/users' },
];

const ADMIN_SIDEBAR = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Lost Reports', to: '/admin/lost-reports', icon: FileSearch },
  { label: 'Found Reports', to: '/admin/found-reports', icon: Box },
  { label: 'AI Matches', to: '/admin/matches', icon: Sparkles },
  { label: 'Recovery Requests', to: '/admin/recovery-requests', icon: Handshake, badgeKey: 'pendingReq' },
  { label: 'Verification', to: '/admin/verification', icon: ShieldCheck },
  { label: 'Held Items', to: '/admin/held-items', icon: PackageCheck },
  { label: 'Returned Items', to: '/admin/returned-items', icon: CheckCircle2 },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export function PortalLayout({ children, role = 'student' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingReqCount, setPendingReqCount] = useState(0);

  const isAdmin = role === 'admin';
  const topNav = isAdmin ? ADMIN_TOP_NAV : STUDENT_TOP_NAV;
  const sideNav = isAdmin ? ADMIN_SIDEBAR : STUDENT_SIDEBAR;

  useEffect(() => {
    setMobileOpen(false);
    if (!user?.uid) return;
    listUserNotifications(user.uid)
      .then((items) => setUnreadCount(items.filter((n) => !n.read).length))
      .catch(() => {});

    if (isAdmin) {
      listRecoveryRequests({ isAdmin: true })
        .then((reqs) =>
          setPendingReqCount(
            reqs.filter(
              (r) =>
                r.status !== RECOVERY_STATUS.COMPLETED &&
                r.status !== RECOVERY_STATUS.REJECTED
            ).length
          )
        )
        .catch(() => {});
    }
  }, [user?.uid, isAdmin, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#303BFA] flex flex-col">
      <DemoModeBanner />

      {/* Top Navigation Bar */}
      <header className="w-full px-4 sm:px-8 pt-4 pb-3">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <BrandLogo to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} />
            {isAdmin && (
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium">
                Admin Portal
              </span>
            )}
          </div>

          {/* Center Pill Navbar */}
          <nav className="hidden md:flex items-center gap-1 bg-[#222CD4] p-1.5 rounded-full">
            {topNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-[#11183B] font-semibold shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            <Link
              to={isAdmin ? '/admin/verification' : '/student/notifications'}
              className="relative w-10 h-10 rounded-full bg-[#222CD4] hover:bg-white/20 text-white flex items-center justify-center transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#303BFA]" />
              )}
            </Link>

            <Link
              to={isAdmin ? '/admin/settings' : '/student/profile'}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-[#222CD4] hover:bg-white/20 text-white transition"
            >
              <div className="w-8 h-8 rounded-full bg-[#DDE2FF] text-[#11183B] font-bold text-xs flex items-center justify-center">
                {initials}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-semibold truncate max-w-[110px]">
                  {user?.name || 'User'}
                </div>
                <div className="text-[10px] text-white/70 capitalize">
                  {isAdmin ? 'Admin' : 'Student'}
                </div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 pb-8 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-56 shrink-0 flex-col justify-between pt-14 pb-2">
          <nav className="space-y-1">
            {sideNav.map((item) => {
              const Icon = item.icon;
              const badge =
                item.badgeKey === 'pendingReq' && pendingReqCount > 0
                  ? pendingReqCount
                  : item.to.endsWith('/notifications') && unreadCount > 0
                    ? unreadCount
                    : null;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm transition-all ${
                      isActive
                        ? 'bg-[#DDE2FF] text-[#11183B] font-semibold shadow-sm'
                        : 'text-white/85 hover:bg-white/10 hover:text-white font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-[#11183B]' : 'text-white/80'
                          }`}
                        />
                        <span>{item.label}</span>
                      </span>
                      {badge !== null && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                            isActive
                              ? 'bg-[#303BFA] text-white'
                              : 'bg-white text-[#11183B]'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="px-4 pt-6 border-t border-white/15">
            <p className="font-heading font-bold text-white text-sm">FoundIt.</p>
            <p className="text-xs text-white/70">Campus Lost & Found</p>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-[#11183B]/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-[#303BFA] p-6 flex flex-col justify-between z-10 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <BrandLogo to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-full bg-white/10 text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {sideNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm ${
                            isActive
                              ? 'bg-[#DDE2FF] text-[#11183B] font-semibold'
                              : 'text-white/85 hover:bg-white/10'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
              <button
                onClick={handleLogout}
                className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 text-white text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Right Stage with Iconic FOUND IT Watermark behind Rounded Panel */}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="px-2 sm:px-4 overflow-hidden select-none pointer-events-none">
            <div className="font-display font-extrabold uppercase tracking-tight text-[#F3F6F2] text-[clamp(2.8rem,8.2vw,7.4rem)] leading-[0.82] -mb-3 sm:-mb-5">
              FOUND IT
            </div>
          </div>

          <div className="relative z-10 flex-1 bg-[#F3F6F2] rounded-[28px] shadow-panel p-5 sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
