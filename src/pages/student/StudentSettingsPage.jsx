import React, { useState } from 'react';
import { Bell, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function StudentSettingsPage() {
  const { user, refreshProfile, logout, isDemoMode } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [notifEnabled, setNotifEnabled] = useState(
    user?.notificationsEnabled ?? true
  );
  const [saving, setSaving] = useState(false);

  const handleToggleNotif = async () => {
    setSaving(true);
    try {
      const next = !notifEnabled;
      setNotifEnabled(next);
      await refreshProfile({ notificationsEnabled: next });
      showToast('Notification preferences updated.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout role="student">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B]">
            Account Settings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Control privacy preferences, alerts, and active session status.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-5">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DDE2FF] text-[#303BFA] flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#11183B]">
                  SmartFind Match &amp; TrustLoop Alerts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive in-app notifications when potential matches or handover updates occur.
                </p>
              </div>
            </div>
            <button
              disabled={saving}
              onClick={handleToggleNotif}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                notifEnabled
                  ? 'bg-[#303BFA] text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {notifEnabled ? 'Enabled' : 'Paused'}
            </button>
          </div>

          <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <h3 className="font-heading font-bold text-sm text-[#11183B]">
                Environment &amp; Role Verification
              </h3>
              <p className="text-slate-600 mt-0.5">
                Signed in as <strong>{user?.email}</strong> ({user?.role}). Mode:{' '}
                <strong>{isDemoMode ? 'Local Demo Mode (Browser Storage)' : 'Connected to Live Firebase'}</strong>.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of FoundIt
            </button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
