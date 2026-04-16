import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Bell, CheckCheck, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../shared/components/Layout';
import useAuth from '../../shared/hooks/useAuth';
import { getNotifications, markAsRead } from '../../core/api/notificationApi';
import { setUnreadCount } from '../../store/slices/notificationSlice';
import { Notification } from '../../types';

const TYPE_LABELS: Record<string, string> = {
  USER_REGISTERED: 'Welcome',
  STARTUP_CREATED: 'Startup',
  STARTUP_REJECTED: 'Startup',
  INVESTMENT_CREATED: 'Investment',
  INVESTMENT_APPROVED: 'Investment',
  INVESTMENT_REJECTED: 'Investment',
  TEAM_INVITE_SENT: 'Team',
  PAYMENT_SUCCESS: 'Payment',
  PAYMENT_REJECTED: 'Payment',
};

const Notifications: React.FC = () => {
  const { userId } = useAuth();
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    getNotifications(userId)
      .then((res) => {
        const payload = res.data as Notification[] | { data?: Notification[] };
        const data = Array.isArray(payload) ? payload : payload.data || [];
        setNotifications(data);
        dispatch(setUnreadCount(data.filter((notification) => !notification.isRead).length));
      })
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, [dispatch, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id: number): Promise<void> => {
    try {
      await markAsRead(id);
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const unread = notifications.filter((notification) => !notification.isRead);
  let notificationsContent: React.ReactNode;
  if (loading) {
    notificationsContent = (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-16 bg-dark-800 rounded-xl animate-pulse border border-dark-500" />
        ))}
      </div>
    );
  } else if (notifications.length === 0) {
    notificationsContent = (
      <div className="card text-center py-14">
        <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
          <Bell size={24} className="text-gray-500" />
        </div>
        <p className="text-gray-300 font-medium">All caught up!</p>
        <p className="text-gray-500 text-sm mt-1">No notifications yet.</p>
      </div>
    );
  } else {
    notificationsContent = (
      <div className="space-y-2" aria-live="polite" role="list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`card flex items-start justify-between gap-4 transition-all ${
              !notification.isRead ? 'border-l-2 border-l-accent bg-dark-700' : 'opacity-70'
            }`}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  !notification.isRead ? 'bg-accent/15' : 'bg-dark-600'
                }`}
              >
                <Mail
                  size={14}
                  className={!notification.isRead ? 'text-accent-light' : 'text-gray-500'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-relaxed ${
                    !notification.isRead ? 'text-gray-100 font-medium' : 'text-gray-400'
                  }`}
                >
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <p className="text-xs text-gray-600">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  <span className="badge-blue text-xs">
                    {TYPE_LABELS[notification.type] || notification.type}
                  </span>
                </div>
              </div>
            </div>
            {!notification.isRead && (
              <button
                onClick={() => handleMarkRead(notification.id)}
                aria-label="Mark notification as read"
                className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-2.5 shrink-0"
              >
                <CheckCheck size={12} /> Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell size={22} className="text-accent-light" /> Notifications
            </h1>
            {unread.length > 0 && <p className="text-gray-400 text-sm mt-1">{unread.length} unread</p>}
          </div>
        </div>

        {notificationsContent}
      </div>
    </Layout>
  );
};

export default Notifications;
