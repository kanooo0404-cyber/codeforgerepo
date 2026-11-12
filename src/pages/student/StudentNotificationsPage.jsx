import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Sparkles } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  listUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notificationService.js';

export function StudentNotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await listUserNotifications(user.uid);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.uid]);

  const handleOpen = async (notif) => {
    if (!notif.read) {
      await markNotificationRead(notif.id);
    }
    if (notif.link) navigate(notif.link);
    else loadNotifications();
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead(user.uid);
    loadNotifications();
  };

  return (
    <PortalLayout role="student">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B]">
              Notifications
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              SmartFind AI match alerts, TrustLoop requests, and handover updates.
            </p>
          </div>
          {items.some((n) => !n.read) && (
            <button
              onClick={handleMarkAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 hover:bg-[#DDE2FF] text-xs font-semibold text-[#11183B]"
            >
              <CheckCheck className="w-4 h-4 text-[#303BFA]" />
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-card space-y-2">
            <Bell className="w-8 h-8 text-[#303BFA] mx-auto" />
            <h3 className="font-heading font-bold text-lg text-[#11183B]">
              All caught up
            </h3>
            <p className="text-sm text-slate-500">
              You have no notifications yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleOpen(n)}
                className={`w-full text-left rounded-2xl p-4 shadow-card border transition flex items-start gap-3.5 ${
                  n.read
                    ? 'bg-white/75 border-slate-100 opacity-80'
                    : 'bg-white border-[#DDE2FF] hover:border-[#303BFA]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    n.read ? 'bg-slate-100 text-slate-500' : 'bg-[#DDE2FF] text-[#303BFA]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-heading font-bold text-sm text-[#11183B]">
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#303BFA] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
