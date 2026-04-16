import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, MessageSquare, LogOut, User, Sun, Moon } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { logout } from '../../store/slices/authSlice';
import { setUnreadCount } from '../../store/slices/notificationSlice';
import { toggleTheme, selectTheme } from '../../store/slices/themeSlice';
import { getUnreadNotifications } from '../../core/api/notificationApi';
import useAuth from '../hooks/useAuth';
import useNotificationSocket from '../hooks/useNotificationSocket';
import type { RootState } from '../../types';
import type { AppDispatch } from '../../store/store';

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, userId, isFounder, isInvestor, isCoFounder } = useAuth();
  const unreadCount = useSelector((s: RootState) => s.notifications.unreadCount);
  const theme = useSelector(selectTheme);

  // Fetch real count on mount so badge is accurate after page refresh
  useEffect(() => {
    if (!userId) return;
    getUnreadNotifications(userId)
      .then((res) => {
        const payload = res.data as { data?: Array<unknown> } | Array<unknown>;
        const unreadNotifications = Array.isArray(payload) ? payload : payload.data || [];
        dispatch(setUnreadCount(unreadNotifications.length));
      })
      .catch(() => {});
  }, [userId, dispatch]);

  // Increment badge in real-time when a new notification arrives via WebSocket
  const handleNewNotification = useCallback(() => {
    dispatch(setUnreadCount(unreadCount + 1));
  }, [dispatch, unreadCount]);

  useNotificationSocket(userId, handleNewNotification);

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  let dashboardLink = '/admin/dashboard';
  if (isFounder) {
    dashboardLink = '/founder/dashboard';
  } else if (isInvestor) {
    dashboardLink = '/investor/dashboard';
  } else if (isCoFounder) {
    dashboardLink = '/cofounder/dashboard';
  }

  const iconBtn =
    'p-2 rounded-xl text-[#6e6e73] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150';

  return (
    <nav className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-b border-black/6 dark:border-white/6 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <Link to={dashboardLink} className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-[0_1px_4px_rgba(10,132,255,0.4)]">
          <span className="text-white text-xs font-bold tracking-tight">FL</span>
        </div>
        <span className="text-base font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
          FounderLink
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        {/* Theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          aria-label="Toggle theme"
          className={iconBtn}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {(isFounder || isInvestor || isCoFounder) && (
          <>
            <Link to="/notifications" aria-label="View notifications" className={`relative ${iconBtn}`}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#ff3b30] text-white text-[9px] rounded-full flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link to="/messages" aria-label="View messages" className={iconBtn}>
              <MessageSquare size={18} />
            </Link>
          </>
        )}

        <Link to="/profile" aria-label="View profile" className={iconBtn}>
          <User size={18} />
        </Link>

        {user?.email && (
          <span className="text-xs text-[#8e8e93] hidden md:block mx-2 border-l border-black/8 dark:border-white/8 pl-3 font-medium">
            {user.email}
          </span>
        )}

        <button
          onClick={() => setShowLogoutDialog(true)}
          aria-label="Logout"
          title="Sign out"
          className="p-2 rounded-xl text-[#6e6e73] dark:text-[#8e8e93] hover:text-[#ff3b30] dark:hover:text-[#ff453a] hover:bg-[#ff3b30]/8 dark:hover:bg-[#ff453a]/8 transition-all duration-150"
        >
          <LogOut size={18} />
        </button>
      </div>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Sign out of FounderLink?"
        message="You'll need to sign in again to access your account."
        confirmLabel="Yes, sign out"
        cancelLabel="Stay logged in"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </nav>
  );
};

export default Navbar;
